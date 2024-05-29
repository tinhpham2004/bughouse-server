const util = require("util");
const multer = require("multer");

const TYPE_MATCH = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "video/mp3",
  "video/mp4",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.rar",
  "application/zip",
];
const FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE);

const storage = multer.memoryStorage({
  destination(req, res, callback) {
    callback(null, "");
  },
});

const checkFileType = (file, cb) => {
  const splitTempt = file.originalname.split(".");
  const fileExtension = splitTempt[splitTempt.length - 1];

  if (fileExtension === "rar") {
    file.mimetype = "application/vnd.rar";
  }

  if (fileExtension === "zip") {
    file.mimetype = "application/zip";
  }

  if (TYPE_MATCH.indexOf(file.mimetype) === -1) {
    const errorMess = `The file <strong>${file.originalname}</strong> is invalid. Only allowed to upload image jpeg or png.`;
    return cb(errorMess);
  }
  cb(null, true);
};

const uploadManyFiles = multer({
  storage,
  limits: { fileSize: FILE_SIZE },
}).array("file", 10);

const uploadFile = multer({
  storage,
  limits: { fileSize: FILE_SIZE },
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  },
}).single(
  "file",
);

const multipleUploadMiddleware = util.promisify(uploadManyFiles);
const singleUploadMiddleware = util.promisify(uploadFile);

module.exports = {
  multipleUploadMiddleware,
  singleUploadMiddleware,
  uploadFile,
};
