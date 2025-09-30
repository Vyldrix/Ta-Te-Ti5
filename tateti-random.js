const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/move', (req, res) => {
  const boardParam = req.query.board;
  let board;

  if (typeof boardParam === 'undefined') {
    return res.status(400).json({ error: 'Parametro board requerido. Debe enviarse como array JSON.' });
  }

  try {
    board = JSON.parse(boardParam);
  } catch (error) {
    return res.status(400).json({ error: 'Parametro board invalido. Debe ser un array JSON.' });
  }

  if (!Array.isArray(board) || board.length !== 9) {
    return res.status(400).json({ error: 'El tablero debe ser un array de 9 posiciones.' });
  }

  const emptyPositions = posicionesVacias(board);

  if (emptyPositions.length === 0) {
    return res.status(400).json({ error: 'No hay movimientos disponibles.' });
  }

  const move = elegirPosicion(emptyPositions);
  return res.json({ movimiento: move });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor de tateti escuchando en el puerto ${PORT}`);
  });
}

function elegirPosicion(posiciones) {
  const indiceAleatorio = Math.floor(Math.random() * posiciones.length);
  return posiciones[indiceAleatorio];
}

function posicionesVacias(board) {
  console.log(board);
  return board
    .map((value, index) => (value === 0 ? index : null))
    .filter((index) => index !== null);
}

module.exports = { app, posicionesVacias, elegirPosicion };
