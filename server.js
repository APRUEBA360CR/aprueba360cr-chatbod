import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("."));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/chat", async (req, res) => {
  try {
    const nombre = req.body.nombre || "Sin nombre";
    const telefono = req.body.telefono || "Sin teléfono";
    const userMessage = req.body.message || "";

    const fecha = new Date().toLocaleString();

    fs.appendFileSync(
      "prospectos.txt",
      fecha + " | Nombre: " + nombre + " | WhatsApp: " + telefono + " | Mensaje: " + userMessage + "\n"
    );

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 90,
      messages: [
        {
          role: "system",
          content: "Eres asesor humano de APRUEBA360CR, academia en Costa Rica especializada en Tercer Ciclo: sétimo, octavo y noveno, y Bachillerato por Madurez para exámenes MEP. Responde máximo 2 frases cortas, natural, cálido y vendedor. Si el estudiante pregunta por sétimo, octavo o noveno, responde solo sobre ese nivel. Si pregunta por tercer ciclo, explica que incluye sétimo, octavo y noveno. Si pregunta por bachillerato, responde sobre Bachillerato por Madurez. No des definiciones generales. No respondas como robot. Enfócate en ayudarle a aprobar, avanzar y superarse. Termina con una pregunta breve para captar interés, materia o WhatsApp."
        },
        {
          role: "user",
          content: "Nombre: " + nombre + " | WhatsApp: " + telefono + " | Mensaje: " + userMessage
        }
      ]
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("Error en servidor:", error);
    res.status(500).json({
      reply: "Lo siento, ocurrió un error. Por favor intenta de nuevo o escríbenos por WhatsApp."
    });
  }
});

app.get("/prospectos", (req, res) => {
  let datos = "No hay prospectos todavía.";

  if (fs.existsSync("prospectos.txt")) {
    datos = fs.readFileSync("prospectos.txt", "utf8");
  }

  res.send(`
    <html>
      <head>
        <title>Prospectos APRUEBA360CR</title>
      </head>
      <body style="font-family:Arial; padding:20px; background:#f5f5f5;">
        <h1>Prospectos APRUEBA360CR</h1>
        <pre style="background:white; padding:20px; border-radius:10px; font-size:15px;">${datos}</pre>
      </body>
    </html>
  `);
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log("Chatbot Academia funcionando en http://localhost:" + PORT);
});

