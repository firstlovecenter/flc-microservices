import { Request, Response } from 'express'
import { loadSecrets } from './secrets'

const { default: axios } = require('axios')

export const sendSMS = async (request: Request, response: Response) => {
  const { recipient, message, sender } = request.body

  // Validate required fields
  if (!recipient) {
    return response.status(400).json({
      success: false,
      error: 'Validation error',
      message: 'Missing recipient field',
    })
  }

  if (!message) {
    return response.status(400).json({
      success: false,
      error: 'Validation error',
      message: 'Missing message field',
    })
  }

  // Format phone numbers if needed (add validation here if necessary)
  const recipients = Array.isArray(recipient) ? recipient : [recipient]

  const SECRETS = await loadSecrets()

  const sendMessage = {
    method: 'post',
    url: `https://api.mnotify.com/api/sms/quick?key=${SECRETS.MNOTIFY_KEY}`,
    headers: {
      'content-type': 'application/json',
    },
    data: {
      recipient: SECRETS.TEST_PHONE_NUMBER
        ? [SECRETS.TEST_PHONE_NUMBER, '0594760323']
        : recipients,
      sender: sender || 'FLC Admin',
      message,
      is_schedule: 'false',
      schedule_date: '',
    },
  }

  try {
    const res = await axios(sendMessage)

    if (res.data.code === '2000') {
      return response.status(200).json({
        success: true,
        message: 'SMS sent successfully',
        data: res.data,
      })
    }

    // API returned an error code
    return response.status(502).json({
      success: false,
      error: 'SMS provider error',
      message: `Failed to send SMS: ${
        res.data.message || 'Unknown provider error'
      }`,
      data: res.data,
    })
  } catch (error) {
    console.error('SMS send error details:', error)

    // Handle network errors or other axios errors
    if (axios.isAxiosError(error)) {
      return response.status(502).json({
        success: false,
        error: 'SMS provider connection error',
        message: error.message || 'Failed to connect to SMS provider',
        data: error.response?.data,
      })
    }

    // Handle other unexpected errors
    return response.status(500).json({
      success: false,
      error: 'Internal server error',
      message:
        error instanceof Error
          ? error.message
          : 'Unknown error occurred while sending SMS',
    })
  }
}

export default sendSMS
