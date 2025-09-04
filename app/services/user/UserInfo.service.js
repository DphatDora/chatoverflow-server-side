const User = require("../../models/User.model");
const bcrypt = require("bcrypt");

async function getUserInfo(userId) {
  try {
    const user = await User.findById(userId).select(
      "-password -tempPasswordHash -__v"
    );
    if (!user || user.status !== "active") {
      return {
        success: false,
        message: !user
          ? "Không tìm thấy thông tin người dùng"
          : "Tài khoản chưa được kích hoạt",
      };
    }

    return {
      success: true,
      message: "Lấy thông tin người dùng thành công",
      data: {
        userId: user._id,
        name: user.name,
        nickName: user.nickName,
        email: user.email,
        status: user.status,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        gender: user.gender,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  } catch (error) {
    console.error("Get user info error:", error);
    return {
      success: false,
      message: "Lỗi hệ thống khi lấy thông tin người dùng",
    };
  }
}

async function updateUserInfo(userId, updateData) {
  try {
    const { name, nickName, dateOfBirth, address, gender } = updateData;
    const user = await User.findById(userId);

    if (!user || user.status !== "active") {
      return {
        success: false,
        message: !user
          ? "Không tìm thấy người dùng"
          : "Tài khoản chưa được kích hoạt",
      };
    }

    const updateFields = {};

    // Update basic info
    if (name && name !== user.name) updateFields.name = name;
    if (nickName && nickName !== user.nickName) {
      const existingUser = await User.findOne({
        nickName,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return { success: false, message: "Tên hiển thị đã được sử dụng" };
      }
      updateFields.nickName = nickName;
    }
    if (dateOfBirth !== undefined) updateFields.dateOfBirth = dateOfBirth;
    if (address !== undefined) updateFields.address = address;
    if (gender !== undefined) updateFields.gender = gender;

    if (Object.keys(updateFields).length === 0) {
      return {
        success: false,
        message: "Không có thông tin nào được cập nhật",
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    );

    return {
      success: true,
      message: "Cập nhật thông tin thành công",
      data: {
        userId: updatedUser._id,
        name: updatedUser.name,
        nickName: updatedUser.nickName,
        email: updatedUser.email,
        status: updatedUser.status,
        dateOfBirth: updatedUser.dateOfBirth,
        address: updatedUser.address,
        gender: updatedUser.gender,
        updatedAt: updatedUser.updatedAt,
      },
    };
  } catch (error) {
    console.error("Update user info error:", error);
    return {
      success: false,
      message: "Lỗi hệ thống khi cập nhật thông tin 22",
    };
  }
}

module.exports = { getUserInfo, updateUserInfo };
