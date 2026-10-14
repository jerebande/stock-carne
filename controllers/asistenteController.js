const Asistente = require('../models/Asistente');
const Groq = require('../services/groq');

function validarHistorial(historial) {
  if (historial === undefined) return [];
  if (!Array.isArray(historial) || historial.length > 10) return null;

  const mensajes = [];
  for (const mensaje of historial) {
    if (
      !mensaje ||
      !['user', 'assistant'].includes(mensaje.role) ||
      typeof mensaje.content !== 'string' ||
      !mensaje.content.trim() ||
      mensaje.content.length > 1000
    ) {
      return null;
    }
    mensajes.push({ role: mensaje.role, content: mensaje.content.trim() });
  }
  return mensajes;
}

const asistenteController = {
  mostrar(req, res) {
    res.render('asistente', { groqConfigured: Boolean(process.env.GROQ_API_KEY) });
  },

  async consultar(req, res) {
    const pregunta = typeof req.body.pregunta === 'string' ? req.body.pregunta.trim() : '';
    if (!pregunta || pregunta.length > 300) {
      return res.status(400).json({ error: 'Escribí una consulta de hasta 300 caracteres.' });
    }
    if (!Groq.estaConfigurado()) {
      return res.status(503).json({
        error: 'La IA todavía no está configurada. Definí GROQ_API_KEY en las variables de entorno y reiniciá el servidor.',
      });
    }
    const historial = validarHistorial(req.body.historial);
    if (!historial) {
      return res.status(400).json({ error: 'El historial de la conversación no es válido. Actualizá la página e intentá de nuevo.' });
    }

    const usuarioId = req.session.usuario.id;
    try {
      const [resumen, productos, stockBajo, movimientos] = await Promise.all([
        Asistente.resumenStock(usuarioId),
        Asistente.productosParaContexto(usuarioId, 100),
        Asistente.listarBajoStock(usuarioId, 20),
        Asistente.ultimosMovimientos(usuarioId, 30),
      ]);

      const mensaje = await Groq.responder({
        pregunta,
        historial,
        contexto: {
          resumen,
          productos,
          productosEnContexto: productos.length,
          contextoLimitado: Number(resumen.total) > productos.length,
          stockBajo,
          ultimosMovimientos: movimientos,
        },
      });
      return res.json({ mensaje });
    } catch (error) {
      if (error instanceof Groq.GroqError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error(error);
      return res.status(500).json({ error: 'No se pudo consultar el inventario. Intentá nuevamente.' });
    }
  },
};

module.exports = asistenteController;
