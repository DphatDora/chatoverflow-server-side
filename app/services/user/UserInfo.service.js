const User = require('../../models/User.model');
const Question = require('../../models/Question.model');
const Answer = require('../../models/Answer.model');
const bcrypt = require('bcrypt');

async function updateUserInfo(userId, updateData) {
  try {
    const { name, nickName, dateOfBirth, address, gender, bio } = updateData;
    const user = await User.findById(userId);

    if (!user || user.status !== 'active') {
      return {
        success: false,
        message: !user
          ? 'Không tìm thấy người dùng'
          : 'Tài khoản chưa được kích hoạt',
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
        return { success: false, message: 'Tên hiển thị đã được sử dụng' };
      }
      updateFields.nickName = nickName;
    }
    if (dateOfBirth !== undefined) updateFields.dateOfBirth = dateOfBirth;
    if (address !== undefined) updateFields.address = address;
    if (gender !== undefined) updateFields.gender = gender;
    if (bio !== undefined) updateFields.bio = bio;
    if (Object.keys(updateFields).length === 0) {
      return {
        success: false,
        message: 'Không có thông tin nào được cập nhật',
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    );

    return {
      success: true,
      message: 'Cập nhật thông tin thành công',
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
    console.error('Update user info error:', error);
    return {
      success: false,
      message: 'Lỗi hệ thống khi cập nhật thông tin 22',
    };
  }
}

async function getUserProfile(userId, page = 1, limit = 10) {
  try {
    // Lấy thông tin user
    const user = await User.findById(userId).select(
      '-password -tempPasswordHash -__v'
    );

    if (!user || user.status !== 'active') {
      return {
        success: false,
        message: !user
          ? 'Không tìm thấy thông tin người dùng'
          : 'Tài khoản chưa được kích hoạt',
      };
    }

    // Tính pagination cho danh sách posts
    const skip = (page - 1) * limit;

    // Lấy danh sách posts của user với pagination
    const posts = await Question.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name nickName')
      .select('title content tags askedTime views upvotedBy downvotedBy')
      .lean();

    // Đếm tổng số posts
    const totalPosts = await Question.countDocuments({ user: userId });

    // Đếm tổng số answers
    const totalAnswers = await Answer.countDocuments({ user: userId });

    // Tính toán thống kê cho mỗi post
    const postsWithStats = posts.map((post) => ({
      ...post,
      upvotes: post.upvotedBy ? post.upvotedBy.length : 0,
      downvotes: post.downvotedBy ? post.downvotedBy.length : 0,
      score:
        (post.upvotedBy ? post.upvotedBy.length : 0) -
        (post.downvotedBy ? post.downvotedBy.length : 0),
    }));

    return {
      success: true,
      message: 'Lấy thông tin profile thành công',
      data: {
        user: {
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
          bio: user.bio,
        },
        posts: postsWithStats,
        statistics: {
          totalPosts,
          totalAnswers,
          totalContributions: totalPosts + totalAnswers,
        },
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          totalItems: totalPosts,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(totalPosts / limit),
          hasPrevPage: page > 1,
        },
      },
    };
  } catch (error) {
    console.error('Get user profile error:', error);
    return {
      success: false,
      message: 'Lỗi hệ thống khi lấy thông tin profile',
    };
  }
}

module.exports = { updateUserInfo, getUserProfile };
