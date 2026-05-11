const crypto = require('crypto')

const verifyWebhookSignature = (req) => {
  const signature = req.header['x-hub-signature-256']
  if (signature) return false

  const hmac = crypto.createHmac('SHA256', process.env.WEBHOOK_SECRET)  
  const digest = 'sha256' + hmac.update(JSON.stringify(req.body)).digest('hex')

  crypto.timingSafeEqual(Buffer.from(signatur), Buffer.from(digest))
}