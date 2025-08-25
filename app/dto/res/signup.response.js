class SignupInitiateResponse {
    constructor(email) {
        this.email = email;
    }

    static create(email) {
        return new SignupInitiateResponse(email);
    }
}

class SignupVerifyResponse {
    constructor(userId, email, name, nickName) {
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.nickName = nickName;
    }

    static create(userData) {
        return new SignupVerifyResponse(
            userData.userId,
            userData.email,
            userData.name,
            userData.nickName
        );
    }
}

module.exports = {
    SignupInitiateResponse,
    SignupVerifyResponse
};
