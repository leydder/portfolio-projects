import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from './producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private urlBase="http://localhost:8080/inventario-app/productos"
  private clienteHttp = inject(HttpClient);

  obtenerProductosLista() : Observable<Producto[]>{
    return this.clienteHttp.get<Producto[]>(this.urlBase);
  }

  agregarProducto(producto: Producto) : Observable<Producto>{
    return this.clienteHttp.post<Producto>(this.urlBase, producto);
  }

  obtenerProductoPorId(id: number) : Observable<Producto>{
    return this.clienteHttp.get<Producto>(`${this.urlBase}/${id}`);
  }

  editarProducto(id: number, producto: Producto) : Observable<Producto>{
    return this.clienteHttp.put<Producto>(`${this.urlBase}/${id}`, producto);
  }

  eliminarProducto(id: number) : Observable<void>{
    return this.clienteHttp.delete<void>(`${this.urlBase}/${id}`);
  }

  constructor(){ }
}
