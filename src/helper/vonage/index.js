const { Vonage } = require('@vonage/server-sdk');

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
})

exports.sendVerificationCode = async (phone_number) => {
    const resp = await vonage.verify.start({
      number: phone_number,
      brand: "RellaNFT",
      codeLength:6
    });
    return resp.request_id;
}

exports.verifyCheck = async (request_id, code) => {
    const resp = await vonage.verify.check(request_id, code);
    return resp;
}