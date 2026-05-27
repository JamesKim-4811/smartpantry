import { Request, Response, NextFunction } from "express";

// Catches any Error thrown in a route handler and returns a clean JSON response.
// Without this, Express would return an ugly HTML error page.
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  console.error(`[ERROR] ${err.message}`);

  // Validation errors from services (e.g. "name is required") → 400
  const isValidationError =
    err.message.includes("required") ||
    err.message.includes("Missing") ||
    err.message.includes("invalid");

  res.status(isValidationError ? 400 : 500).json({ error: err.message });
}

// Wraps an async route handler so you don't need try/catch in every route.
// Usage: router.get('/', asyncHandler(async (req, res) => { ... }))
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
