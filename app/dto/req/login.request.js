class LoginRequest {
  constructor({ email, password }) {
    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.statusCode = 400;
      throw error;
    }
    this.email = email;
    this.password = password;
  }
}

module.exports = LoginRequest;
