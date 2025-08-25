const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const OTP_EXPIRE_MINUTES = 10;

// Helper functions
function generateOTPCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hashOTPCode(otp) {
    return await bcrypt.hash(otp, 10);
}

async function compareOTPCode(otpInput, otpHash) {
    return await bcrypt.compare(otpInput, otpHash);
}

function getOTPExpirationTime() {
    return new Date(Date.now() + OTP_EXPIRE_MINUTES * 60000);
}

function isOTPExpired(expirationTime) {
    return expirationTime < new Date();
}

function createEmailTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: { 
            user: process.env.SMTP_USER, 
            pass: process.env.SMTP_PASS 
        }
    });
}

async function sendEmailWithOTP(email, otp, type, userName = '') {
    try {
        const transporter = createEmailTransporter();

        const emailConfigs = {
            signup: {
                subject: 'Xác thực đăng ký tài khoản',
                html: `
                    <h3>Chào mừng ${userName || 'bạn'}!</h3>
                    <p>Cảm ơn bạn đã đăng ký tài khoản ChatOverflow.</p>
                    <p>Mã OTP để xác thực đăng ký tài khoản của bạn là:</p>
                    <h2 style="color: #007bff; font-weight: bold; background: #f8f9fa; padding: 10px; border-radius: 5px; text-align: center;">${otp}</h2>
                    <p>Mã này sẽ hết hạn sau ${OTP_EXPIRE_MINUTES} phút.</p>
                    <p>Vui lòng nhập mã này để hoàn tất quá trình đăng ký.</p>
                    <p>Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.</p>
                    <p><small>Đây là email tự động, vui lòng không trả lời.</small></p>
                `
            },
            reset: {
                subject: 'Mã OTP đặt lại mật khẩu',
                html: `
                    <h3>Đặt lại mật khẩu</h3>
                    ${userName ? `<p>Xin chào ${userName},</p>` : ''}
                    <p>Mã OTP để đặt lại mật khẩu của bạn là:</p>
                    <h2 style="color: #dc3545; font-weight: bold; background: #f8f9fa; padding: 10px; border-radius: 5px; text-align: center;">${otp}</h2>
                    <p>Mã này sẽ hết hạn sau ${OTP_EXPIRE_MINUTES} phút.</p>
                    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                    <p><small>Đây là email tự động, vui lòng không trả lời.</small></p>
                `
            }
        };

        const config = emailConfigs[type] || emailConfigs.signup;

        await transporter.sendMail({
            from: `"ChatOverflow" <${process.env.SMTP_USER}>`,
            to: email,
            subject: config.subject,
            html: config.html
        });

        return { success: true, message: `Đã gửi mã OTP đến email ${email}` };
    } catch (error) {
        return { 
            success: false, 
            message: 'Không thể gửi email', 
        };
    }
}

async function generateAndStoreOTPInDB(userId, VerificationModel) {
    const otp = generateOTPCode();
    const otpHash = await hashOTPCode(otp);
    const expiresAt = getOTPExpirationTime();

    await VerificationModel.findOneAndUpdate(
        { userId },
        { 
            otpHash, 
            otpExpiresAt: expiresAt, 
            attempts: 0
        },
        { upsert: true, new: true }
    );

    return { otp, otpHash, expiresAt };
}

// Main functions
async function verifyOTP(email, otpInput, UserModel, VerificationModel, options = {}) {
    try {
        const { userQuery = {}, maxAttempts = 5 } = options;
        
        const user = await UserModel.findOne({ email, ...userQuery });
        if (!user) {
            return { success: false, message: 'Không tìm thấy người dùng' };
        }

        const otpRecord = await VerificationModel.findOne({ userId: user._id });
        
        if (!otpRecord) {
            return { 
                success: false, 
                message: 'Không tìm thấy yêu cầu OTP' 
            };
        }

        if (otpRecord.attempts >= maxAttempts) {
            return { 
                success: false, 
                message: 'Vượt quá số lần thử OTP' 
            };
        }

        if (isOTPExpired(otpRecord.otpExpiresAt)) {
            return { 
                success: false, 
                message: 'OTP đã hết hạn' 
            };
        }

        const isMatch = await compareOTPCode(otpInput, otpRecord.otpHash);
        if (!isMatch) {
            await VerificationModel.updateOne(
                { _id: otpRecord._id }, 
                { $inc: { attempts: 1 } }
            );
            return { 
                success: false, 
                message: 'OTP không hợp lệ' 
            };
        }

        return { 
            success: true, 
            message: 'Xác thực OTP thành công',
            user,
            otpRecord 
        };
    } catch (error) {
        return { 
            success: false, 
            message: 'Lỗi server', 
            error: error.message 
        };
    }
}

async function sendOTP(email, UserModel, VerificationModel, type, options = {}) {
    try {
        const { 
            userQuery = {}, 
            userNotFoundMessage = 'Không tìm thấy user'
        } = options;

        const user = await UserModel.findOne({ email, ...userQuery });
        if (!user) {
            return { success: false, message: userNotFoundMessage };
        }

        const { otp } = await generateAndStoreOTPInDB(user._id, VerificationModel);

        const emailResult = await sendEmailWithOTP(email, otp, type, user.name || user.nickName);

        return emailResult;
    } catch (error) {
        return { 
            success: false, 
            message: 'Lỗi server', 
            error: error.message 
        };
    }
}

module.exports = {
    verifyOTP,
    sendOTP
};
