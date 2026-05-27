const express = require("express");
const axios = require("axios");
const { OpenAI } = require("openai");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("."));

// CONEXIÓN DIRECTA CON OPENAI
const openai = new OpenAI({
  apiKey: "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"
});

const INSTANCIA_ID = "3F3B7211DB8141B4C96832FB845BEA5C";
const ZAPI_TOKEN = "6108C6AB5E8B2ECF2BDDD3D2";

app.post("/webhook-whatsapp", async (req, res) => {
  try {
    console.log("Señal recibida desde Z-API");

    const mensajeCliente = req.body.text?.message || req.body.message || "";
    let telefonoCliente = req.body.phone || req.body.chatId || "";

    if (!mensajeCliente) {
      return res.status(200).send("No hay mensaje");
    }

    console.log("Mensaje: " + mensajeCliente + " | Tel: " + telefonoCliente);

    // PETICIÓN A OPENAI
    const apiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: mensajeCliente }],
    });

    const respuestaIA = apiResponse.choices[0].message.content;
    console.log("IA genero la respuesta para la academia.");

    // ENVIAR RESPUESTA A Z-API
    await axios.post(https://api.z-api.io/instances/${INSTANCIA_ID}/token/${ZAPI_TOKEN}/send-text, {
      phone: telefonoCliente,
      message: respuestaIA
    });

    res.status(200).send("Exito");
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor de la academia en puerto " + PORT);
});



