const PaginationResponse = require('./pagination.response');

class ApiResponse {
  constructor(success, message, data = null, pagination = null) {
    this.success = success;
    this.message = message;
    this.data = data;

    if (pagination) {
      this.pagination = pagination;
    }
  }

  static success(message, data = null, pagination = null) {
    return new ApiResponse(true, message, data, pagination);
  }

  static error(message, data = null) {
    return new ApiResponse(false, message, data);
  }

  static withPagination(message, data, page, limit, baseUrl, totalItems) {
    const pagination = PaginationResponse.create(
      page,
      limit,
      baseUrl,
      totalItems
    );
    return new ApiResponse(true, message, data, pagination);
  }
}

module.exports = ApiResponse;
