const Token = require('../models/Token');
const Department = require('../models/Department');

// Book a token (patient)
exports.bookToken = async (req, res) => {
  try {
    const { departmentId } = req.body;
    const io = req.app.get('io');

    const dept = await Department.findById(departmentId);
    if (!dept) return res.status(404).json({ message: 'Department not found' });

    // Check if patient already has an active token today
    const today = new Date().setHours(0, 0, 0, 0);
    const existingToken = await Token.findOne({
      patient: req.user._id,
      department: departmentId,
      status: { $in: ['waiting', 'called', 'in-consultation'] },
      date: { $gte: today },
    });
    if (existingToken) {
      return res.status(400).json({ message: 'You already have an active token for this department' });
    }

    // Increment token count
    const updatedDept = await Department.findByIdAndUpdate(
      departmentId,
      { $inc: { totalTokensToday: 1 } },
      { new: true }
    );

    // Calculate estimated wait (5 min per person ahead)
    const waitingAhead = await Token.countDocuments({
      department: departmentId,
      status: 'waiting',
      date: { $gte: today },
    });

    const token = await Token.create({
      tokenNumber: updatedDept.totalTokensToday,
      patient: req.user._id,
      department: departmentId,
      estimatedWait: waitingAhead * 5,
    });

    await token.populate('patient', 'name email phone');
    await token.populate('department', 'name');

    // Emit real-time event to department room
    io.to(departmentId).emit('new-token', {
      token,
      waitingCount: waitingAhead + 1,
    });

    res.status(201).json(token);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all tokens for a department today (doctor/admin)
exports.getDepartmentQueue = async (req, res) => {
  try {
    const today = new Date().setHours(0, 0, 0, 0);
    const tokens = await Token.find({
      department: req.params.departmentId,
      date: { $gte: today },
    })
      .populate('patient', 'name email phone')
      .sort({ tokenNumber: 1 });

    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get patient's own tokens
exports.getMyTokens = async (req, res) => {
  try {
    const tokens = await Token.find({ patient: req.user._id })
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update token status (doctor calls next patient)
exports.updateTokenStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const io = req.app.get('io');

    const token = await Token.findById(req.params.id).populate('department');
    if (!token) return res.status(404).json({ message: 'Token not found' });

    token.status = status;
    if (status === 'called') token.calledAt = new Date();
    if (status === 'completed') token.completedAt = new Date();
    await token.save();

    // If doctor calls a patient, update currentServing in department
    if (status === 'called') {
      await Department.findByIdAndUpdate(token.department._id, {
        currentServing: token.tokenNumber,
      });
    }

    const deptId = token.department._id.toString();

    // Emit real-time update to all in this department room
    io.to(deptId).emit('token-status-update', {
      tokenId: token._id,
      tokenNumber: token.tokenNumber,
      status,
      currentServing: token.tokenNumber,
    });

    res.json(token);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel token (patient cancels own token)
exports.cancelToken = async (req, res) => {
  try {
    const io = req.app.get('io');
    const token = await Token.findById(req.params.id).populate('department');

    if (!token) return res.status(404).json({ message: 'Token not found' });
    if (token.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (['completed', 'cancelled'].includes(token.status)) {
      return res.status(400).json({ message: 'Token already closed' });
    }

    token.status = 'cancelled';
    await token.save();

    io.to(token.department._id.toString()).emit('token-cancelled', {
      tokenId: token._id,
      tokenNumber: token.tokenNumber,
    });

    res.json({ message: 'Token cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};