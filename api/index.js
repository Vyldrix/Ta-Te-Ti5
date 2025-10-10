const express = require('express');
const { getBestMove } = require('../bot/tatetiminimax'); // tu bot Minimax
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/**
 * ENDPOINT PRINCIPAL - GET /move?board=[...]&player=1
 * El árbitro envía:
 *  - board: array plano de 25 posiciones
 *  - player: 1 o 2
 */
app.get('/move', (req, res) => {
  try {
    let boardParam = req.query.board;
    const playerId = parseInt(req.query.player, 10);

    if (!boardParam) {
      return res.status(400).json({ error: 'Parametro board requerido' });
    }

    if (Array.isArray(boardParam)) {
      boardParam = boardParam[0]; // por si llega repetido
    }

    const board = JSON.parse(boardParam);

    if (!Array.isArray(board) || board.length !== 25) {
      return res.status(400).json({ error: 'El tablero debe ser un array plano de 25 celdas' });
    }

    // Convertir array plano a matriz 5x5
    const board5x5 = [];
    for (let i = 0; i < 5; i++) {
      board5x5.push(board.slice(i * 5, i * 5 + 5));
    }

    // Determinar símbolo del bot
    const botSymbol = playerId === 1 ? 'X' : 'O';
    const boardForBot = convertirTablero(board5x5);

    // Calcular mejor movimiento
    const move = getBestMove(boardForBot, botSymbol);

    // Convertir a índice lineal (0-24) para el árbitro
    const linearMove = move.row * 5 + move.col;

    // Validar movimiento
    if (linearMove < 0 || linearMove > 24 || board[linearMove] !== 0) {
      console.error("Movimiento inválido detectado por el bot", move, linearMove, board);
      return res.status(500).json({ error: 'Bot devolvió movimiento inválido', move });
    }

    return res.json({ move: linearMove });

  } catch (error) {
    console.error("Error en /move:", error.message);
    return res.status(500).json({ error: 'Error al calcular movimiento', detalles: error.message });
  }
});

/**
 * Convierte tablero numérico a formato del bot
 * 0 -> ''
 * 1 -> 'X'
 * 2 -> 'O'
 */
function convertirTablero(board) {
  return board.map(row =>
    row.map(cell => {
      if (cell === 0) return '';
      if (cell === 1) return 'X';
      if (cell === 2) return 'O';
      return '';
    })
  );
}

/**
 * ENDPOINT DE BIENVENIDA
 */
app.get('/', (req, res) => {
  res.json({
    mensaje: '¡Hola! 👋 Estoy funcionando correctamente',
    nombre: 'Bot de Tateti 5x5',
    version: '1.0.2',
    estado: 'Activo ✅',
    bot: 'Minimax con poda alfa-beta activado 🤖',
    endpoints: {
      jugada: 'GET /move?board=[[...]]&player=1',
      salud: 'GET /health'
    }
  });
});

/**
 * ENDPOINT DE HEALTH CHECK
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK ✅',
    message: 'El servidor está funcionando correctamente',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    bot: 'Listo para jugar 🎮'
  });
});

// Iniciar servidor (local)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor de tateti 5x5 escuchando en el puerto ${PORT}`);
    console.log(`🤖 Bot inteligente con Minimax activado`);
    console.log(`✅ Servidor listo en http://localhost:${PORT}`);
  });
}

// Para Vercel
module.exports = app;