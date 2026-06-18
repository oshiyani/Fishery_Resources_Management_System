const CatchReport = require('../models/CatchReport');
const License     = require('../models/License');
const Vessel      = require('../models/Vessel');
const FishStock   = require('../models/FishStock');
const User        = require('../models/User');

exports.getSummaryStats = async (req, res) => {
  try {
    const [
      totalFishermen, totalVessels, totalLicenses,
      totalCatches, pendingLicenses, pendingCatches,
      flaggedCatches, criticalStock, pendingVessels,
    ] = await Promise.all([
      User.countDocuments({ role: 'fisherman' }),
      Vessel.countDocuments(),
      License.countDocuments({ status: 'approved' }),
      CatchReport.countDocuments(),
      License.countDocuments({ status: 'pending' }),
      CatchReport.countDocuments({ status: 'pending' }),
      CatchReport.countDocuments({ warningFlag: true }),
      FishStock.countDocuments({ status: 'critical' }),
      Vessel.countDocuments({ status: 'pending' }),
    ]);
    res.json({
      totalFishermen, totalVessels, totalLicenses,
      totalCatches, pendingLicenses, pendingCatches,
      flaggedCatches, criticalStock, pendingVessels,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getCatchBySpecies = async (req, res) => {
  try {
    const data = await CatchReport.aggregate([
      { $match: { status: 'verified' } },
      { $group: { _id: '$species', totalQuantity: { $sum: '$quantity' }, count: { $sum: 1 } } },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);
    res.json(data.map(d => ({ species: d._id, totalQuantity: d.totalQuantity, count: d.count })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getCatchByZone = async (req, res) => {
  try {
    const data = await CatchReport.aggregate([
      { $group: { _id: '$zone', totalQuantity: { $sum: '$quantity' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(data.map(d => ({ zone: d._id, totalQuantity: d.totalQuantity, count: d.count })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMonthlyTrends = async (req, res) => {
  try {
    const data = await CatchReport.aggregate([
      {
        $group: {
          _id: {
            year:  { $year:  '$catchDate' },
            month: { $month: '$catchDate' },
          },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    res.json(data.map(d => ({
      month: `${months[d._id.month - 1]} ${d._id.year}`,
      totalQuantity: d.totalQuantity,
      count: d.count,
    })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getLicenseStats = async (req, res) => {
  try {
    const data = await License.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    res.json(data.map(d => ({ status: d._id, count: d.count })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const [
      myLicenses, myCatches, myVessels, myVerified, myFlagged,
    ] = await Promise.all([
      License.countDocuments({ fisherman: userId }),
      CatchReport.countDocuments({ fisherman: userId }),
      Vessel.countDocuments({ owner: userId }),
      CatchReport.countDocuments({ fisherman: userId, status: 'verified' }),
      CatchReport.countDocuments({ fisherman: userId, warningFlag: true }),
    ]);

    const catchBySpecies = await CatchReport.aggregate([
      { $match: { fisherman: userId, status: 'verified' } },
      { $group: { _id: '$species', totalQuantity: { $sum: '$quantity' }, count: { $sum: 1 } } },
      { $sort: { totalQuantity: -1 } },
    ]);

    res.json({
      myLicenses, myCatches, myVessels, myVerified, myFlagged,
      catchBySpecies: catchBySpecies.map(d => ({
        species: d._id, totalQuantity: d.totalQuantity, count: d.count,
      })),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};