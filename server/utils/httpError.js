class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    Object.assign(this, extra);
  }
}

module.exports = { HttpError };
