// ./bin/encrypt-secrets.js
const secrets = require('gitops-secrets')

async function main() {
  const payload = await secrets.providers.doppler.fetch()
  secrets.build(payload, { path: 'lib/secrets.js' })
  secrets.build(payload, { path: 'payment/secrets.js' })
  secrets.build(payload, { path: 'notify/secrets.js' })
}

main()
