require("dotenv").config();
const {https} = require("follow-redirects");

const {BASE_URL} = process.env;
const {API_KEY} = process.env;
const {MEDIA_TYPE} = process.env;

const sendMessage = (data) => {
    const options = {
        method: "POST",
        hostname: "k3yq9e.api.infobip.com",
        host: BASE_URL,
        path: "/sms/2/text/advanced",
        headers: {
            Authorization: API_KEY,
            "Content-Type": MEDIA_TYPE,
            Accept: MEDIA_TYPE,
        },
        maxRedirects: 20,
    };

    const req = https.request(options, (res) => {
        const chunks = [];

        res.on("data", (chunk) => {
            chunks.push(chunk);
        });

        res.on("end", (chunk) => {
            const body = Buffer.concat(chunks);
            console.log("🚀 ~ file: sendsms.js:31 ~ res.on ~ body:", body.toString());
        });

        res.on("error", (error) => {
            console.error(error);
            throw new Error("Send OTP fail!");
        });
    });

    req.write(data);

    req.end();
};

module.exports = sendMessage;
