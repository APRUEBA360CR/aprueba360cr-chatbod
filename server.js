const apiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: mensajeCliente }],
    });

    const respuestaIA = apiResponse.choices[0].message.content;
    console.log("IA genero la respuesta para la academia.");

    // ENVIAR RESPUESTA DE VUELTA A Z-API
    await axios.post(https://api.z-api.io/instances/${INSTANCIA_ID}/token/${ZAPI_TOKEN}/send-text, {
      phone: telefonoCliente,
      message: respuestaIA
    });

    res.status(200).send("Mensaje procesado con exito");
  } catch (error) {
    console.error("Error en el servidor de la academia:", error.message);
    res.status(500).send("Error interno");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor de la academia en puerto " + PORT);
});
