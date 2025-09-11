export class Producto {
    idProducto?: number;
    descripcion!: string;
    precio!: number;
    existencia!: number;

    constructor() {
        this.descripcion = '';
        this.precio = 0;
        this.existencia = 0;
    }
}
