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

// Configure middleware
app.use(cors({ origin: true }))
app.use(bodyParser.json())

// Set trusted proxy
app.set('trust proxy', '127.0.0.1')

// Health check endpoint
router.get('/', (request: Request, response: Response) => {
  response.status(200).json({
    success: true,
    message: 'Service is healthy',
  })
})

// SMS endpoint
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
    // Log error details
    return response.status(502).json({
      success: false,
      error: 'SMS delivery failed',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    })
  }
})

// Email endpoint
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
    // Log error details
    return response.status(502).json({
      success: false,
      error: 'Email delivery failed',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    })
  }
})

// Register the router
app.use('/', router)

// Catch-all route
app.use('*', (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: 'The requested endpoint does not exist',
  })
})

// Create serverless handler with more flexible configuration
// eslint-disable-next-line import/prefer-default-export
export const handler = serverless(app)
