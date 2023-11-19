import { Request, Response } from 'express'
import { SECRETS } from './utils'
const { default: axios } = require('axios')

export const sendSMS = async (request: Request, response: Response) => {
  const { recipient, message, sender } = request.body

  if (!recipient) {
    throw new Error('Missing recipient')
  }

  if (!message) {
    throw new Error('Missing message')
  }

  const sendMessage = {
    method: 'post',
    url: `https://api.mnotify.com/api/sms/quick?key=${SECRETS.MNOTIFY_KEY}`,
    headers: {
      'content-type': 'application/json',
    },
    data: {
      recipient: SECRETS.TEST_PHONE_NUMBER
        ? [SECRETS.TEST_PHONE_NUMBER, '0594760323']
        : recipient,
      sender: sender || 'FLC Admin',
      message,
      is_schedule: 'false',
      schedule_date: '',
    },
  }

  try {
    console.log('Sending SMS using mNotify')
    const res = await axios(sendMessage)

    if (res.data.code === '2000') {
      console.log(res.data.message)
      response
        .status(200)
        .send(`SMS Sent Successfully ${JSON.stringify(res.data)}`)
      return
    }

    throw new Error(
      `There was a problem sending your SMS ${JSON.stringify(res.data)}`
    )
  } catch (error) {
    throw new Error(String(error))
  }
}
