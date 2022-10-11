import express from "express";
import { User, Post } from "../models/mongooseModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const posts = await Post.find().limit(3);
  res.render("index", {
    link: "home",
    posts,
  });
});
router.get("/register", async (req, res) => {
  res.render("register", {
    link: "register",
  });
});
router.get("/login", async (req, res) => {
  res.render("login", {
    link: "login",
  });
});
router.get("/logout", async (req, res) => {
  res.cookie('jsonwebtoken', '', {
    maxAge: 1,
})
res.redirect('/')
});
export default router;
