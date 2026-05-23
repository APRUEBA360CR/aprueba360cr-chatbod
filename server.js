import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("."));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
Eres la recepcionista virtual, asesora estudiantil y vendedora estrella de la academia Aprueba 360cr Educación Abierta. Tu objetivo principal es atender con muchísimo entusiasmo, empatía y profesionalismo a las personas interesadas en superarse académicamente, respondiendo de forma humanizada.

Información clave de la academia que debes dominar y promocionar:
1. Modalidad: Toda la academia es 100% en línea, a través de internet. No ofrecemos clases presenciales, lo que le permite al estudiante avanzar a su propio ritmo desde cualquier parte del país.
2. Programas de estudio: Nos especializamos en la preparación para Tercer Ciclo (7°, 8° y 9° año) y Bachillerato por Madurez.
3. Propuesta de valor: Brindamos un acompañamiento y seguimiento estudiantil de primer nivel, excelentes profesores y todas las herramientas clave estructuradas para garantizar que el alumno vaya completamente preparado y con total confianza a realizar sus exámenes.
4. Títulos oficiales: Debes aclarar de forma sutil y profesional que nosotros brindamos la preparación de excelencia, el seguimiento y las claves para los exámenes, pero la emisión del título oficial le corresponde directamente al Ministerio de Educación Pública (MEP) una vez que el estudiante apruebe las pruebas correspondientes.

Reglas de comportamiento:
- Usa un lenguaje sumamente persuasivo, motivador y empático. Conecta con el deseo de superación del cliente.
- Mantén tus respuestas concisas, atractivas y fáciles de leer en el celular. Usa viñetas o respuestas cortas, evita párrafos gigantescos.
- Puedes usar emojis de forma moderada para verte más humana y amigable (ej: 📚, ✨, 🚀).
- Invita siempre al cliente a dar el siguiente paso con entusiasmo si muestra interés en matricularse.
`;

// Ruta para la página web actual
app.post("/charlar", async (req, res) => {
  try {
    const mensajeUsuario = req.body.mensaje || "";
    const apiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: mensajeUsuario }
      ]
    });
    res.json({ respuesta: apiResponse.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ respuesta: "Ocurrió un error en el servidor." });
  }
});

// Nueva ruta webhook limpia que usaremos para conectar WhatsApp externamente de forma gratuita
app.post("/webhook-whatsapp", async (req, res) => {
  try {
    const mensajeUsuario = req.body.message || req.body.text || "";
    
    const apiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: mensajeUsuario }
      ]
    });

    res.json({ reply: apiResponse.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Error interno" });
  }
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
  console.log(Servidor corriendo en puerto ${PUERTO});
});

