import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("."));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Variable global para guardar el último código QR generado
let ultimoQR = "";

// 1. Configuración del Cerebro y Manual de Ventas de la Recepcionista Virtual
const SYSTEM_PROMPT = `
Eres la recepcionista virtual, asesora estudiantil y vendedora estrella de la academia Aprueba 360cr Educación Abierta. Tu objetivo principal es atender con muchísimo entusiasmo, empatía y profesionalismo a las personas interesadas en superarse académicamente, respondiendo de forma humanizada.

Información clave de la academia que debes dominar y promocionar:
1. Modalidad: Toda la academia es 100% en línea, a través de internet. No ofrecemos clases presenciales, lo que le permite al estudiante avanzar a su propio ritmo desde cualquier parte del país.
2. Programas de estudio: Nos especializamos en la preparación para Tercer Ciclo (7°, 8° y 9° año) y Bachillerato por Madurez.
3. Propuesta de valor: Brindamos un acompañamiento y seguimiento estudiantil de primer nivel, excelentes profesores y todas las herramientas clave estructuradas para garantizar que el alumno vaya completamente preparado y con total confianza a realizar sus exámenes.
4. Títulos oficiales: Debes aclarar de forma sutil y profesional que nosotros brindamos la preparación de excelencia, el seguimiento y las claves para los exámenes, pero la emisión del título oficial le corresponde directamente al Ministerio de Educación Pública (MEP) una vez que el estudiante apruebe las pruebas correspondientes.

Reglas de comportamiento en WhatsApp:
- Usa un lenguaje sumamente persuasivo, motivador y empático. Conecta con el deseo de superación del cliente.
- Mantén tus respuestas concisas, atractivas y fáciles de leer en el celular. Usa viñetas o respuestas cortas, evita párrafos gigantescos.
- Puedes usar emojis de forma moderada para verte más humana y amigable (ej: 📚, ✨, 🚀).
- Invita siempre al cliente a dar el siguiente paso con entusiasmo si muestra interés en matricularse.
`;

// 2. Inicializar el Cliente de WhatsApp con Autenticación Local
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  }
});

// Capturar el código QR cuando el sistema lo solicite
client.on("qr", (qr) => {
  console.log("¡Nuevo código QR generado!");
  ultimoQR = qr; 
});

// Avisar cuando WhatsApp esté conectado con éxito
client.on("ready", () => {
  console.log("¡El Chatbot de WhatsApp está activo y respondiendo!");
  ultimoQR = "CONECTADO";
});

// 3. Lógica para responder automáticamente los mensajes de WhatsApp entrantes
client.on("message", async (msg) => {
  // Ignorar mensajes de grupos para que el bot no se vuelva loco
  if (msg.from.includes("@g.us")) return;

  try {
    const mensajeUsuario = msg.body;
    const remitente = msg.from;
    const fecha = new Date().toLocaleString();

    // Guardar el registro del prospecto automáticamente en tu lista
    fs.appendFileSync(
      "prospectos.txt",
      ${fecha} | WhatsApp ID: ${remitente} | Mensaje: ${mensajeUsuario}\n
    );

    // Llamar a OpenAI para generar la respuesta humanizada
    const apiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: mensajeUsuario }
      ]
    });

    const respuestaBot = apiResponse.choices[0].message.content;

    // Enviar la respuesta directamente al WhatsApp del cliente
    await client.sendMessage(remitente, respuestaBot);

  } catch (error) {
    console.error("Error al procesar mensaje de WhatsApp:", error);
  }
});

// Arrancar el motor de WhatsApp
client.initialize();

// 4. Rutas del Servidor Web (Página web y Panel de control)

// Ruta para el chat de la página web (mantiene la función actual)
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
    res.status(500).json({ respuesta: "Ocurrió un error en el servidor web." });
  }
});

// Ruta secreta para ver y escanear el Código QR desde el navegador
app.get("/qr", (req, res) => {
  if (ultimoQR === "CONECTADO") {
    res.send("<h1>¡Tu WhatsApp ya está conectado y funcionando perfectamente! 🎉</h1>");
  } else if (!ultimoQR) {
    res.send("<h1>Generando el código QR... Por favor refresca la página en unos segundos. 🔄</h1>");
  } else {
    // Genera una página simple que dibuja el código QR usando la API de Google de forma segura
    res.send(`
      <html>
        <body style="font-family:Arial; text-align:center; padding-top:50px; background:#f5f5f5;">
          <h1>Escanea este QR con el WhatsApp de tu Academia</h1>
          <p>Ve a WhatsApp -> Dispositivos vinculados -> Vincular un dispositivo</p>
          <div style="margin:30px auto;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ultimoQR)}" alt="Código QR de WhatsApp" style="background:white; padding:20px; border-radius:10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/>
          </div>
          <p><i>Nota: Refresca la página si el código expira o no carga.</i></p>
        </body>
      </html>
    `);
  }
});

// Panel de control para ver los prospectos guardados
app.get("/prospectos", (req, res) => {
  let datos = "No hay prospectos todavía.";
  if (fs.existsSync("prospectos.txt")) {
    datos = fs.readFileSync("prospectos.txt", "utf8");
  }
  res.send(`
    <html>
      <head><title>Prospectos APRUEBA360CR</title></head>
      <body style="font-family:Arial; padding:20px; background:#f5f5f5;">
        <h1>Prospectos APRUEBA360CR</h1>
        <pre style="background:white; padding:20px; border-radius:10px; font-size:15px;">\${datos}</pre>
      </body>
    </html>
  `);
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
  console.log(Servidor del Chatbot corriendo en puerto ${PUERTO});
});
Enviado
Escribir mensaje
Escribe en

