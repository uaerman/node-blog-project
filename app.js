import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import router from './src/router/pageRouter.js'
import postRouter from './src/router/postRouter.js'
import fileUpload from "express-fileupload"
import { v2 as cloudinary } from 'cloudinary';
import { userRoute } from './src/router/userRouter.js';
import { checkUser } from "./src/middlewares/authMiddleware.js"
import conn from './src/dbConnect.js'

dotenv.config()

conn()

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  });
  


const app = express()
const port = process.env.PORT

app.set('view engine', 'ejs')

app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(express.static('src/public'))
app.use(fileUpload({useTempFiles: true}))
app.use(express.urlencoded({extended: true}))

app.use('*', checkUser)
app.use('/', router)
app.use('/posts', postRouter)
app.use('/users', userRoute)



app.listen(port, () => {
    console.log((`Application running on port: ${port}`))
})