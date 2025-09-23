
const { posicionesVacias } = require('../tateti');
const { elegirPosicion } = require('../tateti');

describe('elegirPosicion', () => {
    it('debe devolver una posición válida del array', () => {
        const posiciones = [0, 2, 4, 6, 8];
        const posicionElegida = elegirPosicion(posiciones);
        expect(posiciones).toContain(posicionElegida);
    });
});

describe('posicionesVacias', () => {
    it('debe devolver todas las posiciones para un tablero vacío', () => {
        const board = [0,0,0,0,0,0,0,0,0];
    expect(posicionesVacias(board)).toEqual([0,1,2,3,4,5,6,7,8]);
    });

    it('debe devolver un array vacío si no hay posiciones vacías', () => {
        const board = [1,2,1,2,1,2,1,2,1];
    expect(posicionesVacias(board)).toEqual([]);
    });

    it('debe devolver solo los índices vacíos', () => {
        const board = [1,0,2,0,1,2,0,2,1];
    expect(posicionesVacias(board)).toEqual([1,3,6]);
    });

    it('debe devolver un array vacío si el tablero está vacío (array vacío)', () => {
        const board = [];
    expect(posicionesVacias(board)).toEqual([]);
    });

    it('debe ignorar valores distintos de 0', () => {
        const board = [1,2,3,4,5,6,7,8,9];
    expect(posicionesVacias(board)).toEqual([]);
    });

    it('debe funcionar con un solo espacio vacío', () => {
        const board = [1,2,1,2,1,2,1,2,0];
    expect(posicionesVacias(board)).toEqual([8]);
    });
});
