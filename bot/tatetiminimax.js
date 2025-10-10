/**
 * Bot de Tateti 5x5 con Minimax, Poda Alfa-Beta y Heurística Avanzada
 * Condición de victoria: 4 en fila (horizontal, vertical o diagonal)
 */

const BOARD_SIZE = 5;
const WIN_LENGTH = 4;
const MAX_DEPTH = 3; // ✅ Reducido de 4 a 3 para evitar timeouts en Vercel

// Valores heurísticos
const HEURISTIC_VALUES = {
  WIN: 10000,
  THREE_OPEN: 500,
  THREE_BLOCKED: 100,
  TWO_OPEN: 50,
  CENTER: 30,
  DOUBLE_THREAT: 800,
  BLOCK_WIN: 9000
};

/**
 * Función principal que devuelve la mejor jugada
 * @param {Array<Array<string>>} board - Tablero 5x5
 * @param {string} botSymbol - Símbolo del bot ('X' o 'O')
 * @returns {{row: number, col: number}} - Mejor jugada
 */
function getBestMove(board, botSymbol = 'X') {
  const opponentSymbol = botSymbol === 'X' ? 'O' : 'X';
  
  // Verificar jugada ganadora inmediata
  const winMove = findWinningMove(board, botSymbol);
  if (winMove) return winMove;
  
  // Bloquear jugada ganadora del oponente
  const blockMove = findWinningMove(board, opponentSymbol);
  if (blockMove) return blockMove;
  
  // Usar Minimax con poda alfa-beta
  const { move } = minimax(board, MAX_DEPTH, -Infinity, Infinity, true, botSymbol, opponentSymbol);
  
  return move || getFirstAvailableMove(board);
}

/**
 * Algoritmo Minimax con poda alfa-beta
 */
function minimax(board, depth, alpha, beta, isMaximizing, botSymbol, opponentSymbol) {
  const winner = checkWinner(board);
  
  // Casos base
  if (winner === botSymbol) {
    return { score: HEURISTIC_VALUES.WIN + depth };
  }
  if (winner === opponentSymbol) {
    return { score: -HEURISTIC_VALUES.WIN - depth };
  }
  if (isBoardFull(board) || depth === 0) {
    return { score: evaluateBoard(board, botSymbol, opponentSymbol) };
  }
  
  const availableMoves = getAvailableMoves(board);
  
  // Ordenar movimientos por heurística para mejor poda
  availableMoves.sort((a, b) => {
    const scoreA = evaluateMove(board, a, isMaximizing ? botSymbol : opponentSymbol, botSymbol, opponentSymbol);
    const scoreB = evaluateMove(board, b, isMaximizing ? botSymbol : opponentSymbol, botSymbol, opponentSymbol);
    return scoreB - scoreA;
  });
  
  let bestMove = null;
  let bestMoves = []; // Para randomización
  
  if (isMaximizing) {
    let maxScore = -Infinity;
    
    for (const move of availableMoves) {
      board[move.row][move.col] = botSymbol;
      const { score } = minimax(board, depth - 1, alpha, beta, false, botSymbol, opponentSymbol);
      board[move.row][move.col] = '';
      
      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
        bestMoves = [move];
      } else if (score === maxScore) {
        bestMoves.push(move); // Jugadas equivalentes
      }
      
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break; // Poda alfa-beta
    }
    
    // Randomización entre jugadas equivalentes
    const selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    return { score: maxScore, move: selectedMove };
  } else {
    let minScore = Infinity;
    
    for (const move of availableMoves) {
      board[move.row][move.col] = opponentSymbol;
      const { score } = minimax(board, depth - 1, alpha, beta, true, botSymbol, opponentSymbol);
      board[move.row][move.col] = '';
      
      if (score < minScore) {
        minScore = score;
        bestMove = move;
        bestMoves = [move];
      } else if (score === minScore) {
        bestMoves.push(move);
      }
      
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    
    const selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
    return { score: minScore, move: selectedMove };
  }
}

/**
 * Función heurística avanzada
 */
function evaluateBoard(board, botSymbol, opponentSymbol) {
  let score = 0;
  
  // Evaluar todas las líneas posibles
  const lines = getAllLines(board);
  
  for (const line of lines) {
    score += evaluateLine(line, botSymbol, opponentSymbol);
  }
  
  // Bonificación por centro
  if (board[2][2] === botSymbol) {
    score += HEURISTIC_VALUES.CENTER;
  } else if (board[2][2] === opponentSymbol) {
    score -= HEURISTIC_VALUES.CENTER;
  }
  
  // Detectar dobles amenazas
  score += evaluateDoubleThreats(board, botSymbol) * HEURISTIC_VALUES.DOUBLE_THREAT;
  score -= evaluateDoubleThreats(board, opponentSymbol) * HEURISTIC_VALUES.DOUBLE_THREAT;
  
  return score;
}

/**
 * Evaluar una línea específica
 */
