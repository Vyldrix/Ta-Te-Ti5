const request = require('supertest');
const app = require('../api/index'); // Asume que index.js está en /api, ajusta la ruta si es necesario

// Mockear la dependencia del bot para asegurar que getBestMove devuelve un resultado predecible y rápido
jest.mock('../bot/tatetiminimax', () => ({
  getBestMove: jest.fn((board, symbol) => {
    // Implementar una lógica simple de mock: encuentra la primera casilla vacía (0)
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === '') {
          return { row: i, col: j };
        }
      }
    }
    return null; // No hay movimientos
  }),
}));

describe('API Endpoints', () => {

  // Tablero inicial vacío (5x5 = 25 ceros)
  const EMPTY_BOARD_FLAT = JSON.stringify(Array(25).fill(0));
  const PLAYER_1 = 1;

  // ------------------------------------------------------------------
  // 1. Tests del endpoint de Bienvenida (GET /)
  // ------------------------------------------------------------------
  describe('GET /', () => {
    it('Debe responder con estado 200 y el mensaje de bienvenida', async () => {
      const response = await request(app).get('/');
      expect(response.statusCode).toBe(200);
      expect(response.body.mensaje).toBe('🤖 Bot de Tateti 5x5 activo');
      expect(response.body.estado).toBe('Activo ✅');
    });
  });

  // ------------------------------------------------------------------
  // 2. Tests del endpoint de Salud (GET /health)
  // ------------------------------------------------------------------
  describe('GET /health', () => {
    it('Debe responder con estado 200 y el estado "ok"', async () => {
      const response = await request(app).get('/health');
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  // ------------------------------------------------------------------
  // 3. Tests del endpoint de Movimiento (GET /move)
  // ------------------------------------------------------------------
  describe('GET /move', () => {

    it('Debe devolver un movimiento válido (índice 0) para un tablero vacío como Player 1', async () => {
      const response = await request(app)
        .get(`/move?board=${EMPTY_BOARD_FLAT}&player=${PLAYER_1}`);
      
      expect(response.statusCode).toBe(200);
      // El mock devuelve { row: 0, col: 0 } que es el índice lineal 0
      expect(response.body.move).toBe(0); 
    });

    it('Debe devolver un movimiento válido para Player 2 (X ya jugó en 0)', async () => {
        // [1, 0, 0, ...] -> X jugó en 0. El mock jugará en el índice 1.
        const boardWithX = JSON.stringify([1].concat(Array(24).fill(0))); 
        const response = await request(app)
          .get(`/move?board=${boardWithX}&player=2`); // Player 2 (O)
        
        expect(response.statusCode).toBe(200);
        // El bot debería jugar en la primera casilla vacía, que es el índice 1
        expect(response.body.move).toBe(1); 
    });

    // --- Validación de Errores ---

    it('Debe devolver 400 si falta el parámetro "board"', async () => {
      const response = await request(app)
        .get(`/move?player=${PLAYER_1}`);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Parámetros board y player requeridos');
    });

    it('Debe devolver 400 si el parámetro "board" no es un JSON válido', async () => {
      const response = await request(app)
        .get(`/move?board=[1,2,3,&player=${PLAYER_1}`);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Formato de board inválido');
    });

    it('Debe devolver 400 si el tablero tiene longitud incorrecta (ej: 3x3 = 9)', async () => {
      const board3x3 = JSON.stringify(Array(9).fill(0));
      const response = await request(app)
        .get(`/move?board=${board3x3}&player=${PLAYER_1}`);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('El tablero debe tener 25 elementos (5x5)');
    });
    
    it('Debe devolver 400 si el parámetro "player" es inválido', async () => {
      const response = await request(app)
        .get(`/move?board=${EMPTY_BOARD_FLAT}&player=3`);
      
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe('Player debe ser 1 o 2');
    });

    it('Debe devolver un movimiento fallback si el bot intenta jugar en una casilla ocupada', async () => {
      // Mockear getBestMove para que devuelva una casilla ocupada (ej: 0,0 que es índice 0)
      jest.spyOn(require('../bot/tatetiminimax'), 'getBestMove').mockReturnValueOnce({ row: 0, col: 0 });
      
      // Tablero con la casilla 0 ocupada [1, 0, 0, ...]
      const boardOccupied = JSON.stringify([1].concat(Array(24).fill(0))); 
      
      const response = await request(app)
        .get(`/move?board=${boardOccupied}&player=2`); // Player 2, pero el bot intenta 0
      
      expect(response.statusCode).toBe(200);
      // El bot intenta 0, pero la lógica de fallback lo mueve a la siguiente libre: 1
      expect(response.body.move).toBe(1); 
      expect(response.body.fallback).toBe(true);
      
      // Restaurar el mock para no afectar otras pruebas
      jest.restoreAllMocks();
    });

  });

});
