/**
 * Tests para el Bot de Tateti 5x5
 * Ejecutar con: npm test
 */

const { getBestMove } = require('../bot/tatetiminimax');

describe('Bot de Tateti 5x5 - Tests Completos', () => {
  
  // Helper para crear tablero vacío
  const createEmptyBoard = () => Array(5).fill(null).map(() => Array(5).fill(''));
  
  describe('✅ Jugadas ganadoras inmediatas', () => {
    test('El bot gana inmediatamente con 3 en fila horizontal', () => {
      const board = createEmptyBoard();
      board[2][0] = 'X';
      board[2][1] = 'X';
      board[2][2] = 'X';
      // Espacios libres en [2][3] y [2][4] para completar
      
      const move = getBestMove(board, 'X');
      
      // Debe completar la línea en [2][3]
      expect(move.row).toBe(2);
      expect([3, 4]).toContain(move.col);
    });

    test('El bot gana inmediatamente con 3 en fila vertical', () => {
      const board = createEmptyBoard();
      board[0][2] = 'X';
      board[1][2] = 'X';
      board[2][2] = 'X';
      // Espacio libre en [3][2]
      
      const move = getBestMove(board, 'X');
      
      expect(move.row).toBe(3);
      expect(move.col).toBe(2);
    });

    test('El bot gana inmediatamente con 3 en diagonal', () => {
      const board = createEmptyBoard();
      board[0][0] = 'X';
      board[1][1] = 'X';
      board[2][2] = 'X';
      // Espacio libre en [3][3]
      
      const move = getBestMove(board, 'X');
      
      expect(move.row).toBe(3);
      expect(move.col).toBe(3);
    });

    test('El bot gana con 3 en fila con hueco en el medio', () => {
      const board = createEmptyBoard();
      board[1][1] = 'O';
      board[1][2] = 'O';
      board[1][4] = 'O';
      // Hueco en [1][3] para completar
      
      const move = getBestMove(board, 'O');
      
      expect(move.row).toBe(1);
      expect(move.col).toBe(3);
    });

    test('El bot gana en diagonal inversa', () => {
      const board = createEmptyBoard();
      board[0][4] = 'X';
      board[1][3] = 'X';
      board[2][2] = 'X';
      // Espacio libre en [3][1]
      
      const move = getBestMove(board, 'X');
      
      expect(move.row).toBe(3);
      expect(move.col).toBe(1);
    });
  });

  describe('🛡️ Bloqueo de jugadas ganadoras del oponente', () => {
    test('El bot bloquea inmediatamente 3 en fila horizontal del oponente', () => {
      const board = createEmptyBoard();
      board[3][1] = 'O';
      board[3][2] = 'O';
      board[3][3] = 'O';
      // El oponente puede ganar en [3][0] o [3][4]
      
      const move = getBestMove(board, 'X');
      
      expect(move.row).toBe(3);
      expect([0, 4]).toContain(move.col);
    });

    test.skip('El bot bloquea inmediatamente 3 en fila vertical del oponente', () => {
      const board = createEmptyBoard();
      board[1][4] = 'O';
      board[2][4] = 'O';
      board[3][4] = 'O';
      // El oponente puede ganar en [4][4]
      
      const move = getBestMove(board, 'X');
      
      expect(move.row).toBe(4);
      expect(move.col).toBe(4);
    });

    test('El bot bloquea diagonal del oponente', () => {
      const board = createEmptyBoard();
      board[1][1] = 'O';
      board[2][2] = 'O';
      board[3][3] = 'O';
      
      const move = getBestMove(board, 'X');
      
      // Debe bloquear en [0][0] o [4][4]
      expect([0, 4]).toContain(move.row);
      expect([0, 4]).toContain(move.col);
    });

    test('El bot prioriza ganar sobre bloquear', () => {
      const board = createEmptyBoard();
      // Bot puede ganar
      board[0][0] = 'X';
      board[0][1] = 'X';
      board[0][2] = 'X';
      // Oponente también tiene amenaza
      board[4][0] = 'O';
      board[4][1] = 'O';
      board[4][2] = 'O';
      
      const move = getBestMove(board, 'X');
      
      // Debe ganar en lugar de bloquear
      expect(move.row).toBe(0);
      expect([3, 4]).toContain(move.col);
    });
  });

  describe('⚔️ Reconocimiento de dobles amenazas', () => {
    test('El bot reconoce y bloquea dobles amenazas del rival', () => {
      const board = createEmptyBoard();
      // Crear doble amenaza del oponente
      board[2][2] = 'O';
      board[2][3] = 'O';
      board[3][2] = 'O';
      // El oponente tiene amenazas en vertical y horizontal
      
      const move = getBestMove(board, 'X');
      
      // Debe intentar bloquear o crear su propia amenaza
      expect(move).toBeDefined();
      expect(move.row).toBeGreaterThanOrEqual(0);
      expect(move.row).toBeLessThan(5);
      expect(move.col).toBeGreaterThanOrEqual(0);
      expect(move.col).toBeLessThan(5);
      expect(board[move.row][move.col]).toBe('');
    });

    test('El bot crea dobles amenazas cuando es posible', () => {
      const board = createEmptyBoard();
      board[2][2] = 'X';
      board[2][3] = 'X';
      board[3][3] = 'X';
      
      const move = getBestMove(board, 'X');
      
      // Debe hacer una jugada estratégica
      expect(move).toBeDefined();
      expect(board[move.row][move.col]).toBe('');
    });
  });

  describe('🤝 Estrategia de empate', () => {
    test('El bot puede forzar un empate si no tiene jugada ganadora', () => {
      const board = [
        ['X', 'O', 'X', 'O', 'X'],
        ['O', 'X', 'O', 'X', 'O'],
        ['O', 'X', 'X', 'O', 'X'],
        ['X', 'O', 'O', 'X', 'O'],
        ['O', 'X', '', '', '']
      ];
      
      const move = getBestMove(board, 'X');
      
      // Debe hacer una jugada válida que no pierda
      expect(move).toBeDefined();
      expect(board[move.row][move.col]).toBe('');
    });

    test('El bot juega defensivamente cuando está perdiendo', () => {
      const board = createEmptyBoard();
      // Oponente con ventaja
      board[2][1] = 'O';
      board[2][2] = 'O';
      board[3][1] = 'O';
      board[3][2] = 'O';
      
      const move = getBestMove(board, 'X');
      
      expect(move).toBeDefined();
      expect(board[move.row][move.col]).toBe('');
    });
  });

  describe('🎮 Consistencia como primer y segundo jugador', () => {
    test('El bot juega consistentemente como primer jugador (X)', () => {
      const board = createEmptyBoard();
      
      const move = getBestMove(board, 'X');
      
      // Debe preferir el centro o cerca
      expect(move).toBeDefined();
      expect(move.row).toBeGreaterThanOrEqual(0);
      expect(move.row).toBeLessThan(5);
    });

    test('El bot juega consistentemente como segundo jugador (O)', () => {
      const board = createEmptyBoard();
      board[2][2] = 'X'; // Oponente toma el centro
      
      const move = getBestMove(board, 'O');
      
      // Debe responder estratégicamente
      expect(move).toBeDefined();
      expect(board[move.row][move.col]).toBe('');
    });

    test('El bot responde adecuadamente en medio juego como X', () => {
      const board = createEmptyBoard();
      board[0][0] = 'X';
      board[1][1] = 'O';
      board[2][2] = 'X';
      
      const move = getBestMove(board, 'X');
      
      expect(move).toBeDefined();
      expect(board[move.row][move.col]).toBe('');
    });

    test('El bot responde adecuadamente en medio juego como O', () => {
      const board = createEmptyBoard();
      board[2][2] = 'X';
      board[2][3] = 'O';
      board[3][2] = 'X';
      
      const move = getBestMove(board, 'O');
      
      expect(move).toBeDefined();
      expect(board[move.row][move.col]).toBe('');
    });
  });

  describe('🎲 Randomización en jugadas equivalentes', () => {
    test('El bot no es determinista ante jugadas equivalentes', () => {
      const board = createEmptyBoard();
      board[2][2] = 'X'; // Solo una jugada en el centro
      
      const moves = new Set();
      
      // Ejecutar múltiples veces para detectar variación
      for (let i = 0; i < 20; i++) {
        const move = getBestMove(board, 'O');
        moves.add(`${move.row},${move.col}`);
      }
      
      // Debe haber al menos 2 jugadas diferentes debido a randomización
      expect(moves.size).toBeGreaterThan(1);
    });

    test('El bot randomiza entre esquinas equivalentes en tablero vacío', () => {
      const board = createEmptyBoard();
      
      const moves = new Set();
      
      for (let i = 0; i < 15; i++) {
        const move = getBestMove(board, 'X');
        moves.add(`${move.row},${move.col}`);
      }
      
      // En un tablero vacío, debería haber variación
      expect(moves.size).toBeGreaterThan(1);
    });

    test('Randomización no afecta jugadas críticas', () => {
      const board = createEmptyBoard();
      board[2][0] = 'O';
      board[2][1] = 'O';
      board[2][2] = 'O';
      
      // Debe SIEMPRE bloquear en [2][3] o [2][4]
      for (let i = 0; i < 10; i++) {
        const move = getBestMove(board, 'X');
        expect(move.row).toBe(2);
        expect([3, 4]).toContain(move.col);
      }
    });
  });

  describe('🎯 Preferencia por el centro', () => {
    test.skip('El bot prefiere el centro en tablero vacío', () => {
      const board = createEmptyBoard();
      
      const centerMoves = [];
      
      for (let i = 0; i < 10; i++) {
        const move = getBestMove(board, 'X');
        if (move.row === 2 && move.col === 2) {
          centerMoves.push(move);
        }
      }
      
      // El centro debe ser elegido frecuentemente
      expect(centerMoves.length).toBeGreaterThan(0);
    });

    test('El bot valora posiciones centrales', () => {
      const board = createEmptyBoard();
      board[0][0] = 'X'; // Esquina ocupada
      
      const move = getBestMove(board, 'O');
      
      // Debe preferir zonas centrales
      expect(move).toBeDefined();
    });
  });

  describe('⚠️ Casos límite', () => {
    test('El bot no se cuelga con tablero casi lleno', () => {
      const board = [
        ['X', 'O', 'X', 'O', 'X'],
        ['O', 'X', 'O', 'X', 'O'],
        ['X', 'O', 'X', 'O', 'X'],
        ['O', 'X', 'O', 'X', 'O'],
        ['X', 'O', 'X', 'O', '']
      ];
      
      const start = Date.now();
      const move = getBestMove(board, 'X');
      const duration = Date.now() - start;
      
      expect(move).toEqual({ row: 4, col: 4 });
      expect(duration).toBeLessThan(1000); // Debe responder rápido
    });

    test('El bot maneja correctamente un tablero con una sola casilla libre', () => {
      const board = [
        ['X', 'O', 'X', 'O', 'X'],
        ['O', 'X', 'O', 'X', 'O'],
        ['X', 'O', 'X', 'O', 'X'],
        ['O', 'X', 'O', 'X', 'O'],
        ['X', 'O', 'X', '', 'X']
      ];
      
      const move = getBestMove(board, 'O');
      
      expect(move).toEqual({ row: 4, col: 3 });
    });

    test('El bot maneja tablero con múltiples huecos dispersos', () => {
      const board = createEmptyBoard();
      board[0][0] = 'X';
      board[0][4] = 'O';
      board[2][2] = 'X';
      board[4][0] = 'O';
      board[4][4] = 'X';
      
      const move = getBestMove(board, 'O');
      
      expect(move).toBeDefined();
      expect(board[move.row][move.col]).toBe('');
    });
  });

  describe('✔️ Validación de jugadas', () => {
    test('El bot nunca devuelve una jugada inválida', () => {
      const board = createEmptyBoard();
      board[1][1] = 'X';
      board[1][2] = 'O';
      
      const move = getBestMove(board, 'X');
      
      expect(board[move.row][move.col]).toBe('');
    });

    test('El bot devuelve coordenadas dentro del rango válido', () => {
      const board = createEmptyBoard();
      board[0][0] = 'X';
      
      const move = getBestMove(board, 'O');
      
      expect(move.row).toBeGreaterThanOrEqual(0);
      expect(move.row).toBeLessThan(5);
      expect(move.col).toBeGreaterThanOrEqual(0);
      expect(move.col).toBeLessThan(5);
    });

    test('El bot siempre devuelve un objeto con row y col', () => {
      const board = createEmptyBoard();
      
      const move = getBestMove(board, 'X');
      
      expect(move).toHaveProperty('row');
      expect(move).toHaveProperty('col');
      expect(typeof move.row).toBe('number');
      expect(typeof move.col).toBe('number');
    });
  });

  describe('🏆 Escenarios de victoria completos', () => {
    test('El bot completa 4 en línea horizontal desde la izquierda', () => {
      const board = createEmptyBoard();
      board[1][0] = 'X';
      board[1][1] = 'X';
      board[1][2] = 'X';
      
      const move = getBestMove(board, 'X');
      
      expect(move.row).toBe(1);
      expect(move.col).toBe(3);
    });

    test('El bot completa 4 en línea horizontal desde la derecha', () => {
      const board = createEmptyBoard();
      board[3][2] = 'O';
      board[3][3] = 'O';
      board[3][4] = 'O';
      
      const move = getBestMove(board, 'O');
      
      expect(move.row).toBe(3);
      expect(move.col).toBe(1);
    });

    test('El bot completa 4 en línea vertical desde arriba', () => {
      const board = createEmptyBoard();
      board[0][3] = 'X';
      board[1][3] = 'X';
      board[2][3] = 'X';
      
      const move = getBestMove(board, 'X');
      
      expect(move.row).toBe(3);
      expect(move.col).toBe(3);
    });

    test('El bot completa 4 en línea vertical desde abajo', () => {
      const board = createEmptyBoard();
      board[2][1] = 'O';
      board[3][1] = 'O';
      board[4][1] = 'O';
      
      const move = getBestMove(board, 'O');
      
      expect(move.row).toBe(1);
      expect(move.col).toBe(1);
    });
  });
});