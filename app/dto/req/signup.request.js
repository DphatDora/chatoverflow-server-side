class SignupInitiateRequest {
  constructor(name, nickName, email, password) {
    this.name = name;
    this.nickName = nickName;
    this.email = email;
    this.password = password;
  }

  validate() {
    const errors = [];

    // Validate name
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name must not be empty');
    } else if (this.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (this.name.trim().length > 50) {
      errors.push('Name must not exceed 50 characters');
    }

    // Validate nickName
    if (!this.nickName || this.nickName.trim().length === 0) {
      errors.push('Display name must not be empty');
    } else if (this.nickName.trim().length < 3) {
      errors.push('Display name must be at least 3 characters long');
    } else if (this.nickName.trim().length > 20) {
      errors.push('Display name must not exceed 20 characters');
    } else if (!/^[a-zA-Z0-9_]+$/.test(this.nickName.trim())) {
      errors.push(
        'Display name must contain only letters, numbers, and underscores'
      );
    }

    // Validate email
    if (!this.email || this.email.trim().length === 0) {
      errors.push('Email must not be empty');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
      errors.push('Email is not valid');
    }

    // Validate password
    if (!this.password || this.password.length === 0) {
      errors.push('Password must not be empty');
    } else if (this.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    } else if (this.password.length > 100) {
      errors.push('Password must not exceed 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Clean data before processing
  sanitize() {
    return {
      name: this.name?.trim(),
      nickName: this.nickName?.trim(),
      email: this.email?.trim().toLowerCase(),
      password: this.password,
    };
  }
}

class SignupVerifyRequest {
  constructor(email, otp) {
    this.email = email;
    this.otp = otp;
  }

  validate() {
    const errors = [];

    // Validate email
    if (!this.email || this.email.trim().length === 0) {
      errors.push('Email must not be empty');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
      errors.push('Email is not valid');
    }

    // Validate OTP
    if (!this.otp || this.otp.trim().length === 0) {
      errors.push('OTP must not be empty');
    } else if (!/^\d{6}$/.test(this.otp.trim())) {
      errors.push('OTP must be 6 digits');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Clean data before processing
  sanitize() {
    return {
      email: this.email?.trim().toLowerCase(),
      otp: this.otp?.trim(),
    };
  }
}

module.exports = {
  SignupInitiateRequest,
  SignupVerifyRequest,
};
