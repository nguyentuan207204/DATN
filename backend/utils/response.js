/**
 * Utility helpers for standardized API responses
 */

/**
 * Send a success response
 * @param {Response} res - Express response object
 * @param {any} data - Response payload
 * @param {string} message - Optional message
 * @param {number} statusCode - HTTP status code (default 200)
 */
export const sendSuccess = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response
 * @param {Response} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default 500)
 */
export const sendError = (res, message = "Internal Server Error", statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

/**
 * Send a paginated response
 * @param {Response} res - Express response object
 * @param {Array} data - Array of items
 * @param {number} total - Total item count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 */
export const sendPaginated = (res, data, total, page, limit) => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};
