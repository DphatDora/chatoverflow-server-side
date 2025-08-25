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
            errors.push('Tên không được để trống');
        } else if (this.name.trim().length < 2) {
            errors.push('Tên phải có ít nhất 2 ký tự');
        } else if (this.name.trim().length > 50) {
            errors.push('Tên không được vượt quá 50 ký tự');
        }

        // Validate nickName
        if (!this.nickName || this.nickName.trim().length === 0) {
            errors.push('Tên hiển thị không được để trống');
        } else if (this.nickName.trim().length < 3) {
            errors.push('Tên hiển thị phải có ít nhất 3 ký tự');
        } else if (this.nickName.trim().length > 20) {
            errors.push('Tên hiển thị không được vượt quá 20 ký tự');
        } else if (!/^[a-zA-Z0-9_]+$/.test(this.nickName.trim())) {
            errors.push('Tên hiển thị chỉ được chứa chữ cái, số và dấu gạch dưới');
        }

        // Validate email
        if (!this.email || this.email.trim().length === 0) {
            errors.push('Email không được để trống');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
            errors.push('Email không hợp lệ');
        }

        // Validate password
        if (!this.password || this.password.length === 0) {
            errors.push('Mật khẩu không được để trống');
        } else if (this.password.length < 6) {
            errors.push('Mật khẩu phải có ít nhất 6 ký tự');
        } else if (this.password.length > 100) {
            errors.push('Mật khẩu không được vượt quá 100 ký tự');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Clean data before processing
    sanitize() {
        return {
            name: this.name?.trim(),
            nickName: this.nickName?.trim(),
            email: this.email?.trim().toLowerCase(),
            password: this.password
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
            errors.push('Email không được để trống');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
            errors.push('Email không hợp lệ');
        }

        // Validate OTP
        if (!this.otp || this.otp.trim().length === 0) {
            errors.push('Mã OTP không được để trống');
        } else if (!/^\d{6}$/.test(this.otp.trim())) {
            errors.push('Mã OTP phải là 6 chữ số');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Clean data before processing
    sanitize() {
        return {
            email: this.email?.trim().toLowerCase(),
            otp: this.otp?.trim()
        };
    }
}

module.exports = {
    SignupInitiateRequest,
    SignupVerifyRequest
};
