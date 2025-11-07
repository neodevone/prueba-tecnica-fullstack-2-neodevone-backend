const Program = require('../models/Program');

exports.getPrograms = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = req.query.filter || '';

    const query = filter ? { 
      $or: [
        { name: { $regex: filter, $options: 'i' } },
        { description: { $regex: filter, $options: 'i' } }
      ]
    } : {};

    const [programs, total] = await Promise.all([
      Program.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Program.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        items: programs,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getProgram = async (req, res, next) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found',
      });
    }

    res.json({
      success: true,
      data: program,
    });
  } catch (error) {
    next(error);
  }
};

exports.createProgram = async (req, res, next) => {
  try {
    const program = await Program.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Program created successfully',
      data: program,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProgram = async (req, res, next) => {
  try {
    const program = await Program.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found',
      });
    }

    res.json({
      success: true,
      message: 'Program updated successfully',
      data: program,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProgram = async (req, res, next) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found',
      });
    }

    res.json({
      success: true,
      message: 'Program deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};