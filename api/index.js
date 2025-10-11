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

app.get('/move', (req, res) => {
  try {
    console.log('📥 Query recibida:', req.query);

    let boardParam = req.query.board;
    const playerParam = req.query.player;

    if (!boardParam || !playerParam) {
      console.error('❌ Parámetros faltantes');
      return res.status(400).json({ 
        error: 'Parámetros board y player requeridos'
      });
    }

    // Manejar array duplicado
    if (Array.isArray(boardParam)) {
      boardParam = boardParam[0];
    }

    // Parsear tablero
    let boardFlat;
    try {
      boardFlat = JSON.parse(boardParam);
      console.log('✅ Board parseado, length:', boardFlat.length);
    } catch (e) {
      console.error('❌ Error parseando board:', e.message);
      return res.status(400).json({ 
        error: 'Formato de board inválido: ' + e.message
      });
    }

    if (!Array.isArray(boardFlat) || boardFlat.length !== 25) {
      console.error('❌ Longitud incorrecta:', boardFlat.length);
      return res.status(400).json({ 
        error: `El tablero debe tener 25 elementos, tiene ${boardFlat.length}`
      });
    }

    const playerId = parseInt(playerParam, 10);
    if (![1, 2].includes(playerId)) {
      console.error('❌ Player inválido:', playerParam);
      return res.status(400).json({ 
        error: 'Player debe ser 1 o 2, recibido: ' + playerParam
      });
    }

    // Convertir a 5x5
    const board5x5 = [];
    for (let i = 0; i < 5; i++) {
      board5x5.push(boardFlat.slice(i * 5, i * 5 + 5));
    }

    // Convertir a símbolos
    const boardForBot = board5x5.map(row => 
      row.map(cell => {
        if (cell === 0) return '';
        if (cell === 1) return 'X';
        if (cell === 2) return 'O';
        return '';
      })
    );

    const botSymbol = playerId === 1 ? 'X' : 'O';
    console.log(`🤖 Calculando para ${botSymbol}...`);

    // Calcular movimiento
    const bestMove = getBestMove(boardForBot, botSymbol);
    console.log('🎯 Bot devolvió:', bestMove);

    if (!bestMove || typeof bestMove.row !== 'number' || typeof bestMove.col !== 'number') {
      console.error('❌ Movimiento del bot inválido:', bestMove);
      
      // Fallback
      const available = boardFlat.map((v, i) => v === 0 ? i : -1).filter(i => i !== -1);
      if (available.length > 0) {
        const fallbackMove = available[0];
        console.log('⚠️ Usando fallback:', fallbackMove);
        return res.json({ move: fallbackMove });
      }
      
      return res.status(500).json({ error: 'Bot no pudo calcular movimiento' });
    }

    const moveLineal = bestMove.row * 5 + bestMove.col;
    console.log(`📤 Enviando move: ${moveLineal} (row:${bestMove.row}, col:${bestMove.col})`);

    // Validar casilla vacía
    if (boardFlat[moveLineal] !== 0) {
      console.error('❌ Casilla ocupada:', moveLineal, 'valor:', boardFlat[moveLineal]);
      
      const available = boardFlat.map((v, i) => v === 0 ? i : -1).filter(i => i !== -1);
      if (available.length > 0) {
        console.log('⚠️ Usando alternativa:', available[0]);
        return res.json({ move: available[0] });
      }
      
      return res.status(500).json({ error: 'No hay movimientos válidos' });
    }

    // ✅ Respuesta final
    const response = { move: moveLineal };
    console.log('✅ Respuesta final:', JSON.stringify(response));
    
    return res.json(response);

  } catch (error) {
    console.error('💥 Error fatal:', error);
    return res.status(500).json({ 
      error: 'Error interno: ' + error.message
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    mensaje: '🤖 Bot Tateti 5x5',
    version: '2.0.2',
    estado: 'Activo',
    endpoints: {
      move: '/move?board=[...]&player=1',
      health: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Bot en puerto ${PORT}`);
  });
}

module.exports = app;