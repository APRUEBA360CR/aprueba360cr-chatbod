const express = require("express");
const axios = require("axios");
const { OpenAI } = require("openai");

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/webhook-whatsapp", async (req, res) => {
  try {
    const { phone, chatId, text } = req.body;
    const mensajeCliente = text?.message || req.body.message || "";
    const telefono = phone || chatId || "";

    if (!mensajeCliente) return res.sendStatus(200);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: mensajeCliente }],
    });

    await axios.post(https://api.z-api.io/instances/3F3B7211DB8141B4C96832FB845BEA5C/token/6108C6AB5E8B2ECF2BDDD3D2/send-text, {
      phone: telefono,
      message: completion.choices[0].message.content
    });

    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT || 3000);
