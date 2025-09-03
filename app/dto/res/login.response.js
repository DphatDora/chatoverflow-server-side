class LoginResponse {
  constructor({ avatar, nickName, token }) {
    this.avatar = avatar;
    this.nickName = nickName;
    this.token = token;
  }
}

const NewLoginResponse = (user, token) =>
  new LoginResponse({
    avatar: user.avatar,
    nickName: user.nickName,
    token,
  });

module.exports = { LoginResponse, NewLoginResponse };
