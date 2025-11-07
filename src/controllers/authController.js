const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

const signToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

exports.register = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Para estudiantes, no requerimos programId inicialmente
    const userData = {
      fullName,
      email,
      password,
      role: role || 'student',
      // programId solo si se proporciona (para admin) o se asignará después
    };

    // Si es admin y se proporciona programId, lo incluimos
    if (role === 'admin' && req.body.programId) {
      userData.programId = req.body.programId;
    }

    const user = await User.create(userData);

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email })
      .select('+password')
      .populate('programId', 'name description startDate status'); // ✅ AGREGAR POPULATE

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          programId: user.programId,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('programId', 'name description startDate status'); // ✅ AGREGAR POPULATE

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id, // ✅ AGREGAR ESTO
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          programId: user.programId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};