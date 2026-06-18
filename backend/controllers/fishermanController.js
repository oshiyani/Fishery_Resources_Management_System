const Fisherman = require('../models/Fisherman');

// Get all fishermen
exports.getAllFishermen = async (req, res) => {
  try {
    const fishermen = await Fisherman.find().sort({ createdAt: -1 });
    res.json(fishermen);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get my profile (fisherman)
exports.getMyProfile = async (req, res) => {
  try {
    const fisherman = await Fisherman.findOne({ user: req.user._id });
    res.json(fisherman);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Register fisherman
exports.registerFisherman = async (req, res) => {
  try {
    const exists = await Fisherman.findOne({ idNumber: req.body.idNumber });
    if (exists) return res.status(400).json({ message: 'ID number already registered' });
    const fisherman = await Fisherman.create({ ...req.body, user: req.user._id });
    res.status(201).json(fisherman);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Update status (officer/admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const fisherman = await Fisherman.findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason },
      { new: true }
    );
    if (!fisherman) return res.status(404).json({ message: 'Fisherman not found' });
    res.json(fisherman);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Delete fisherman (admin)
exports.deleteFisherman = async (req, res) => {
  try {
    await Fisherman.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fisherman deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};