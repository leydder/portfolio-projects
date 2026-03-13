package gm.inventarios.controlador;

import gm.inventarios.modelo.Producto;
import gm.inventarios.servicio.ProductoServicio;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
// para hacer peticiones se usa requestmapping, donde se coloca el nombre de la aplicacion
@RequestMapping("inventario-app")  // http://localhost:8080/inventario-app
@CrossOrigin(value = "http://localhost:4200") // Puerto por defaul para las peticiones desde angular
public class ProductoControlador {
    private static final Logger logger = LoggerFactory.getLogger(ProductoControlador.class); // Definiendo el loggrer para enviar info al login de la app

    @Autowired
    private ProductoServicio productoServicio;

    @GetMapping("/productos") // Peticiones de este tipo http://localhost:8080/inventario-app/productos
    public List<Producto> obtenerProductos(){
        List<Producto> productos = this.productoServicio.listarProductos();
        logger.info("Productos obtenidos:");
        productos.forEach(producto -> logger.info(producto.toString()));
        return  productos;
    }

    @PostMapping("/productos")
    public Producto agregarProducto(@Valid @RequestBody Producto producto){
        logger.info("Producto a agregar: " + producto);
        return this.productoServicio.guardarProducto(producto);
    }

    @GetMapping("/productos/{id}")
    public ResponseEntity<Producto> obtenerProductoPorId(@PathVariable Integer id){
        Producto producto = this.productoServicio.buscarProductoPorId(id);
        if(producto != null){
            return ResponseEntity.ok(producto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/productos/{id}")
    public ResponseEntity<Producto> actualizarProducto(@PathVariable Integer id, @Valid @RequestBody Producto producto){
        Producto productoExistente = this.productoServicio.buscarProductoPorId(id);
        if(productoExistente != null){
            producto.setIdProducto(id);
            this.productoServicio.guardarProducto(producto);
            return ResponseEntity.ok(producto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/productos/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Integer id){
        Producto producto = this.productoServicio.buscarProductoPorId(id);
        if(producto != null){
            this.productoServicio.eliminarProductoPorId(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
