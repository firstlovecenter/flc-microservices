const { default: axios } = require('axios')
const { loadSecrets } = require('./secrets.js')
const express = require('express')
const serverless = require('serverless-http')
const cors = require('cors')
const bodyParser = require('body-parser')

const SECRETS = loadSecrets()
const app = express()
const router = express.Router()

router.post(
  '/send-sms',
  async (
    request: { body: { recipient: any; message: any } },
    response: {
      status: (arg0: number) => {
        (): any
        new (): any
        send: { (arg0: string): void; new (): any }
      }
    }
  ) => {
    const { recipient, message } = request.body

    if (!recipient) {
      response.status(400).send('Missing recipient')
      return
    }

    if (!message) {
      response.status(400).send('Missing message')
      return
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
        sender: 'FLC Admin',
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
          .send(
            `There was a problem sending your SMS ${JSON.stringify(res.data)}`
          )
        return
      }

      response
        .status(400)
        .send(
          `There was a problem sending your SMS ${JSON.stringify(res.data)}`
        )
      return
    } catch (error) {
      console.error('There was a problem sending your message', error)
      response.status(502).send('There was a problem sending your message')
    }
  }
)

app.use(cors({ origin: true }), bodyParser.json(), router)
app.use('/.netlify/functions/notify', router)

module.exports.handler = serverless(app)
