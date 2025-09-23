describe('porcentaje', () => {
    it('debe calcular el 10% de 300', () => {
        expect(porcentaje(300, 10)).toBe(30);
    });

    it('debe calcular el 5% de 50', () => {
        expect(porcentaje(50, 5)).toBe(2.5);
    });

    it('debe calcular el 0% de cualquier número como 0', () => {
        expect(porcentaje(1000, 0)).toBe(1000);
    });

});
const { porcentaje } = require('../calculadora');