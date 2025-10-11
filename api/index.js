const express = require('express');
const { getBestMove } = require('../bot/tatetiminimax');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// ✅ CORS para permitir peticiones desde otros dominios
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/**
 * ENDPOINT ADAPTADO PARA EL ÁRBITRO
 * GET /move?board=[0,1,2,...]&player=1
 */
app.get('/move', (req, res) => {
  try {
    console.log('📥 Request recibida:', {
      query: req.query,
      url: req.url,
      headers: req.headers
    });

    let boardParam = req.query.board;
    const playerParam = req.query.player;

    if (!boardParam || !playerParam) {
      console.error('❌ Parámetros faltantes:', { boardParam, playerParam });
      return res.status(400).json({ 
        error: 'Parámetros board y player requeridos',
        received: { board: !!boardParam, player: !!playerParam }
      });
    }

    // 🔧 Manejar caso donde board viene como array (bug de algunos proxies)
    if (Array.isArray(boardParam)) {
      console.log('⚠️ Board vino como array, tomando primer elemento');
      boardParam = boardParam[0];
    }

    // Parsear el tablero
    let boardFlat;
    try {
      boardFlat = JSON.parse(boardParam);
    } catch (e) {
      console.error('❌ Error parseando board:', e.message);
      return res.status(400).json({ 
        error: 'Formato de board inválido',
        details: e.message,
        received: boardParam.substring(0, 100)
      });
    }

    // Validar longitud del tablero
    if (!Array.isArray(boardFlat) || boardFlat.length !== 25) {
      console.error('❌ Tablero con longitud incorrecta:', boardFlat.length);
      return res.status(400).json({ 
        error: 'El tablero debe tener 25 elementos (5x5)',
        received: boardFlat.length
      });
    }

    const playerId = parseInt(playerParam, 10);
    if (![1, 2].includes(playerId)) {
      console.error('❌ Player ID inválido:', playerParam);
      return res.status(400).json({ 
        error: 'Player debe ser 1 o 2',
        received: playerParam
      });
    }

    // Convertir array plano a matriz 5x5
    const board5x5 = [];
    for (let i = 0; i < 5; i++) {
      board5x5.push(boardFlat.slice(i * 5, i * 5 + 5));
    }

    // Convertir números a símbolos
    const boardForBot = board5x5.map(row => 
      row.map(cell => {
        if (cell === 0) return '';
        if (cell === 1) return 'X';
        if (cell === 2) return 'O';
        return '';
      })
    );

    // Determinar símbolo del bot
    const botSymbol = playerId === 1 ? 'X' : 'O';

    console.log(`🤖 Calculando movimiento para ${botSymbol}...`);

    // Obtener la mejor jugada
    const bestMove = getBestMove(boardForBot, botSymbol);

    if (!bestMove || typeof bestMove.row !== 'number' || typeof bestMove.col !== 'number') {
      console.error('❌ Bot devolvió movimiento inválido:', bestMove);
      
      // Fallback: buscar primera casilla disponible
      const available = [];
      for (let i = 0; i < boardFlat.length; i++) {
        if (boardFlat[i] === 0) available.push(i);
      }
      
      if (available.length === 0) {
        return res.status(400).json({ error: 'No hay movimientos disponibles' });
      }

      console.log('⚠️ Usando fallback:', available[0]);
      return res.json({ move: available[0], fallback: true });
    }

    // Convertir coordenadas a índice lineal
    const moveLineal = bestMove.row * 5 + bestMove.col;

    // Validar que la casilla esté vacía
    if (boardFlat[moveLineal] !== 0) {
      console.error('❌ Bot intentó jugar en casilla ocupada:', moveLineal, boardFlat[moveLineal]);
      
      // Buscar alternativa
      const available = [];
      for (let i = 0; i < boardFlat.length; i++) {
        if (boardFlat[i] === 0) available.push(i);
      }
      
      if (available.length > 0) {
        console.log('⚠️ Usando casilla alternativa:', available[0]);
        return res.json({ move: available[0], fallback: true });
      }

      return res.status(400).json({ error: 'No hay movimientos válidos disponibles' });
    }

    console.log(`✅ Movimiento calculado: ${moveLineal} (fila ${bestMove.row}, col ${bestMove.col})`);

    // Respuesta en formato esperado por el árbitro
    return res.json({ 
      move: moveLineal
    });

  } catch (error) {
    console.error('💥 Error fatal en /move:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * ENDPOINT DE BIENVENIDA
 */
app.get('/', (req, res) => {
  res.json({
    mensaje: '🤖 Bot de Tateti 5x5 activo',
    nombre: 'Minimax Bot',
    version: '2.0.1',
    estado: 'Activo ✅',
    compatibilidad: 'Adaptado para el árbitro Ta-Te-Ti',
    endpoints: {
      jugada: 'GET /move?board=[...]&player=1',
      salud: 'GET /health'
    },
    formato: {
      entrada: 'board=[0,1,2,...,24] (array plano)',
      salida: '{ move: 12 } (índice lineal 0-24)'
    },
    ejemplo: `/move?board=${encodeURIComponent('[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]')}&player=1`
  });
});

/**
 * ENDPOINT DE HEALTH CHECK
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    name: 'Bot Tateti 5x5',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    version: '2.0.1'
  });
});

// Iniciar servidor (solo para desarrollo local)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Bot escuchando en puerto ${PORT}`);
    console.log(`✅ Listo en http://localhost:${PORT}`);
    console.log(`🎮 Endpoint: http://localhost:${PORT}/move`);
    console.log(`📝 Logs habilitados para debugging`);
  });
}

// Para Vercel
module.exports = app;