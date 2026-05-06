const multer = require("multer");
const sharp = require("sharp");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Post = require("../models/postModel");

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images", 400), false);
  }
};

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID.trim(),
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY.trim(),
  },
});

async function uploadFileToR2(fileName, fileBuffer, contentType) {
  const uploadParam = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  };

  await r2Client.send(new PutObjectCommand(uploadParam));

  return `${process.env.R2_PUBLIC_URL}/${fileName}`;
}

async function deleteFileFromR2(fileUrl) {
  if (!fileUrl) return;

  const fileName = fileUrl.split("/").pop();

  const deleteParam = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
  };

  try {
    await r2Client.send(new DeleteObjectCommand(deleteParam));
  } catch (err) {
    console.error("Failed to delete from R2:", err);
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadImage = upload.single("image");

exports.processImages = catchAsync(async (req, res, next) => {
  req.body.created_at = new Date();

  if (!req.file) return next();

  const file = req.file;
  const filename = `${
    req.body.title ? req.body.title.split(" ").join("-") : "Post"
  }-${Date.now()}.webp`;

  const processedImageBuffer = await sharp(file.buffer)
    .toFormat("webp")
    .webp({ quality: 80 })
    .toBuffer();

  const publicUrl = await uploadFileToR2(
    filename,
    processedImageBuffer,
    "image/webp",
  );

  req.body.image = publicUrl;

  next();
});

// CREATE /////////////////////////////////////////////

exports.addPost = catchAsync(async (req, res, next) => {
  const post = await Post.create(req.body);

  req.app.get("socketio").emit("post_created", post);

  res.status(201).json({
    status: "success",
    data: post,
  });
});

// CREATE /////////////////////////////////////////////

// READ /////////////////////////////////////////////

exports.getPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find().sort({ created_at: -1 });

  res.status(200).json({
    status: "success",
    data: posts,
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) return next(new AppError("No post was found with that id.", 404));

  res.status(200).json({
    status: "success",
    data: post,
  });
});

// READ /////////////////////////////////////////////

// UPDATE /////////////////////////////////////////////

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!post) return next(new AppError("No post was found with that id.", 404));

  req.app.get("socketio").emit("post_updated", post);

  res.status(200).json({
    status: "success",
    data: post,
  });
});

// UPDATE /////////////////////////////////////////////

// DELETE /////////////////////////////////////////////

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError("No Post was found with that id.", 404));
  }
  if (post.image) {
    await deleteFileFromR2(post.image);
  }

  await Post.findByIdAndDelete(req.params.id);

  req.app.get("socketio").emit("post_deleted", req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// DELETE /////////////////////////////////////////////
