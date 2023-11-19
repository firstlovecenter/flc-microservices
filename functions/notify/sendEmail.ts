import Mailgun, { MailgunMessageData } from 'mailgun.js'
import { Response, Request } from 'express'
import formData from 'form-data'
import { SECRETS, validateRequest } from './utils'

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
    return
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

  const body = {
    ...request.body,
    't:variables': JSON.stringify(request.body['t:variables']),
  }

  try {
    const res = await mg.messages.create(SECRETS.MAILGUN_DOMAIN, {
      ...body,
      from: from || 'FL Accra Admin <no-reply@firstlovecenter.org>',
      to: to || 'test@email.com',
    })

    if (res.message === 'Queued. Thank you.') {
      response.status(200).send('Email Sent Successfully')
    }
  } catch (error) {
    throw new Error(String(JSON.stringify(error)))
  }
}

export default sendEmail
