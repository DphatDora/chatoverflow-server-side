const mongoose = require('mongoose');

const UserVerificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    otpHash: { type: String, required: true },
    otpExpiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('UserVerification', UserVerificationSchema);
