const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const Notification = require('../models/Notification');
const { sendBloodAlert } = require('../utils/email');

router.use(protect, restrictTo('hospital'));

// POST create blood request
router.post('/requests', async (req, res) => {
  try {
    const { bloodGroup, unitsNeeded, urgency, patientName, notes, radiusKm } = req.body;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // expires in 24 hours

    const request = await BloodRequest.create({
      hospital: req.user._id,
      bloodGroup, unitsNeeded,
      urgency: urgency || 'normal',
      patientName, notes,
      radiusKm: radiusKm || 50,
      expiresAt,
      donorsNotified: 0,
      donorsAccepted: 0
    });

    // Find nearby matching donors using MongoDB geo query
    const radiusInRadians = (radiusKm || 50) / 6371; // Earth radius in km
    const matchingDonors = await User.find({
      role: 'donor',
      status: 'active',
      available: true,
      bloodGroup,
      $or: [
        { eligibilityBlock: { $exists: false } },
        { eligibilityBlock: null },
        { eligibilityBlock: { $lt: new Date() } }  // block date has passed
      ],
      location: {
        $geoWithin: {
          $centerSphere: [req.user.location.coordinates, radiusInRadians]
        }
      }
    });
    request.donorsNotified = matchingDonors.length;
    await request.save();

    // Populate hospital info for email
    const populatedReq = await BloodRequest.findById(request._id)
  .populate('hospital', 'hospitalName city state phone location address');

    // Send email + in-app notification to each donor
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');

    for (const donor of matchingDonors) {
      // Save notification to DB
      await Notification.create({
        user: donor._id,
        title: `Urgent ${bloodGroup} Blood Request`,
        message: `${req.user.hospitalName} in ${req.user.city} needs ${bloodGroup} blood urgently.`,
        type: 'blood_request',
        refId: request._id
      });

      // Push real-time notification via Socket.io
      const donorSocketId = connectedUsers[donor._id.toString()];
      if (donorSocketId) {
        io.to(donorSocketId).emit('new_notification', {
          title: `🩸 Urgent ${bloodGroup} Blood Request`,
          message: `${req.user.hospitalName} needs ${bloodGroup} blood. ${unitsNeeded} units.`,
          requestId: request._id
        });
      }

      // Send email (non-blocking)
      sendBloodAlert(donor, populatedReq).catch(console.error);
    }

    res.status(201).json({
      request,
      donorsNotified: matchingDonors.length,
      message: `Request posted! ${matchingDonors.length} donors notified.`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create request.' });
  }
});

// GET hospital's own requests
router.get('/requests', async (req, res) => {
  try {
    const requests = await BloodRequest.find({ hospital: req.user._id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests.' });
  }
});

// GET responses for a specific request
router.get('/requests/:id/responses', async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('responses.donor', 'name bloodGroup phone city available');
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    res.json(request.responses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch responses.' });
  }
});

// PATCH update request status
router.patch('/requests/:id/status', async (req, res) => {
  try {
    const request = await BloodRequest.findOneAndUpdate(
      { _id: req.params.id, hospital: req.user._id },
      { status: req.body.status },
      { new: true }
    );
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

// GET hospital profile
router.get('/profile', (req, res) => res.json(req.user));
// PATCH hospital confirms a donor actually donated
router.patch('/requests/:requestId/confirm-donation/:donorId', async (req, res) => {
  try {
    const request = await BloodRequest.findOne({
      _id: req.params.requestId,
      hospital: req.user._id
    });

    if (!request) return res.status(404).json({ error: 'Request not found.' });

    // Find this donor's response in the array
    const response = request.responses.find(
      r => r.donor.toString() === req.params.donorId
    );

    if (!response) return res.status(404).json({ error: 'Donor response not found.' });
    if (response.status === 'donated') return res.status(400).json({ error: 'Already marked as donated.' });

    // Mark response as donated
    response.status = 'donated';
    response.donatedAt = new Date();
    await request.save();

    // Update donor's eligibility block and donation count
    const today = new Date();
    const blockUntil = new Date(today);
    blockUntil.setDate(blockUntil.getDate() + 90);

    await User.findByIdAndUpdate(req.params.donorId, {
      lastDonated: today,
      $inc: { donationCount: 1 },
      eligibilityBlock: blockUntil
    });

    // Notify donor via socket
    const io = req.app.get('io');
    const connectedUsers = req.app.get('connectedUsers');
    const donorSocketId = connectedUsers[req.params.donorId];
    if (donorSocketId) {
      io.to(donorSocketId).emit('donation_confirmed', {
        message: `${req.user.hospitalName} confirmed your donation. Thank you! You are eligible again after 90 days.`,
        eligibleAfter: blockUntil
      });
    }

    res.json({ message: 'Donation confirmed! Donor blocked for 90 days.', eligibleAfter: blockUntil });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to confirm donation.' });
  }
});
module.exports = router;
