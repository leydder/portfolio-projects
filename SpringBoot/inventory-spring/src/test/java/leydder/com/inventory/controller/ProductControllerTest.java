package leydder.com.inventory.controller;

import leydder.com.inventory.exception.ProductNotFoundException;
import leydder.com.inventory.model.Product;
import leydder.com.inventory.service.ProductoService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    @Mock
    private ProductoService productoService;

    @InjectMocks
    private ProductController productController;

    // --- GET /products ---

    @Test
    void getProducts_returnsProductList() {
        List<Product> products = List.of(
                new Product(1, "Laptop", 1200.0, 10),
                new Product(2, "Mouse", 25.0, 50)
        );
        when(productoService.showProducts()).thenReturn(products);

        List<Product> result = productController.getProducts();

        assertEquals(2, result.size());
        assertEquals("Laptop", result.get(0).getDescription());
        assertEquals("Mouse", result.get(1).getDescription());
        verify(productoService).showProducts();
    }

    @Test
    void getProducts_returnsEmptyList_whenNoProducts() {
        when(productoService.showProducts()).thenReturn(Collections.emptyList());

        List<Product> result = productController.getProducts();

        assertTrue(result.isEmpty());
    }

    // --- GET /products/{id} ---

    @Test
    void getProductById_returnsProduct_whenExists() {
        Product product = new Product(1, "Laptop", 1200.0, 10);
        when(productoService.searchProductById(1)).thenReturn(product);

        Product result = productController.getProductById(1);

        assertNotNull(result);
        assertEquals(1, result.getProductId());
        assertEquals("Laptop", result.getDescription());
        assertEquals(1200.0, result.getPrice());
        assertEquals(10, result.getStock());
    }

    @Test
    void getProductById_throwsException_whenNotFound() {
        when(productoService.searchProductById(99))
                .thenThrow(new ProductNotFoundException(99));

        ProductNotFoundException ex = assertThrows(ProductNotFoundException.class,
                () -> productController.getProductById(99));

        assertEquals("Producto no encontrado con id: 99", ex.getMessage());
    }

    // --- POST /products ---

    @Test
    void addProduct_returnsCreatedProduct() {
        Product product = new Product(null, "Teclado", 85.0, 20);

        Product result = productController.addProduct(product);

        assertNotNull(result);
        assertEquals("Teclado", result.getDescription());
        assertEquals(85.0, result.getPrice());
        assertEquals(20, result.getStock());
        verify(productoService).saveProduct(product);
    }

    @Test
    void addProduct_withNullProduct_throwsException() {
        doThrow(IllegalArgumentException.class).when(productoService).saveProduct(null);

        assertThrows(IllegalArgumentException.class,
                () -> productController.addProduct(null));
    }

    // --- PUT /products/{id} ---

    @Test
    void updateProduct_returnsUpdatedProduct_withPathId() {
        Product product = new Product(null, "Teclado RGB", 95.0, 15);

        Product result = productController.uppdateProduct(1, product);

        assertNotNull(result);
        assertEquals(1, result.getProductId());
        assertEquals("Teclado RGB", result.getDescription());
        verify(productoService).saveProduct(product);
    }

    @Test
    void updateProduct_pathIdOverridesBodyId() {
        Product product = new Product(99, "Teclado RGB", 95.0, 15);

        Product result = productController.uppdateProduct(1, product);

        assertEquals(1, result.getProductId());
    }

    // --- DELETE /products/{id} ---

    @Test
    void deleteProduct_callsServiceWithCorrectId() {
        doNothing().when(productoService).deleteProductById(1);

        productController.deleteProduct(1);

        verify(productoService).deleteProductById(1);
    }

    @Test
    void deleteProduct_throwsException_whenNotFound() {
        doThrow(new ProductNotFoundException(99))
                .when(productoService).deleteProductById(99);

        assertThrows(ProductNotFoundException.class,
                () -> productController.deleteProduct(99));
    }
}