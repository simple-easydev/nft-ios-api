const { Vonage } = require('@vonage/server-sdk')
const { NCCOBuilder, Talk, OutboundCallWithNCCO } = require('@vonage/voice')
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
  applicationId: process.env.VONAGE_APPLICATION_ID,
  privateKey: `${__dirname}/private.key`,
})

exports.onInboundCall = (phone_number) => {
    const ncco = [{
        action: 'connect',
        from: process.env.VONAGE_PHONE_NUMBER,
        endpoint: [{
          type: 'phone',
          number: phone_number
        }]
    }]
    return ncco;
}