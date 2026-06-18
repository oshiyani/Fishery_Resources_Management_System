const License   = require('../models/License');
const Fisherman = require('../models/Fisherman');

// Auto-generate license number
const generateLicenseNo = () => {
  const yr  = new Date().getFullYear();
  const rnd = Math.floor(Math.random() * 90000) + 10000;
  return `FRMS-${yr}-${rnd}`;
};

// GET ALL
exports.getLicenses = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'fisherman') query.fisherman = req.user._id;
    const licenses = await License.find(query)
      .populate('fisherman', 'name email')
      .sort({ createdAt: -1 });
    res.json(licenses);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET ONE
exports.getLicense = async (req, res) => {
  try {
    const license = await License.findById(req.params.id)
      .populate('fisherman', 'name email');
    if (!license) return res.status(404).json({ message: 'License not found' });
    res.json(license);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// CREATE — fisherman applies (pending) OR admin creates (approved directly)
exports.createLicense = async (req, res) => {
  try {
    const { fisherman, licenseType, zone, validFrom, validTo, isDefault } = req.body;

    // Admin can assign license to any fisherman directly as approved
    const assignedTo = (req.user.role === 'admin' || req.user.role === 'officer')
      ? fisherman
      : req.user._id;

    const status = (req.user.role === 'admin' && isDefault) ? 'approved' : 'pending';

    const license = await License.create({
      fisherman:   assignedTo,
      licenseNo:   generateLicenseNo(),
      licenseType,
      zone,
      validFrom,
      validTo,
      status,
      isDefault:   isDefault || false,
    });

    const populated = await License.findById(license._id)
      .populate('fisherman', 'name email');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// UPDATE STATUS (approve/reject)
exports.updateLicense = async (req, res) => {
  try {
    const license = await License.findById(req.params.id);
    if (!license) return res.status(404).json({ message: 'License not found' });
    Object.assign(license, req.body);
    await license.save();
    const populated = await License.findById(license._id)
      .populate('fisherman', 'name email');
    res.json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// DELETE
exports.deleteLicense = async (req, res) => {
  try {
    await License.findByIdAndDelete(req.params.id);
    res.json({ message: 'License deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};