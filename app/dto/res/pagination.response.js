class PaginationResponse {
  constructor(page, limit, nextUrl = null) {
    this.page = page;
    this.limit = limit;
    this.nextUrl = nextUrl;
  }

  static create(page, limit, baseUrl, totalItems) {
    let nextUrl = null;

    if (page * limit < totalItems) {
      nextUrl = `${baseUrl}?page=${page + 1}&limit=${limit}`;
    }

    return new PaginationResponse(page, limit, nextUrl);
  }
}

module.exports = PaginationResponse;
