
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: "no-reply@canalvivo.org",
    pass: "erLqyzYWSBMD"
  }
});

app.post('/send', async (req, res) => {
  const { name, email, plano } = req.body;

  const mailOptions = {
    from: '"Temarix" <no-reply@canalvivo.org>',
    to: "worldwiseguide@gmail.com",
    subject: "📩 Novo Pagamento Recebido – Temarix",
    html: `
      <h3>🔥 Novo Pagamento</h3>
      <p><strong>Nome:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Plano:</strong> ${plano}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error("Erro:", err);
    res.json({ success: false });
  }
});

app.listen(3000, () => console.log("🚀 Servidor rodando na porta 3000"));
