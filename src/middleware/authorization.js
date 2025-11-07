// middleware/authorization.js

// Middleware que permite admin O usuario actualizando su propio perfil
const canUpdateUser = (req, res, next) => {
  const { id } = req.params;
  const { user } = req;
  
  if (user.role === 'admin' || user._id.toString() === id) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Access denied',
  });
};

module.exports = { canUpdateUser };