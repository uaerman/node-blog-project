import express from "express";
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

postRouter.post('/', async (req, res) => {
    try {
        const createdPost = await Post.create(req.body) 
        res.status(201).json({
            succeed: true,
            createdPost
        })
    } catch (error) {
        res.status(400).json({
            succeed: false,
            error
        })
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