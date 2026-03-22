package leydder.com.inventory.controller;

import jakarta.validation.Valid;
import leydder.com.inventory.model.Product;
import leydder.com.inventory.service.IProductService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("inventory-app")
@CrossOrigin(value = "${app.cors.allowed-origins}")
@RequiredArgsConstructor
public class ProductController {

    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);

    private final IProductService productoService;

    @GetMapping("/products")
    public List<Product> getProducts() {
        List<Product> products = this.productoService.showProducts();
        logger.info("Productos obtenidos: {}", products.size());
        return products;
    }

    @GetMapping("/products/{id}")
    public Product getProductById(@PathVariable Integer id) {
        Product product = this.productoService.searchProductById(id);
        logger.info("Producto obtenido: {}", product);
        return product;
    }

    @PostMapping("/products")
    public Product addProduct(@Valid @RequestBody Product product) {
        this.productoService.saveProduct(product);
        logger.info("Producto guardado: {}", product);
        return product;
    }

    @PutMapping("/products/{id}")
    public Product updateProduct(@PathVariable Integer id, @Valid @RequestBody Product product) {
        product.setProductId(id);
        this.productoService.saveProduct(product);
        logger.info("Producto actualizado: {}", product);
        return product;
    }

    @DeleteMapping("/products/{id}")
    public void deleteProduct(@PathVariable Integer id) {
        this.productoService.deleteProductById(id);
        logger.info("Producto eliminado, id: {}", id);
    }
}