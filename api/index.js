const express = require('express');
const { getBestMove } = require('../bot/tatetiminimax');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 🎮 ENDPOINT PRINCIPAL
app.get('/move', (req, res) => {
  try {
    let boardParam = req.query.board;
    const playerParam = req.query.player;

    if (!boardParam || !playerParam) {
      return res.status(400).json({ 
        error: 'Parámetros board y player requeridos'
      });
    }

    if (Array.isArray(boardParam)) {
      boardParam = boardParam[0];
    }

    let boardFlat;
    try {
      boardFlat = JSON.parse(boardParam);
    } catch (e) {
      return res.status(400).json({ 
        error: 'Formato de board inválido'
      });
    }

    if (!Array.isArray(boardFlat) || boardFlat.length !== 25) {
      return res.status(400).json({ 
        error: 'El tablero debe tener 25 elementos'
      });
    }

    const playerId = parseInt(playerParam, 10);
    if (![1, 2].includes(playerId)) {
      return res.status(400).json({ 
        error: 'Player debe ser 1 o 2'
      });
    }

    const board5x5 = [];
    for (let i = 0; i < 5; i++) {
      board5x5.push(boardFlat.slice(i * 5, i * 5 + 5));
    }

    const boardForBot = board5x5.map(row => 
      row.map(cell => {
        if (cell === 0) return '';
        if (cell === 1) return 'X';
        if (cell === 2) return 'O';
        return '';
      })
    );

    const botSymbol = playerId === 1 ? 'X' : 'O';
    const bestMove = getBestMove(boardForBot, botSymbol);

    if (!bestMove || typeof bestMove.row !== 'number' || typeof bestMove.col !== 'number') {
      const available = boardFlat.map((v, i) => v === 0 ? i : -1).filter(i => i !== -1);
      if (available.length > 0) {
        return res.json({ move: available[0] });
      }
      return res.status(500).json({ error: 'No se pudo calcular movimiento' });
    }

    const moveLineal = bestMove.row * 5 + bestMove.col;

    if (boardFlat[moveLineal] !== 0) {
      const available = boardFlat.map((v, i) => v === 0 ? i : -1).filter(i => i !== -1);
      if (available.length > 0) {
        return res.json({ move: available[0] });
      }
      return res.status(500).json({ error: 'No hay movimientos válidos' });
    }

    return res.json({ move: moveLineal });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Error interno del servidor'
    });
  }
});

// 🏠 HOMEPAGE
app.get('/', (req, res) => {
  res.json({
    nombre: '🤖 Bot Tateti 5x5',
    version: '2.0.3',
    estado: '✅ Activo',
    endpoints: {
      move: '/move?board=[...]&player=1',
      health: '/health'
    },
    ejemplo: '/move?board=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]&player=1'
  });
});

// 💚 HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// 🧩 Evitar spam de favicon en logs (opcional pero recomendado)
app.get('/favicon.ico', (req, res) => res.status(204).end());

// 🚫 404 para rutas no definidas (opcional)
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    disponibles: ['/', '/move', '/health']
  });
});

// 🚀 Iniciar servidor (solo local)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Bot escuchando en puerto ${PORT}`);
    console.log(`✅ http://localhost:${PORT}`);
  });
}

module.exports = app;