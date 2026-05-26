import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.static("."));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/charlar", async (req, res) => {
  try {
    const apiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: req.body.mensaje || "" }]
    });
    res.json({ respuesta: apiResponse.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: true });
  }
});

// WEBHOOK ADAPTADO EXACTAMENTE PARA Z-API
app.post("/webhook-whatsapp", async (req, res) => {
  try {
    // Z-API envía el texto dentro de req.body.text.message
    const mensajeCliente = req.body.text?.message || req.body.message || "";
    
    if (!mensajeCliente) {
      return res.json({ status: "No se detectó texto" });
    }

    const apiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: mensajeCliente }]
    });

    // Z-API espera recibir un objeto simple para responder
    res.json({ text: apiResponse.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: true });
  }
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => { console.log("Servidor listo"); });
