# FLC Notify Service

A serverless microservice for sending SMS and email notifications via AWS Lambda.

## Overview

FLC Notify Service is a notification microservice built for First Love Center projects. It provides a secure API to send SMS messages and emails through a unified interface.

## Features

- Send SMS notifications
- Send email notifications
- Secure API with secret key authentication
- Deployed as an AWS Lambda function
- Automated CI/CD with GitHub Actions

## Architecture

This service is deployed as an AWS Lambda function and provides two main endpoints:
- `/send-sms` - For sending SMS messages
- `/send-email` - For sending emails

## Environment Setup

### Prerequisites

- Node.js 20+
- npm
- AWS CLI
- Doppler CLI (for secrets management)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/firstlovecenter/flc-notify-service.git
   cd flc-notify-service
   ```

2. Install dependencies
   ```
   npm ci
   cd functions/notify
   npm ci
   ```

3. Set up environment variables
   The service uses Doppler for secrets management. You need to set up the following environment variables:
   - `FLC_NOTIFY_KEY` - Secret key for API authentication
   - Additional secrets for SMS and email providers

## API Documentation

### Authentication

All API endpoints require the `x-secret-key` header for authentication.

### Send SMS

**Endpoint:** `POST /send-sms`

**Headers:**
- `Content-Type: application/json`
- `x-secret-key: YOUR_SECRET_KEY`

**Request Body:**
```json
{
  "to": "+1234567890",
  "message": "Your message here"
}
```

**Response:**
- `200 OK` - Message sent successfully
- `403 Forbidden` - Invalid or missing secret key
- `502 Bad Gateway` - Failed to send message

### Send Email

**Endpoint:** `POST /send-email`

**Headers:**
- `Content-Type: application/json`
- `x-secret-key: YOUR_SECRET_KEY`

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<p>Email content</p>",
  "from": "sender@example.com"
}
```

**Response:**
- `200 OK` - Email sent successfully
- `403 Forbidden` - Invalid or missing secret key
- `502 Bad Gateway` - Failed to send email

## Deployment

The service is automatically deployed to AWS Lambda when changes are pushed to the `main` branch and affect files in the `functions/notify` directory.

### Manual Deployment

1. Build the project:
   ```
   cd functions/notify
   npm run build
   ```

2. Package the Lambda function:
   ```
   mkdir -p lambda-package
   cp -r functions/notify/*.js lambda-package/
   mkdir -p lambda-package/lib
   cp lib/secrets.js lambda-package/lib/
   cp functions/notify/.env lambda-package/
   cp functions/notify/package.json lambda-package/
   cd lambda-package && npm ci --production
   ```

3. Create the deployment ZIP:
   ```
   cd lambda-package
   zip -r ../notify-lambda.zip .
   ```

4. Deploy to AWS Lambda:
   ```
   aws lambda update-function-code --function-name flc-notify-service --zip-file fileb://notify-lambda.zip
   ```

## CI/CD Pipeline

This project uses GitHub Actions for CI/CD. The workflow:
1. Triggers on pushes to the `main` branch that affect the `functions/notify` directory
2. Installs dependencies
3. Builds the TypeScript code
4. Packages the Lambda function
5. Deploys to AWS Lambda
6. Sends a notification to Slack

## Development

### Project Structure
```
functions/
  notify/
    index.ts      # Main entry point for the Lambda function
    sendEmail.ts  # Email sending functionality
    sendSMS.ts    # SMS sending functionality
    utils.ts      # Utility functions
lib/
  secrets.js      # Secrets management
```

### Local Development

1. Start the service locally:
   ```
   npm run start
   ```

2. Test the endpoints:
   ```
   curl -X POST http://localhost:8888/.netlify/functions/notify/send-sms \
     -H "Content-Type: application/json" \
     -H "x-secret-key: YOUR_SECRET_KEY" \
     -d '{"to": "+1234567890", "message": "Test message"}'
   ```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a Pull Request to the `main` branch

## License

ISC License

## Authors

- John-Dag Addy