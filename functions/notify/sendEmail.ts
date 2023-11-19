import { MailgunMessageData } from 'mailgun.js'
import { validateRequest } from './utils'
import { Response, Request } from 'express'
const { loadSecrets } = require('./secrets.js')
const Mailgun = require('mailgun.js')
const formData = require('form-data')
const SECRETS = loadSecrets()

const mailgun = new Mailgun(formData)
const mg = mailgun.client({
  username: 'api',
  key: SECRETS.MAILGUN_API_KEY,
})

export const sendEmail = async (
  request: Request<any, any, MailgunMessageData>,
  response: Response
) => {
  const secretKey = request.headers['x-secret-key']
  if (!secretKey || secretKey !== SECRETS.FLC_NOTIFY_KEY) {
    response.status(403).send('Unauthorized')
  }

  const { from, to, text, html, subject, template } = request.body

  const invalidReq = validateRequest(request.body, ['from', 'to'])

  if (invalidReq) {
    response.status(400).send(invalidReq)
    return
  }

  if (!subject && !template) {
    response.status(400).send('You must provide either subject or template')
    return
  }

  if (!text && !html && !template) {
    response.status(400).send('You must provide either body or html')
    return
  }

  try {
    const res = await mg.messages.create(SECRETS.MAILGUN_DOMAIN, {
      ...request.body,
      from: from || 'FL Accra Admin <no-reply@firstlovecenter.org>',
      to: to || 'test@email.com',
    })

    if (res.message === 'Queued. Thank you.') {
      response.status(200).send('Email Sent Successfully')
      return
    }

    return
  } catch (error) {
    console.error('There was a problem sending your email', error)
    response.status(502).send('There was a problem sending your email')
  }
}
