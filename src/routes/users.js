const express = require('express');
const { body } = require('express-validator');
const { getUsers, createUser, getUserById, updateUser } = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');
const { canUpdateUser } = require('../middleware/authorization');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// GET todos los usuarios (Admin)
router.get(
  '/',
  auth,
  adminAuth,
  getUsers
);

// GET usuario por ID
router.get(
  '/:id',
  auth,
  getUserById
);

// POST crear usuario (Admin)
router.post(
  '/',
  [
    auth,
    adminAuth,
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('programId').notEmpty().withMessage('Program ID is required'),
  ],
  handleValidationErrors,
  createUser
);

// PUT actualizar usuario
router.put(
  '/:id',
  [
    auth,
    body('fullName').optional().notEmpty().withMessage('Full name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('programId').optional().notEmpty().withMessage('Program ID cannot be empty'),
  ],
  handleValidationErrors,
  canUpdateUser, // middleware importado
  updateUser
);

module.exports = router;