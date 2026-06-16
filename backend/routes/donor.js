const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');

// All routes require login + donor role
router.use(protect, restrictTo('donor'));

// GET open blood requests matching donor's blood group and location
router.get('/requests', async (req, res) => {
  try {
    const donor = req.user;

   // Block donor from seeing requests if in 90-day cooldown
    if (donor.eligibilityBlock && new Date() < new Date(donor.eligibilityBlock)) {
      return res.json([]); // return empty list
    }

    const filter = {
      status: 'open',
      bloodGroup: donor.bloodGroup,
      expiresAt: { $gt: new Date() }
    };

    if (donor.location && donor.location.coordinates &&
        donor.location.coordinates[0] !== 0 && donor.location.coordinates[1] !== 0) {

      const allMatchingRequests = await BloodRequest.find(filter)
        .populate('hospital', 'hospitalName city state phone location')
        .sort({ createdAt: -1 });

      const nearbyRequests = allMatchingRequests.filter(req => {
        const hospital = req.hospital;
        if (!hospital?.location?.coordinates) return true;

        const [hLng, hLat] = hospital.location.coordinates;
        const [dLng, dLat] = donor.location.coordinates;

        const R = 6371;
        const dLatR = (dLat - hLat) * Math.PI / 180;
        const dLngR = (dLng - hLng) * Math.PI / 180;
        const a = Math.sin(dLatR/2) * Math.sin(dLatR/2) +
                  Math.cos(hLat * Math.PI/180) * Math.cos(dLat * Math.PI/180) *
                  Math.sin(dLngR/2) * Math.sin(dLngR/2);
        const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return distance <= (req.radiusKm || 50);
      });

      return res.json(nearbyRequests);
    }

    const requests = await BloodRequest.find(filter)
      .populate('hospital', 'hospitalName city state phone')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests.' });
  }
});

// POST respond to a blood request
router.post('/requests/:id/respond', async (req, res) => {
  try {
    const { accept } = req.body;
    const request = await BloodRequest.findById(req.params.id)
      .populate('hospital', 'hospitalName city phone');

    if (!request) return res.status(404).json({ error: 'Request not found.' });
    if (request.status !== 'open') return res.status(400).json({ error: 'This request is no longer open.' });

    const alreadyResponded = request.responses.some(
      r => r.donor.toString() === req.user._id.toString()
    );
    if (alreadyResponded) return res.status(400).json({ error: 'You already responded to this request.' });

    request.responses.push({
      donor: req.user._id,
      status: accept ? 'accepted' : 'declined'
    });

    if (accept) {
      request.donorsAccepted = (request.donorsAccepted || 0) + 1;
    }

    await request.save();

    // Only notify hospital if donor accepted
    if (accept) {
      const io = req.app.get('io');
      const connectedUsers = req.app.get('connectedUsers');
      const hospitalSocketId = connectedUsers[request.hospital._id.toString()];
      if (hospitalSocketId) {
        io.to(hospitalSocketId).emit('donor_responded', {
          donorName: req.user.name,
          bloodGroup: req.user.bloodGroup,
          status: 'accepted',
          requestId: request._id
        });
      }
    }

    res.json({ message: accept ? 'You accepted the request!' : 'Request declined.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to respond.' });
  }
});

// GET donor's response history
router.get('/history', async (req, res) => {
  try {
    const requests = await BloodRequest.find({
      'responses.donor': req.user._id
    }).populate('hospital', 'hospitalName city');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

// PATCH toggle availability
router.patch('/availability', async (req, res) => {
  try {
    req.user.available = req.body.available;
    await req.user.save();
    res.json({ available: req.user.available });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update availability.' });
  }
});

// GET donor profile
router.get('/profile', (req, res) => res.json(req.user));

module.exports = router;