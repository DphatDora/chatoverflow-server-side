
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../../models/User.model');
const UserPasswordReset = require('../../models/User.PasswordReset.model');

const OTP_EXPIRE_MINUTES = 10;
const MAX_ATTEMPTS = 5;

async function sendResetOTP(email) {
    const user = await User.findOne({ email });
    if (!user) {
        return { success: false, message: 'Email không tồn tại' };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60000);

    await UserPasswordReset.findOneAndUpdate(
        { userId: user._id },
        { otpHash, otpExpiresAt: expiresAt, attempts: 0 },
        { upsert: true, new: true }
    );

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });

        await transporter.sendMail({
            from: `"MyApp" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Mã OTP đặt lại mật khẩu',
            text: `Mã OTP của bạn là: ${otp} (hết hạn sau ${OTP_EXPIRE_MINUTES} phút)`
        });

        return { success: true, message: 'Đã gửi OTP đến email của bạn' };
    } catch (err) {
        return { success: false, message: 'Không gửi được email', error: err.message };
    }
}

async function verifyOTP(email, otpInput) {
    const user = await User.findOne({ email });
    if (!user) {
        return { success: false, message: 'Email không tồn tại' };
    }

    const record = await UserPasswordReset.findOne({ userId: user._id });
    if (!record) {
        return { success: false, message: 'Không tìm thấy yêu cầu đặt lại mật khẩu' };
    }

    if (record.attempts >= MAX_ATTEMPTS) {
        return { success: false, message: 'Vượt quá số lần thử OTP' };
    }

    if (record.otpExpiresAt < new Date()) {
        return { success: false, message: 'OTP đã hết hạn' };
    }

    const isMatch = await bcrypt.compare(otpInput, record.otpHash);
    await UserPasswordReset.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });

    if (!isMatch) {
        return { success: false, message: 'OTP không hợp lệ' };
    }

    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
    );
    return { success: true, resetToken: token };
}

async function resetPassword(resetToken, newPassword) {
    let payload;
    try {
        payload = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
        return { success: false, message: 'Token không hợp lệ hoặc đã hết hạn' };
    }

    const user = await User.findById(payload.userId);
    if (!user) {
        return { success: false, message: 'Không tìm thấy user' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await UserPasswordReset.deleteOne({ userId: user._id });

    return { success: true, message: 'Đổi mật khẩu thành công' };
}

module.exports = { sendResetOTP, verifyOTP, resetPassword };
