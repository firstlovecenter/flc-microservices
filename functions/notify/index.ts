import { Request, Response } from 'express'
// import rateLimit from 'express-rate-limit'
import { sendSMS } from './sendSMS'
import { sendEmail } from './sendEmail'
import { loadSecrets } from './secrets'

const express = require('express')
const serverless = require('serverless-http')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
const router = express.Router()

app.set('trust proxy', '127.0.0.1')

router.post('/send-sms', async (request: Request, response: Response) => {
  const secretKey = request.headers['x-secret-key']
  const SECRETS = await loadSecrets()
  if (!secretKey || secretKey !== SECRETS.FLC_NOTIFY_KEY) {
    return response.status(403).json({
      success: false,
      error: 'Unauthorized access',
      message: 'Invalid or missing API key',
    })
  }

  try {
    return sendSMS(request, response)
  } catch (error) {
    console.error('SMS sending error:', error)
    return response.status(502).json({
      success: false,
      error: 'SMS delivery failed',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    })
  }
})

router.post('/send-email', async (request: Request, response: Response) => {
  const secretKey = request.headers['x-secret-key']
  const SECRETS = await loadSecrets()
  if (!secretKey || secretKey !== SECRETS.FLC_NOTIFY_KEY) {
    return response.status(403).json({
      success: false,
      error: 'Unauthorized access',
      message: 'Invalid or missing API key',
    })
  }

  try {
    return sendEmail(request, response)
  } catch (error) {
    console.error('Email sending error:', error)
    return response.status(502).json({
      success: false,
      error: 'Email delivery failed',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    })
  }
})

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// })

// app.use(limiter)
app.use(cors({ origin: true }), bodyParser.json(), router)

// eslint-disable-next-line import/prefer-default-export
export const handler = serverless(app)
