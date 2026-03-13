import { Component, OnInit } from '@angular/core';
import { Producto } from '../producto';
import { ProductoService } from '../producto.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-producto-lista',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './producto-lista.html',
  styleUrls: ['./producto-lista.css']
})
export class ProductoLista implements OnInit {
  readonly Math = Math;
  productos: Producto[] = [];
  cargando: boolean = false;
  error: string = '';
  productoSeleccionado: Producto = new Producto();
  modoEdicion: boolean = false;
  showForm: boolean = false;

  // Paginacion
  paginaActual: number = 1;
  productosPorPagina: number = 5;

  get totalPaginas(): number {
    return Math.ceil(this.productos.length / this.productosPorPagina);
  }

  get productosPaginados(): Producto[] {
    const inicio = (this.paginaActual - 1) * this.productosPorPagina;
    return this.productos.slice(inicio, inicio + this.productosPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  constructor(private productoService: ProductoService) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.error = '';
    
    this.productoService.obtenerProductosLista().subscribe({
      next: (datos) => {
        this.productos = datos;
        this.paginaActual = 1;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los productos: ' + err.message;
        this.cargando = false;
        console.error('Error:', err);
      }
    });
  }

  nuevoProducto(): void {
    this.productoSeleccionado = new Producto();
    this.modoEdicion = false;
    this.showForm = true;
  }

  editarProducto(producto: Producto): void {
    this.productoSeleccionado = { ...producto };
    this.modoEdicion = true;
    this.showForm = true;
  }

  guardarProducto(): void {
    if (!this.validarProducto()) {
      return;
    }

    this.cargando = true;
    
    if (this.modoEdicion) {
      this.productoService.editarProducto(this.productoSeleccionado.idProducto, this.productoSeleccionado).subscribe({
        next: () => {
          this.cargarProductos();
          this.cancelarForm();
          this.cargando = false;
        },
        error: (err) => {
          this.error = 'Error al actualizar el producto: ' + err.message;
          this.cargando = false;
          console.error('Error:', err);
        }
      });
    } else {
      this.productoService.agregarProducto(this.productoSeleccionado).subscribe({
        next: () => {
          this.cargarProductos();
          this.cancelarForm();
          this.cargando = false;
        },
        error: (err) => {
          this.error = 'Error al agregar el producto: ' + err.message;
          this.cargando = false;
          console.error('Error:', err);
        }
      });
    }
  }

  eliminarProducto(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
      this.cargando = true;
      
      this.productoService.eliminarProducto(id).subscribe({
        next: () => {
          this.cargarProductos();
          this.cargando = false;
        },
        error: (err) => {
          this.error = 'Error al eliminar el producto: ' + err.message;
          this.cargando = false;
          console.error('Error:', err);
        }
      });
    }
  }

  cancelarForm(): void {
    this.showForm = false;
    this.productoSeleccionado = new Producto();
    this.modoEdicion = false;
  }

  validarProducto(): boolean {
    if (!this.productoSeleccionado.descripcion || this.productoSeleccionado.descripcion.trim() === '') {
      this.error = 'La descripción del producto es obligatoria';
      return false;
    }
    
    if (!this.productoSeleccionado.precio || this.productoSeleccionado.precio <= 0) {
      this.error = 'El precio debe ser mayor que cero';
      return false;
    }
    
    if (this.productoSeleccionado.existencia === null || this.productoSeleccionado.existencia < 0) {
      this.error = 'La existencia debe ser un número positivo';
      return false;
    }
    
    return true;
  }
}
