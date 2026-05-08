const express = require("express");
const postController = require("../controllers/postController");

const router = express.Router();

router
  .route("/")
  .post(
    postController.uploadImage,
    postController.processImages,
    postController.addPost,
  )
  .get(postController.getPosts);

router.route("/post/:slug").get(postController.getPost);
router
  .route("/:id")
  .delete(postController.deletePost)
  .get(postController.getPost);

module.exports = router;
