const Department = require('../models/Department');

// Create department (admin only)
exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    const dept = await Department.create({ name, description });
    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const depts = await Department.find({ isActive: true });
    res.json(depts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single department with live queue stats
exports.getDepartmentById = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });

    const Token = require('../models/Token');
    const waitingCount = await Token.countDocuments({
      department: req.params.id,
      status: 'waiting',
      date: { $gte: new Date().setHours(0, 0, 0, 0) },
    });

    res.json({ ...dept.toObject(), waitingCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset queue (for end of day — admin/doctor)
exports.resetQueue = async (req, res) => {
  try {
    await Department.findByIdAndUpdate(req.params.id, {
      currentServing: 0,
      totalTokensToday: 0,
    });
    res.json({ message: 'Queue reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};