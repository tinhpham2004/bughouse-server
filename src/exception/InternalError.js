class AuthenError extends Error {
    constructor() {
        super();
        this.status = 500;
        this.message = 'Internal Server!';
    }
}

module.exports = AuthenError;
