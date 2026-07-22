import { validationResult } from 'express-validator';
import { sendError } from '../utils/ApiResponse.js';

/**
 * Reads express-validator results and, if there are errors, returns a 400
 * with a field-level errors array.  Otherwise calls next().
 *
 * Place this as the last item in a route's middleware chain before the controller.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(
      res,
      'Validation failed',
      400,
      errors.array().map(({ path, msg }) => ({ field: path, message: msg }))
    );
  }
  next();
};

export default validate;
