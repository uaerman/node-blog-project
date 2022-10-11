import mongoose from "mongoose";
import validator from "validator";
const { Schema } = mongoose;

const password = {
  type: String,
  required: [true, "Password area is required"],
  minLength: [4, "At least 4 characters"],
};
const username = {
  type: String,
  required: [true, "Username area is required"],
  lowercase: true,
  unique: true,
  validate: [validator.isAlphanumeric, "Only Alphanumeric characters"],
};
const email = {
  type: String,
  required: [true, "Email area is required"],
  unique: true,
  validate: [validator.isEmail, "Valid email is required"],
};
const reqString = {
  type: String,
  required: true,
};

const postSchema = new Schema(
  {
    title: reqString,
    content: reqString,
    url: reqString,
    image_id: reqString,
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const userSchema = new Schema(
  {
    username: username,
    email: email,
    profileDesc: {
      type: String,
      default: "No description added",
    },
    url: {
      type: String,
      default: "https://cdn.uaerman.dev/images/infinityheart.png",
    },
    image_id: {
      type: String,
    },
    password: password,
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);
const User = mongoose.model("User", userSchema);

export { Post, User };
