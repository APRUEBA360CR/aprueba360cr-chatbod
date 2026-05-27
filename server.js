const express = require('express');
const axios = require('axios');
const { OpenAI } = require('openai');
const app = express();

app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post("/webhook-whatsapp", async (req, res) => {
    console.log("¡Señal recibida desde Z-API!");
    console.log("Datos recibidos:", JSON.stringify(req.body));

    try {
        const telefono = req.body.phone || req.body.chatId || "";
        const mensaje = req.body.text?.message || req.body.message || "";

        if (!mensaje) return res.sendStatus(200);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: mensaje }],
        });

        const respuesta = completion.choices[0].message.content;

        // URL configurada con tu instancia y token
        const urlZapi = "https://api.z-api.io/instances/3F3B7211DB8141B4C96832FB845BEA5C/token/6108C6AB5E8B2ECF2DBDD3D2/send-text";

        await axios.post(urlZapi, {
            phone: telefono,
            message: respuesta
        });

        res.sendStatus(200);
    } catch (e) {
        console.error("Error detallado:", e.response?.data || e.message);
        res.sendStatus(500);
    }
});

app.listen(process.env.PORT || 3000);
