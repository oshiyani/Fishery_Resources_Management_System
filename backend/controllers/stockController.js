const FishStock = require('../models/FishStock');

exports.getAllStock = async (req, res) => {
  try {
    const stocks = await FishStock.find()
      .populate('surveyedBy', 'name')
      .sort({ status: 1, updatedAt: -1 });
    res.json(stocks);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addStock = async (req, res) => {
  try {
    // Check if same species+zone already exists
    const exists = await FishStock.findOne({
      species: req.body.species,
      zone: req.body.zone,
    });
    if (exists) return res.status(400).json({
      message: `Stock for ${req.body.species} in ${req.body.zone} already exists. Please update it instead.`
    });

    const stock = await FishStock.create({
      ...req.body,
      surveyedBy: req.user._id,
      lastSurveyDate: new Date(),
    });
    res.status(201).json(stock);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateStock = async (req, res) => {
  try {
    const stock = await FishStock.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        surveyedBy: req.user._id,
        lastSurveyDate: new Date(),
      },
      { new: true, runValidators: true }
    ).populate('surveyedBy', 'name');
    if (!stock) return res.status(404).json({ message: 'Stock record not found' });
    res.json(stock);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteStock = async (req, res) => {
  try {
    await FishStock.findByIdAndDelete(req.params.id);
    res.json({ message: 'Stock record deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};