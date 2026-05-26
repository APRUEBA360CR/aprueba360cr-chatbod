const express = require("express");
const OpenAI = require("openai");
const axios = require("axios");

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
    console.log("¡Señal recibida desde Z-API!");
    
    const mensajeCliente = req.body.text?.message || req.body.message || "";
    let telefonoCliente = req.body.phone || req.body.chatId || "";

    if (!mensajeCliente || !telefonoCliente) {
      console.log("Notificación sin texto de mensaje.");
      return res.status(200).json({ status: "ok" });
    }

    telefonoCliente = telefonoCliente.replace("@c.us", "").trim();
    console.log(Mensaje del cliente: ${mensajeCliente} | Teléfono: ${telefonoCliente});

    const apiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: mensajeCliente }]
    });

    const respuestaIA = apiResponse.choices[0].message.content;
    console.log(IA generó la respuesta para la academia.);

    const urlZapi = https://api.z-api.io/instances/${INSTANCIA_ID}/token/${ZAPI_TOKEN}/send-text;
    
    await axios.post(urlZapi, {
      phone: telefonoCliente,
      text: respuestaIA
    });

    console.log("¡Mensaje enviado de vuelta a WhatsApp con éxito!");
    return res.status(200).json({ enviado: true });

  } catch (error) {
    console.error("Error en proceso de webhook:", error?.response?.data || error.message);
    return res.status(200).json({ error: true });
  }
});

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

// USAMOS EL PUERTO POR DEFECTO REQUERIDO POR RENDER
const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, "0.0.0.0", () => { 
  console.log(Servidor de la academia corriendo con éxito en el puerto ${PUERTO}); 
});
Enviado hace 1 mi
