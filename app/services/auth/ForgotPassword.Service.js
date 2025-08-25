const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User.model');
const UserPasswordReset = require('../../models/User.PasswordReset.model');

async function resetPassword(resetToken, newPassword) {
    try {
        const payload = jwt.verify(resetToken, process.env.JWT_SECRET);
        
        const user = await User.findById(payload.userId);
        if (!user) {
            throw new Error('Không tìm thấy user');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password in Credential model instead of User
        const Credential = require('../../models/Credential.model');
        await Credential.findOneAndUpdate(
            { userId: user._id },
            { passwordHash: hashedPassword }
        );

        // Clean up OTP records
        await UserPasswordReset.deleteOne({ userId: user._id });

        return { success: true, message: 'Đổi mật khẩu thành công' };
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            throw new Error('Token không hợp lệ hoặc đã hết hạn');
        }
        throw error;
    }
}

module.exports = { resetPassword };