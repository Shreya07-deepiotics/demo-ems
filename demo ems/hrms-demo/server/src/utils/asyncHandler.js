/**
 * Wraps an async route handler and forwards any thrown errors to Express's
 * next() function, so the centralised error handler picks them up.
 *
 * Usage:  router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
