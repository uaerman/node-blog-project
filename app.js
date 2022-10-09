import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import router from './src/router/router.js'
import conn from './src/dbConnect.js'

dotenv.config()

conn()

const app = express()
const port = process.env.PORT

app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

app.use('/', router)

app.listen(port, () => {
    console.log((`Application running on port: ${port}`))
})