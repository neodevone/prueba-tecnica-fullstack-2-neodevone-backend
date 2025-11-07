const express = require('express');
const { body } = require('express-validator');
const {
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
} = require('../controllers/programController');
const { auth, adminAuth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.get('/', getPrograms);

router.get('/:id', getProgram);

router.post(
  '/',
  [
    auth,
    adminAuth,
    body('name').notEmpty().withMessage('Program name is required'),
    body('description').notEmpty().withMessage('Program description is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
  ],
  handleValidationErrors,
  createProgram
);

router.put(
  '/:id',
  [
    auth,
    adminAuth,
    body('name').optional().notEmpty().withMessage('Program name cannot be empty'),
    body('description').optional().notEmpty().withMessage('Program description cannot be empty'),
    body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    body('status').optional().isIn(['active', 'inactive', 'completed']).withMessage('Invalid status'),
  ],
  handleValidationErrors,
  updateProgram
);

router.delete('/:id', auth, adminAuth, deleteProgram);

module.exports = router;