class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);

    // Set the properties
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    // Set the stack trace
    if (stack) {
      this.stack = stack;
    } else {
      // If no stack is provided, capture the stack trace
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
