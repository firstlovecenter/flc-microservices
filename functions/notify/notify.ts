import { Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import { sendSMS } from './sendSMS'
import { sendEmail } from './sendEmail'

const express = require('express')
const serverless = require('serverless-http')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
const router = express.Router()

router.post('/send-sms', async (request: Request, response: Response) => {
  try {
    const res = await sendSMS(request, response)
    console.log('🚀 ~ file: notify.ts:17 ~ res:', res)
  } catch (error) {
    console.error('There was a problem sending your message', error)
    response.status(502).send('There was a problem sending your message')
  }
})

router.post('/send-email', async (request: Request, response: Response) => {
  try {
    const res = await sendEmail(request, response)
    console.log('🚀 ~ file: notify.ts:26 ~ res:', res)
  } catch (error) {
    console.error('There was a problem sending your email', error)
    response.status(502).send('There was a problem sending your email')
  }
})

app.set('trust proxy', 1)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)
app.use(cors({ origin: true }), bodyParser.json(), router)
app.use('/.netlify/functions/notify', router)

module.exports.handler = serverless(app)
