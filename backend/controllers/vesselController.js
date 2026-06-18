const Vessel = require('../models/Vessel');

exports.getAllVessels = async (req, res) => {
  try {
    const vessels = await Vessel.find().populate('owner', 'name email').sort({ createdAt: -1 });
    res.json(vessels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyVessels = async (req, res) => {
  try {
    const vessels = await Vessel.find({ owner: req.user._id });
    res.json(vessels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.registerVessel = async (req, res) => {
  try {
    const exists = await Vessel.findOne({ vesselId: req.body.vesselId });
    if (exists) return res.status(400).json({ message: 'Vessel ID already registered' });
    const vessel = await Vessel.create({ ...req.body, owner: req.user._id });
    res.status(201).json(vessel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const vessel = await Vessel.findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason },
      { new: true }
    );
    if (!vessel) return res.status(404).json({ message: 'Vessel not found' });
    res.json(vessel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteVessel = async (req, res) => {
  try {
    await Vessel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vessel deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};