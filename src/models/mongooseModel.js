import mongoose from "mongoose";

const {Schema} = mongoose

const password = {
    type: String,
    required: [true, "Password area is required"],
    minLength: [4, "At least 4 characters"]
}
const username = {
    type: String,
    required: [true, "Username area is required"],
    lowercase: true,
    unique: true,
    validate: [validator.isAlphanumeric, "Only Alphanumeric characters"]
}
const reqString = {
    type: String,
    required: true
}

const postSchema = new Schema({
    title: reqString,
    content: reqString,
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
},{
    timestamps: true
})
const userSchema = new Schema({
      username: username,
      profileDesc: reqString,
      password: password
}, {
    timestamps: true
})

const Post = mongoose.model('Post', postSchema)
const User = mongoose.model('User', userSchema)


export { Post, User }