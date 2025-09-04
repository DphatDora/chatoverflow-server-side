const Address = require("../Address.dto");

class UserResponseDto {
  constructor(
    userId,
    name,
    nickName,
    email,
    dateOfBirth,
    address,
    gender,
    status,
    createdAt,
    updatedAt
  ) {
    this.userId = userId;
    this.name = name;
    this.nickName = nickName;
    this.email = email;
    if (dateOfBirth) this.dateOfBirth = dateOfBirth;
    // Always include address, even if null/empty
    this.address = address ? Address.fromData(address) : null;
    if (gender) this.gender = gender;
    if (status) this.status = status;
    if (createdAt) this.createdAt = createdAt;
    if (updatedAt) this.updatedAt = updatedAt;
  }

  // For response data
  static fromUser(userData) {
    return new UserResponseDto(
      userData.userId,
      userData.name,
      userData.nickName,
      userData.email,
      userData.dateOfBirth,
      userData.address,
      userData.gender,
      userData.status,
      userData.createdAt,
      userData.updatedAt
    );
  }
}

module.exports = UserResponseDto;
