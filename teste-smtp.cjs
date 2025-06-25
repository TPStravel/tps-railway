const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: "no-reply@canalvivo.org",
    pass: "erLqyzYWSBMD"
  }
});

const mailOptions = {
  from: "no-reply@canalvivo.org",
  to: "jualigi@gmail.com",
  subject: "🚀 Teste de envio via SMTP - Canal Vivo",
  text: "Olá Richard, este é um teste real via SMTP Zoho!",
};

transporter.sendMail(mailOptions, function (error, info) {
  if (error) {
    return console.log("❌ ERRO:", error);
  }
  console.log("✅ E-mail enviado com sucesso:", info.response);
});
