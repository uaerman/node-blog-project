import fs from "fs";
import express from "express";
import { v2 as cloudinary } from "cloudinary";
import { Post } from "../models/mongooseModel.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const postRouter = express.Router();

postRouter.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id).populate("creator");
  let isOwner = false;
  if (res.locals.user) {
    isOwner = post.creator.equals(res.locals.user._id);
  }
  res.render("post", {
    link: "posts",
    post,
    isOwner,
  });
});
postRouter.get("/", async (req, res) => {
  const posts = await Post.find();
  res.render("posts", {
    link: "posts",
    posts,
  });
});

postRouter.post("/create", async (req, res) => {
  const result = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true,
      folder: "blogapp",
    }
  );
  try {
    await Post.create({
      title: req.body.title,
      content: req.body.content,
      creator: res.locals.user._id,
      url: result.secure_url,
      image_id: result.public_id,
    });

    fs.unlinkSync(req.files.image.tempFilePath);

    res.status(201).redirect("/users/dashboard");
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
});
postRouter.put("/:id", authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (req.files) {
      const photoId = post.image_id;
      await cloudinary.uploader.destroy(photoId);
      const result = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        {
          use_filename: true,
          folder: "blogapp",
        }
      );
      post.url = result.secure_url;
      post.image_id = result.public_id;
      fs.unlinkSync(req.files.image.tempFilePath);
    }
    post.title = req.body.title;
    post.content = req.body.content;
    await post.save();
    res.status(200).redirect(`/posts/${post._id}`)
  } catch (error) {
    res.status(400).json({
      succeed: false,
      error,
    });
  }
});
postRouter.delete("/:id", async (req, res) => {
  try {
    const deletePost = await Post.findByIdAndDelete(req.params.id);
    const photoId = deletePost.image_id;
    await cloudinary.uploader.destroy(photoId);
    res.status(200).redirect("/users/dashboard");
  } catch (error) {
    res.status(400).json({
      succeed: false,
      error,
    });
  }
});

export default postRouter;
