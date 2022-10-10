import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import router from './src/router/pageRouter.js'
import postRouter from './src/router/postRouter.js'

import conn from './src/dbConnect.js'

dotenv.config()

conn()

const app = express()
const port = process.env.PORT

app.set('view engine', 'ejs')

app.use(express.static('src/public'))
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.use('/', router)
app.use('/posts', postRouter)


app.listen(port, () => {
    console.log((`Application running on port: ${port}`))
})