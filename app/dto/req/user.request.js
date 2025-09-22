const Address = require('../Address.dto');
class UserRequestDto {
  constructor(name, nickName, dateOfBirth, address, gender) {
    this.name = name;
    this.nickName = nickName;
    if (dateOfBirth) this.dateOfBirth = dateOfBirth;
    if (address) this.address = Address.fromData(address);
    if (gender) this.gender = gender;
    if (bio) this.bio = bio;
  }

  // For request validation
  static validate(data) {
    const { name, nickName, dateOfBirth, address, gender, bio } = data;

    // Validate name
    if (
      name !== undefined &&
      (typeof name !== 'string' ||
        name.trim().length < 2 ||
        name.trim().length > 50)
    ) {
      return { valid: false, message: 'Tên phải có từ 2 đến 50 ký tự' };
    }

    // Validate nickName
    if (
      nickName !== undefined &&
      (typeof nickName !== 'string' ||
        !/^[a-zA-Z0-9_]{3,20}$/.test(nickName.trim()))
    ) {
      return {
        valid: false,
        message:
          'Tên hiển thị phải có từ 3 đến 20 ký tự và chỉ chứa chữ cái, số, dấu gạch dưới',
      };
    }

    // Validate dateOfBirth
    if (dateOfBirth !== undefined) {
      const date = new Date(dateOfBirth);
      if (isNaN(date.getTime())) {
        return { valid: false, message: 'Ngày sinh không hợp lệ' };
      }
      if (date > new Date()) {
        return { valid: false, message: 'Ngày sinh không thể là tương lai' };
      }
    }

    // Validate address
    if (address !== undefined) {
      const addressValidation = Address.validate(address);
      if (!addressValidation.valid) {
        return addressValidation;
      }
    }

    // Validate bio
    if (bio !== undefined) {
      if (typeof bio !== 'string' || bio.trim().length > 300) {
        return {
          valid: false,
          message: 'Tiểu sử không được vượt quá 300 ký tự',
        };
      }
    }

    // Validate gender
    if (gender !== undefined && !['male', 'female', 'other'].includes(gender)) {
      return {
        valid: false,
        message: 'Giới tính phải là male, female hoặc other',
      };
    }

    return { valid: true };
  }

  // For request sanitization
  static sanitize(data) {
    const sanitized = {};
    if (data.name !== undefined) sanitized.name = data.name.trim();
    if (data.nickName !== undefined) sanitized.nickName = data.nickName.trim();
    if (data.dateOfBirth !== undefined)
      sanitized.dateOfBirth = data.dateOfBirth;
    if (data.address !== undefined)
      sanitized.address = Address.sanitize(data.address);
    if (data.gender !== undefined) sanitized.gender = data.gender;

    if (data.bio !== undefined) sanitized.bio = data.bio.trim();

    return sanitized;
  }
}

module.exports = UserRequestDto;
