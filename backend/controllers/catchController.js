const CatchReport = require('../models/CatchReport');
const License = require('../models/License');

const CATCH_LIMITS = { kg: 5000, tons: 5, count: 10000 };

exports.getAllCatches = async (req, res) => {
  try {
    const catches = await CatchReport.find()
      .populate('fisherman', 'name email')
      .populate('license', 'licenseNo zone')
      .populate('vessel', 'vesselName')
      .sort({ createdAt: -1 });
    res.json(catches);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyCatches = async (req, res) => {
  try {
    const catches = await CatchReport.find({ fisherman: req.user._id })
      .populate('license', 'licenseNo zone')
      .populate('vessel', 'vesselName')
      .sort({ createdAt: -1 });
    res.json(catches);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.submitCatch = async (req, res) => {
  try {
    const license = await License.findById(req.body.license);
    if (!license) return res.status(400).json({ message: 'License not found' });
    if (license.status !== 'approved')
      return res.status(400).json({ message: 'You need an approved license to submit catch reports' });
    if (new Date(license.validTo) < new Date())
      return res.status(400).json({ message: 'Your license has expired. Please renew it.' });

    const limit = CATCH_LIMITS[req.body.unit] || 5000;
    const warningFlag = req.body.quantity > limit;
    const warningNote = warningFlag
      ? `Quantity ${req.body.quantity} ${req.body.unit} exceeds allowed limit of ${limit} ${req.body.unit}`
      : '';

    // ✅ FIX: Convert empty string vessel to undefined
    const catchData = {
      ...req.body,
      fisherman: req.user._id,
      vessel: req.body.vessel || undefined,
      warningFlag,
      warningNote,
    };

    const catchReport = await CatchReport.create(catchData);
    res.status(201).json(catchReport);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateCatch = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const catchReport = await CatchReport.findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason, verifiedBy: req.user._id },
      { new: true }
    ).populate('fisherman', 'name email');
    if (!catchReport) return res.status(404).json({ message: 'Catch report not found' });
    res.json(catchReport);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteCatch = async (req, res) => {
  try {
    await CatchReport.findByIdAndDelete(req.params.id);
    res.json({ message: 'Catch report deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};