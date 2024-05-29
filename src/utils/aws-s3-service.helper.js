const fs = require("fs");
const S3 = require("aws-sdk/clients/s3");
const MyError = require("../exception/MyError");

const BucketName = "penguin-database";
const CLOUD_FRONT_URL = "https://d1ccrchzm1bmko.cloudfront.net/";
const FILE_SIZE = parseInt(20971520);
const AWS = require("aws-sdk");

// config aws
AWS.config.update({
  region: process.env.REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

// config s3
const s3 = new AWS.S3();

class AwsS3Service {
  async uploadFile(file, bucketName = BucketName) {
    const fileStream = fs.readFileSync(file.path);

    const uploadParams = {
      Bucket: bucketName,
      Body: fileStream,
      Key: `bughouse-${Date.now()}-${file.originalname}`,
    };

    const { mimetype } = file;
    if (
      mimetype === "image/jpeg" ||
      mimetype === "image/png" ||
      mimetype === "image/gif" ||
      mimetype === "video/mp3" ||
      mimetype === "video/mp4"
    ) {
      uploadParams.ContentType = mimetype;
    }

    try {
      const { Location } = await s3.upload(uploadParams).promise();

      return Location;
    } catch (err) {
      console.log("err: ", err);
      throw new MyError("Upload file Aws S3 failed");
    }
  }

  async uploadWithBase64(fileBase64, fileName, fileExtension) {
    const fileBuffer = Buffer.from(fileBase64, "base64");

    if (fileBuffer.length > FILE_SIZE) {
      throw new MyError("Size file < 20 MB");
    }

    const uploadParams = {
      Bucket: BucketName,
      Body: fileBuffer,
      Key: `zelo-${Date.now()}-${fileName}${fileExtension}`,
    };

    if (fileExtension === ".png") uploadParams.ContentType = "image/png";
    if (fileExtension === ".jpg" || fileExtension === ".jpeg") {
      uploadParams.ContentType = "image/jpeg";
    }
    if (fileExtension === ".mp3") uploadParams.ContentType = "video/mp3";
    if (fileExtension === ".mp4") uploadParams.ContentType = "video/mp4";

    try {
      const { Location } = await s3.upload(uploadParams).promise();

      return Location;
    } catch {
      throw new MyError("Upload file Aws S3 failed");
    }
  }

  async deleteFile(url, bucketName = BucketName) {
    const urlSplit = url.split("/");
    const key = urlSplit[urlSplit.length - 1];

    const params = {
      Bucket: bucketName,
      Key: key,
    };

    try {
      await s3.deleteObject(params).promise();
    } catch (err) {
      throw new MyError("Delete file Aws S3 failed");
    }
  }
}

module.exports = new AwsS3Service();
