import { MailgunMessageData } from 'mailgun.js'
import { router } from './notify'
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

router.post(
  '/send-email',
  async (
    request: Request<any, any, MailgunMessageData>,
    response: Response
  ) => {
    const { from, to, subject, text, html, cc, bcc } = request.body

    const invalidReq = validateRequest(request.body, [
      'sender',
      'recipient',
      'subject',
    ])

    if (invalidReq) {
      response.status(400).send(invalidReq)
      return
    }

    if (!text && !html) {
      response.status(400).send('You must provide either body or html')
      return
    }

    try {
      const res = await mg.messages.create(SECRETS.MAILGUN_DOMAIN, {
        from: from || 'FL Accra Admin <no-reply@firstlovecenter.org>',
        to: to || 'test@email.com',
        subject,
        text,
        template: '',
        html: html || undefined, // HTML Version of the Message for Better Styling
        cc,
        bcc,
      })

      return
    } catch (error) {
      console.error('There was a problem sending your email', error)
      response.status(502).send('There was a problem sending your email')
    }
  }
)
