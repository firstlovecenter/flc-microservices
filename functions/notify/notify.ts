import { Request, Response } from 'express'
// import rateLimit from 'express-rate-limit'
import { sendSMS } from './sendSMS'
import { sendEmail } from './sendEmail'
import { SECRETS } from './utils'

const express = require('express')
const serverless = require('serverless-http')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
const router = express.Router()

app.set('trust proxy', '127.0.0.1')

router.post('/send-sms', async (request: Request, response: Response) => {
  // TODO: Uncomment this after changing airtable script
  // const secretKey = request.headers['x-secret-key']
  // if (!secretKey || secretKey !== SECRETS.FLC_NOTIFY_KEY) {
  //   return response.status(403).send('Unauthorized')
  // }

  try {
    return sendSMS(request, response)
  } catch (error) {
    return response
      .status(502)
      .send(`There was a problem sending your message ${error}`)
  }
})

router.post('/send-email', async (request: Request, response: Response) => {
  const secretKey = request.headers['x-secret-key']
  if (!secretKey || secretKey !== SECRETS.FLC_NOTIFY_KEY) {
    return response.status(403).send('Unauthorized')
  }

  try {
    return sendEmail(request, response)
  } catch (error) {
    return response
      .status(502)
      .send(`There was a problem sending your email ${error}`)
  }
})

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// })

// app.use(limiter)
app.use(cors({ origin: true }), bodyParser.json(), router)
app.use('/.netlify/functions/notify', router)

export const handler = serverless(app)

export default handler
