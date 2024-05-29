require('dotenv').config();
const router = require("express").Router();
const multer = require('multer');
const AWS = require("aws-sdk");
const awsHelper = require('../../../utils/awss3.helper');

// config aws
AWS.config.update({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

// config s3
const s3 = new AWS.S3();
const storage = multer.memoryStorage({
    destination: (req, file, cb) => {
        cb(null, "");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const upload = multer({ storage, limits: { fileSize: 20000000 } });

router.post('/images/upload', upload.array('images', 10), async (req, res) => {
    try {
        const files = req.files;
        const imageLinks = [];
        for (let i = 0; i < files.length; i++) {
            imageLinks.push(await awsHelper.uploadFile(files[i]));
        }
        res.status(200).json({ imageLinks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading images' });
    }
});

module.exports = router;