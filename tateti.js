const express = require('express');
const app = express();
const PORT = 3000;

// GET /move?board=[0,1,0,2,0,0,0,0,0]
app.get('/move', (req, res) => {
    let boardParam = req.query.board;
    let board;
    
    try {
        board = JSON.parse(boardParam);
    } catch (e) {
        return res.status(400).json({ error: 'Parámetro board inválido. Debe ser un array JSON.' });
    }

    if (!Array.isArray(board) || board.length !== 9) {
        return res.status(400).json({ error: 'El tablero debe ser un array de 9 posiciones.' });
    }

    const emptyPositions = posicionesVacias(board);
    
    if (emptyPositions.length === 0) {
        return res.status(400).json({ error: 'No hay movimientos disponibles.' });
    }
    
    // Elegir una posición vacía al azar
    const move = elegirPosicion(emptyPositions);
    res.json({ movimiento: move });
});

app.listen(PORT, () => {
    console.log(`Servidor de tateti escuchando en el puerto ${PORT}`);
});

function elegirPosicion(posiciones) {
    const indiceAleatorio = Math.floor(Math.random() * posiciones.length);
    return posiciones[indiceAleatorio];
}

function posicionesVacias(board) {
    // Buscar posiciones vacías (asumiendo que 0 es vacío)
    const emptyPositions = board
        .map((v, i) => v === 0 ? i : null)
        .filter(i => i !== null);

    return emptyPositions;
}

module.exports = { posicionesVacias, elegirPosicion };