import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User, Post } from "../models/mongooseModel.js";

const userRoute = express.Router();
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
      res.redirect("/");
    } else {
      res.status(401).json({
        succeded: false,
        error: `Password are not matched`,
      });
    }
  } catch (error) {
    console.log(error)
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

export { userRoute, createToken};
