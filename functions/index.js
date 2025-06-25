const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true }); // <-- habilita CORS automaticamente

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: "no-reply@canalvivo.org",
    pass: "erLqyzYWSBMD"
  }
});

exports.sendPrePaymentEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { uid, email } = req.body;

    const mailOptions = {
      from: '"Temarix" <no-reply@canalvivo.org>',
      to: email,
      subject: "🌟 Temarix - Confirmação antes do pagamento",
      text: `Olá! Confirmamos seu e-mail (${email}) antes do pagamento. Em breve você receberá instruções.`
    };

    try {
      await transporter.sendMail(mailOptions);
      return res.status(200).send("E-mail enviado com sucesso.");
    } catch (error) {
      console.error("Erro ao enviar:", error);
      return res.status(500).send("Erro ao enviar o e-mail.");
    }
  });
});
