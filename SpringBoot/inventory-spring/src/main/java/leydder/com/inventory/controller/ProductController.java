package leydder.com.inventory.controller;

import leydder.com.inventory.model.Product;
import leydder.com.inventory.service.ProductoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;


import java.util.List;

@RestController
@RequestMapping("inventory-app")
@CrossOrigin(value = "http://localhost:4200")
public class ProductController {
    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);

    @Autowired
    private ProductoService productoService;
    @GetMapping("/products") //http://localhost:8080/inventory-app/products
    public List<Product> getProducts(){
        List<Product> products= this.productoService.showProducts();
        logger.info("Productos obtenidos");
        products.forEach(product -> logger.info(product.toString()));
        return products;
    }

    @PostMapping("/products")
    public Product addProduct(@RequestBody Product product){
        this.productoService.saveProduct(product);
        logger.info("Producto guardado: {}", product);
        return  product;
    }

    @PutMapping("/products/{id}")
    public Product uppdateProduct(@PathVariable Integer id, @RequestBody Product product){
        product.setProductId(id);
        this.productoService.saveProduct(product);
        logger.info("Producto actualizado: {}", product);
        return product;
    }

    @DeleteMapping("/products/{id}")
    public  void deleteProduct(@PathVariable Integer id){
        this.productoService.deleteProductById(id);
        logger.info("Producto eliminado, id: {}", id);
    }

    @GetMapping("/products/{id}")
    public Product getProductById(@PathVariable Integer id) {
        Product product = this.productoService.searchProductById(id);
        logger.info("Producto obtenido: {}", product);
        return product;
    }
}
