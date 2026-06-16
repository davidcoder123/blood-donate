const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const Notification = require('../models/Notification');
const { sendApprovalEmail } = require('../utils/email');

router.use(protect, restrictTo('admin'));

// GET dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [totalDonors, activeHospitals, pendingHospitals, openRequests] = await Promise.all([
      User.countDocuments({ role: 'donor', status: 'active' }),
      User.countDocuments({ role: 'hospital', status: 'active' }),
      User.countDocuments({ role: 'hospital', status: 'pending' }),
      BloodRequest.countDocuments({ status: 'open' })
    ]);
    res.json({ totalDonors, activeHospitals, pendingHospitals, openRequests });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

// GET pending hospital registrations
router.get('/hospitals/pending', async (req, res) => {
  try {
    const hospitals = await User.find({ role: 'hospital', status: 'pending' }).sort({ createdAt: -1 });
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch.' });
  }
});

// GET all hospitals
router.get('/hospitals', async (req, res) => {
  try {
    const hospitals = await User.find({ role: 'hospital' }).sort({ createdAt: -1 });
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch.' });
  }
});

// GET all donors
router.get('/donors', async (req, res) => {
  try {
    const donors = await User.find({ role: 'donor' }).sort({ createdAt: -1 });
    res.json(donors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch.' });
  }
});

// PATCH approve or reject hospital
router.patch('/hospitals/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // 'active' or 'rejected'
    const hospital = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'hospital' },
      { status },
      { new: true }
    );
    if (!hospital) return res.status(404).json({ error: 'Hospital not found.' });

    // Save notification
    await Notification.create({
      user: hospital._id,
      title: status === 'active' ? 'Account Approved!' : 'Account Rejected',
      message: status === 'active'
        ? 'Your hospital account is approved. You can now post blood requests.'
        : 'Your account was rejected. Contact support.',
      type: 'hospital_approved'
    });

    // Send email
    await sendApprovalEmail(hospital, status === 'active');

    res.json({ message: `Hospital ${status === 'active' ? 'approved' : 'rejected'} successfully.` });
  } catch (err) {
    res.status(500).json({ error: 'Action failed.' });
  }
});
// GET all blood requests
router.get('/requests', async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate('hospital', 'hospitalName city state phone')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests.' });
  }
});

module.exports = router;
