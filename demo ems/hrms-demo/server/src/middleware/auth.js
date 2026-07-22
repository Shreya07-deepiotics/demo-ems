import jwt from 'jsonwebtoken';
import Employee from '../models/Employee.js';
import { sendError } from '../utils/ApiResponse.js';

/**
 * Verifies the JWT sent either as a Bearer token in the Authorization header
 * OR as an httpOnly cookie named "token".
 * Attaches the full employee document (minus password) to req.user.
 */
const auth = async (req, res, next) => {
  let token;

  // 1. Check Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Fall back to httpOnly cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return sendError(res, 'Not authenticated — no token provided', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch fresh user from DB so role/status changes take effect immediately
    const user = await Employee.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 'User belonging to this token no longer exists', 401);
    }
    if (user.accountStatus !== 'approved') {
      return sendError(res, 'Account is not approved. Contact admin.', 403);
    }
    req.user = user;
    next();
  } catch (err) {
    return sendError(res, 'Invalid or expired token', 401);
  }
};

export default auth;
