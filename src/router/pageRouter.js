import express from "express";
import {User, Post} from '../models/mongooseModel.js'

const router = express.Router()

router.get('/', async (req, res) => {
    const posts = await Post.find()
    res.render('index', {
        link: 'home',
        posts
    })
})

export default router 