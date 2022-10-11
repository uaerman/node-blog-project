import fs from "fs"
import express from "express";
import {v2 as cloudinary} from "cloudinary"
import {User, Post} from '../models/mongooseModel.js'

const postRouter = express.Router()

postRouter.get('/:id', async (req, res) => {
    const post = await Post.findById(req.params.id).populate('creator')
    res.render('post', {
        link: 'posts',
        post
    })
})
postRouter.get('/', async (req, res) => {
    const posts = await Post.find()
    res.render('posts', {
        link: 'posts',
        posts
    })
})

postRouter.post('/create', async (req, res) => {
    const result = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        {
          use_filename: true,
          folder: 'lenslight',
        }
      );
    try {
        await Post.create({
          title: req.body.title,
          content: req.body.content,
          creator: res.locals.user._id,
          url: result.secure_url,
          image_id: result.public_id
        });
    
        fs.unlinkSync(req.files.image.tempFilePath)
    
        res.status(201).redirect('/users/dashboard');
      } catch (error) {
        res.status(500).json({
          succeded: false,
          error,
        });
      }
})
postRouter.delete('/:id', async (req, res) => {
    try {
        const deletePost = await Post.findByIdAndDelete(req.params.id) 
        res.status(201).json({
            succeed: true,
            deletePost
        })
    } catch (error) {
        res.status(400).json({
            succeed: false,
            error
        })
    }
})

export default postRouter 
