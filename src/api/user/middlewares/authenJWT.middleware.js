require("dotenv").config();
const jwt = require("jsonwebtoken");
module.exports = {
    async api(req, res, next) {
        try {
            const token =
                req.body.accessToken ||
                req.query.accessToken ||
                req.headers["access-token"] ||
                req.headers.authorization ||
                req.headers.authorization;

            if (!token) throw new Error("Token is not provided");

            const payload = await jwt.verify(token, process.env.SECRET_KEY);

            req.auth = payload;

            next();
        } catch (err) {
            console.log(`${err.name}: ${err.message}`);
            return res.status(401).json({
                status: "error",
                message: "Unauthorized",
                action: err.name === "Error" ? "logout" : "refresh",
            });
        }
    },
};
