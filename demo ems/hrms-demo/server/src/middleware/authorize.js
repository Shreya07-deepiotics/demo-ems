import { sendError } from '../utils/ApiResponse.js';

/**
 * Role-based access guard.
 * Usage: authorize('admin', 'hr')
 * Must be placed AFTER the auth middleware.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Not authenticated', 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Role '${req.user.role}' is not authorized to access this resource`,
        403
      );
    }
    next();
  };
};

export default authorize;
