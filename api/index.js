const express = require('express');
const { getBestMove } = require('../bot/tatetiminimax');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/**
 * ENDPOINT PRINCIPAL - Adaptado para 5x5 con 4 en línea
 * GET /move?board=[[...],[...]]&symbol=X
 * l
 * El board ahora es una matriz 5x5 (no array de 9)
 * Ejemplo: [[0,0,1,0,0],[0,2,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]
 * 0 = vacío, 1 = X, 2 = O
 */
app.get('/move', (req, res) => {
  const boardParam = req.query.board;
  const symbolParam = req.query.symbol || '1'; // Por defecto juega como 1 (X)
  let board;

  if (typeof boardParam === 'undefined') {
    return res.status(400).json({ 
      error: 'Parametro board requerido. Debe enviarse como array JSON 5x5.' 
    });
  }

  try {
    board = JSON.parse(boardParam);
  } catch (error) {
    return res.status(400).json({ 
      error: 'Parametro board invalido. Debe ser un array JSON.' 
    });
  }

  // Validar que sea 5x5
  if (!Array.isArray(board) || board.length !== 5) {
    return res.status(400).json({ 
      error: 'El tablero debe ser un array de 5 filas.' 
    });
  }

  if (!board.every(row => Array.isArray(row) && row.length === 5)) {
    return res.status(400).json({ 
      error: 'Cada fila debe tener 5 columnas.' 
    });
  }

  // Convertir board numérico (0,1,2) a formato del bot ('','X','O')
  const boardForBot = convertirTablero(board);

  // Determinar símbolo del bot
  const botSymbol = symbolParam === '1' ? 'X' : 'O';

  // Verificar si hay movimientos disponibles
  const emptyPositions = posicionesVacias(boardForBot);
  if (emptyPositions.length === 0) {
    return res.status(400).json({ 
      error: 'No hay movimientos disponibles.' 
    });
  }

  try {
    // Usar el bot inteligente
    const move = getBestMove(boardForBot, botSymbol);
    
    // Convertir a índice lineal (0-24) para compatibilidad
    const movimientoLineal = move.row * 5 + move.col;
    
    return res.json({ 
      movimiento: movimientoLineal,  // Índice de 0 a 24
      fila: move.row,                 // Fila de 0 a 4
      columna: move.col,              // Columna de 0 a 4
      posicion: { row: move.row, col: move.col }
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Error al calcular movimiento',
      detalles: error.message 
    });
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
 * Encuentra posiciones vacías en el tablero
 */
function posicionesVacias(board) {
  const vacias = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (board[row][col] === '') {
        vacias.push({ row, col });
      }
    }
  }
  return vacias;
}

/**
 * FUNCIÓN DE RESPALDO: Elegir posición aleatoria
 * (Solo se usa si el bot falla)
 */
function elegirPosicion(posiciones) {
  const indiceAleatorio = Math.floor(Math.random() * posiciones.length);
  return posiciones[indiceAleatorio];
}

/**
 * ENDPOINT DE BIENVENIDA
 * GET /
 */
app.get('/', (req, res) => {
  res.json({
    mensaje: '¡Hola! 👋 Estoy funcionando correctamente',
    nombre: 'Bot de Tateti 5x5',
    version: '1.0.0',
    estado: 'Activo ✅',
    bot: 'Minimax con poda alfa-beta activado 🤖',
    endpoints: {
      jugada: 'GET /move?board=[[...]]&symbol=1',
      salud: 'GET /health'
    }
  });
});

/**
 * ENDPOINT DE HEALTH CHECK
 * GET /health
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

// Iniciar servidor (solo para desarrollo local)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor de tateti 5x5 escuchando en el puerto ${PORT}`);
    console.log(`🤖 Bot inteligente con Minimax activado`);
    console.log(`✅ Servidor listo en http://localhost:${PORT}`);
  });
}

// ✅ Para Vercel: exportar la app directamente
module.exports = app;