function evaluateLine(line, botSymbol, opponentSymbol) {
  const botCount = line.filter(c => c === botSymbol).length;
  const opponentCount = line.filter(c => c === opponentSymbol).length;
  const emptyCount = line.filter(c => c === '').length;
  
  // Línea mixta no tiene valor
  if (botCount > 0 && opponentCount > 0) return 0;
  
  let score = 0;
  
  if (botCount === 3 && emptyCount === 1) {
    score += HEURISTIC_VALUES.THREE_OPEN; // 3 en fila abiertos
  } else if (botCount === 2 && emptyCount === 2) {
    score += HEURISTIC_VALUES.TWO_OPEN;
  } else if (botCount === 3) {
    score += HEURISTIC_VALUES.THREE_BLOCKED;
  }
  
  if (opponentCount === 3 && emptyCount === 1) {
    score -= HEURISTIC_VALUES.THREE_OPEN;
  } else if (opponentCount === 2 && emptyCount === 2) {
    score -= HEURISTIC_VALUES.TWO_OPEN;
  } else if (opponentCount === 3) {
    score -= HEURISTIC_VALUES.THREE_BLOCKED;
  }
  
  return score;
}

/**
 * Detectar dobles amenazas (dos caminos posibles de 4 en fila)
 */
function evaluateDoubleThreats(board, symbol) {
  let threats = 0;
  const lines = getAllLines(board);
  
  for (let i = 0; i < lines.length; i++) {
    const count = lines[i].filter(c => c === symbol).length;
    const empty = lines[i].filter(c => c === '').length;
    
    if (count === 3 && empty === 1) {
      // Verificar si hay otra amenaza intersectante
      for (let j = i + 1; j < lines.length; j++) {
        const count2 = lines[j].filter(c => c === symbol).length;
        const empty2 = lines[j].filter(c => c === '').length;
        
        if (count2 === 3 && empty2 === 1) {
          threats++;
        }
      }
    }
  }
  
  return threats;
}

/**
 * Evaluar una jugada específica
 */
function evaluateMove(board, move, symbol, botSymbol, opponentSymbol) {
  board[move.row][move.col] = symbol;
  const score = evaluateBoard(board, botSymbol, opponentSymbol);
  board[move.row][move.col] = '';
  return score;
}

/**
 * Encontrar jugada ganadora inmediata
 */
function findWinningMove(board, symbol) {
  const moves = getAvailableMoves(board);
  
  for (const move of moves) {
    board[move.row][move.col] = symbol;
    if (checkWinner(board) === symbol) {
      board[move.row][move.col] = '';
      return move;
    }
    board[move.row][move.col] = '';
  }
  
  return null;
}

/**
 * Obtener todas las líneas posibles (horizontal, vertical, diagonal)
 */
function getAllLines(board) {
  const lines = [];
  
  // Horizontales
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col <= BOARD_SIZE - WIN_LENGTH; col++) {
      lines.push([
        board[row][col],
        board[row][col + 1],
        board[row][col + 2],
        board[row][col + 3]
      ]);
    }
  }
  
  // Verticales
  for (let col = 0; col < BOARD_SIZE; col++) {
    for (let row = 0; row <= BOARD_SIZE - WIN_LENGTH; row++) {
      lines.push([
        board[row][col],
        board[row + 1][col],
        board[row + 2][col],
        board[row + 3][col]
      ]);
    }
  }
  
  // Diagonales (izquierda-derecha)
  for (let row = 0; row <= BOARD_SIZE - WIN_LENGTH; row++) {
    for (let col = 0; col <= BOARD_SIZE - WIN_LENGTH; col++) {
      lines.push([
        board[row][col],
        board[row + 1][col + 1],
        board[row + 2][col + 2],
        board[row + 3][col + 3]
      ]);
    }
  }
  
  // Diagonales (derecha-izquierda)
  for (let row = 0; row <= BOARD_SIZE - WIN_LENGTH; row++) {
    for (let col = WIN_LENGTH - 1; col < BOARD_SIZE; col++) {
      lines.push([
        board[row][col],
        board[row + 1][col - 1],
        board[row + 2][col - 2],
        board[row + 3][col - 3]
      ]);
    }
  }
  
  return lines;
}

/**
 * Verificar ganador
 * ✅ CORREGIDO: Verifica 4 en línea correctamente
 */
function checkWinner(board) {
  const lines = getAllLines(board);
  
  for (const line of lines) {
    // Debe tener exactamente 4 elementos del mismo símbolo (no vacío)
    const allX = line.every(c => c === 'X');
    const allO = line.every(c => c === 'O');
    
    if (allX && line[0] !== '') return 'X';
    if (allO && line[0] !== '') return 'O';
  }
  
  return null;
}

/**
 * Verificar si el tablero está lleno
 */
function isBoardFull(board) {
  return board.every(row => row.every(cell => cell !== ''));
}

/**
 * Obtener movimientos disponibles
 */
function getAvailableMoves(board) {
  const moves = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === '') {
        moves.push({ row, col });
      }
    }
  }
  
  return moves;
}

/**
 * Obtener primer movimiento disponible (fallback)
 */
function getFirstAvailableMove(board) {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === '') {
        return { row, col };
      }
    }
  }
  return null;
}

module.exports = { getBestMove };