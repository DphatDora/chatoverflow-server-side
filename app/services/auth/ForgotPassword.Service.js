const bcrypt = require('bcrypt');
const UserVerification = require('../../models/User.PasswordReset.model');
const  {isValidPassword} = require('../../utils/validator');

async function resetPasswordByUser(user, newPassword) {

  const checkPassword = isValidPassword(newPassword);
  if (!checkPassword.valid) {
    return { 
      success: false, 
      message: checkPassword.error,
      data: null};
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  await user.save();

  await UserVerification.deleteMany({ userId: user._id });

  return {
    success: true,
    message: 'Reset Password Successfully',
    data: { userId: user._id, email: user.email }
  };
}

module.exports = {
  resetPasswordByUser,
};