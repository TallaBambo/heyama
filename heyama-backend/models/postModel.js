const mongoose = require("mongoose");
const slugify = require("slugify");

const postSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a product name"],
    },
    description: String,
    image: String,
    slug: String,
    created_at: Date,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

postSchema.pre("save", function () {
  this.slug = slugify(this.title, { lower: true });
});

const Post = mongoose.model("Posts", postSchema);

module.exports = Post;
