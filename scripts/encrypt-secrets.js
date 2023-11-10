// ./bin/encrypt-secrets.js
const secrets = require('gitops-secrets')

async function main() {
  const payload = await secrets.providers.doppler.fetch()
  secrets.build(payload, { path: 'lib/secrets.js' })
  secrets.build(payload, { path: 'functions/payment/secrets.js' })
  secrets.build(payload, { path: 'functions/notify/secrets.js' })
}

main()
