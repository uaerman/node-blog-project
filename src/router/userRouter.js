import fs from "fs"
import express from "express";
import {v2 as cloudinary} from "cloudinary"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { User, Post } from "../models/mongooseModel.js";

const userRoute = express.Router();

userRoute.get("/:id/:follow/", async (req, res) => {
  if (req.params.follow !== 'followers' && req.params.follow !== 'followings') return res.redirect(`/users/${req.params.id}`)
  let follow = req.params.follow
  const user = await User.findById(req.params.id).populate(['followers', 'followings'])
  res.render("follow", {
    link: "users",
    user,
    follow
  });
});

userRoute.post("/register", async (req, res) => {
  try {
    const user = new User(req.body);
    bcrypt.hash(req.body.password, 10, async (err, hash) => {
      user.password = hash;
      await user.save();
    });
    res.status(201).json({ user: user._id });
  } catch (error) {
    console.log(error);
    const errors2 = {};
    if (error.code === 11000) {
      error.keyPattern.username
        ? (errors2.username = "The Username is already registered")
        : null;
      error.keyPattern.email
        ? (errors2.email = "The Email is already registered")
        : null;
    }
    if (error.name === "ValidationError") {
      Object.keys(error.errors).forEach((key) => {
        errors2[key] = error.errors[key].message;
      });
    }
    console.log(errors2);
    res.status(400).json(errors2);
  }
});
userRoute.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    let same = false;
    if (user) {
      same = await bcrypt.compare(req.body.password, user.password);
    } else {
      res.status(401).json({
        succeded: false,
        error: `There is no such user '${username}'`,
      });
      return;
    }
    if (same) {
      const token = createToken(user._id);
      res.cookie("jsonwebtoken", token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
      });
      res.redirect("/users/dashboard");
    } else {
      res.status(401).json({
        succeded: false,
        error: `Password are not matched`,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      succeded: false,
      error,
    });
  }
});
userRoute.get("/dashboard", authenticateToken, async (req, res) => {
  const posts = await Post.find({ creator: res.locals.user._id });
  const user = await User.findById({ _id: res.locals.user._id });
  res.render("dashboard", {
    link: "dashboard",
    user,
    posts,
  });
});
userRoute.get("/:id", authenticateToken, async (req, res) => {
  const user = await User.findById({ _id: req.params.id });
  const inFollowers = user.followers.some((follower) => {
    return follower.equals(res.locals.user._id)
  })
  const posts = await Post.find({ creator: req.params.id });
  res.render("user", {
    link: "users",
    user,
    posts,
    inFollowers
    });
});
userRoute.post("/update", async (req, res) => {
  try {
    const user = await User.findById(res.locals.user._id);
    if (req.files) {
      if (user.image_id) {
        const photoId = user.image_id;
        await cloudinary.uploader.destroy(photoId);
      }
      const result = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        {
          use_filename: true,
          folder: "blogapp",
        }
      );
      user.url = result.secure_url;
      user.image_id = result.public_id;
      fs.unlinkSync(req.files.image.tempFilePath);
    }
    user.profileDesc = req.body.profileDesc;
    user.save();
    res.status(200).redirect(`/users/dashboard`);
  } catch (error) {
    console.log(error)
    res.status(500).json({
      succeded: false,
      error,
    });
  }
});
userRoute.get("/follow/:id", authenticateToken, async (req, res) => {
  // res.locals.user._id
  try {
    let user = await User.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $push: { followers: res.locals.user._id },
      },
      { new: true }
    );

    user = await User.findByIdAndUpdate(
      { _id: res.locals.user._id },
      {
        $push: { followings: req.params.id },
      },
      { new: true }
    );

    res.status(200).redirect(`/users/${req.params.id}`);
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
});

userRoute.get("/unfollow/:id", authenticateToken, async (req, res) => {
  // res.locals.user._id
  try {
    let user = await User.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $pull: { followers: res.locals.user._id },
      },
      { new: true }
    );

    user = await User.findByIdAndUpdate(
      { _id: res.locals.user._id },
      {
        $pull: { followings: req.params.id },
      },
      { new: true }
    );

    res.status(200).redirect(`/users/${req.params.id}`);
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
});

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

export { userRoute, createToken };
