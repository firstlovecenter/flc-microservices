import Mailgun, { MailgunMessageData } from 'mailgun.js'
import { Response, Request } from 'express'
import formData from 'form-data'
import { validateRequest } from './utils'
import { loadSecrets } from './secrets'

const mailgun = new Mailgun(formData)

export const sendEmail = async (
  request: Request<any, any, MailgunMessageData>,
  response: Response
) => {
  const SECRETS = await loadSecrets()
  const mg = mailgun.client({
    username: 'api',
    key: SECRETS.MAILGUN_API_KEY,
  })

  const { from, to, text, html, subject, template } = request.body

  // Validate required fields
  const invalidReq = validateRequest(request.body, ['from', 'to'])
  if (invalidReq) {
    return response.status(400).json({
      success: false,
      error: 'Validation error',
      message: invalidReq,
    })
  }

  // Validate content requirements
  if (!subject && !template) {
    return response.status(400).json({
      success: false,
      error: 'Validation error',
      message: 'You must provide either subject or template',
    })
  }

  if (!text && !html && !template) {
    return response.status(400).json({
      success: false,
      error: 'Validation error',
      message: 'You must provide either body text, HTML content, or a template',
    })
  }

  // Process template variables
  const body = {
    ...request.body,
    't:variables':
      typeof request.body['t:variables'] !== 'string'
        ? JSON.stringify(request.body['t:variables'])
        : request.body['t:variables'],
  }

  try {
    const res = await mg.messages.create(SECRETS.MAILGUN_DOMAIN, {
      ...body,
      from: from || 'FL Accra Admin <no-reply@firstlovecenter.org>',
      to: to || 'test@email.com',
    })

    if (res.message === 'Queued. Thank you.') {
      return response.status(200).json({
        success: true,
        message: 'Email sent successfully',
        data: { id: res.id },
      })
    }
    // For unexpected response formats
    return response.status(502).json({
      success: false,
      error: 'Email provider error',
      message: 'Unexpected response from email provider',
      data: res,
    })
  } catch (error) {
    console.error('Email sending error details:', error)

    // Handle specific Mailgun errors if possible
    if (error instanceof Error) {
      // Check if it's a Mailgun API error with structured data
      const errorData = error.message
        && error.message.startsWith('{')
        && error.message.endsWith('}')
        ? JSON.parse(error.message)
        : null

      if (errorData) {
        return response.status(502).json({
          success: false,
          error: 'Email provider error',
          message: errorData.message || 'Failed to send email',
          code: errorData.statusCode,
          details: errorData,
        })
      }

      // Generic error handling
      return response.status(500).json({
        success: false,
        error: 'Email delivery failed',
        message: error.message,
      })
    }

    // Fallback for unknown error types
    return response.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Unknown error occurred while sending email',
    })
  }
}

export default sendEmail
