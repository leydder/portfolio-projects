package leydder.com.inventory.service;

import leydder.com.inventory.exception.ProductNotFoundException;
import leydder.com.inventory.model.Product;
import leydder.com.inventory.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductoService productoService;

    // --- showProducts ---

    @Test
    void showProducts_returnsProductList() {
        List<Product> products = List.of(
                new Product(1, "Laptop", 1200.0, 10),
                new Product(2, "Mouse", 25.0, 50)
        );
        when(productRepository.findAll()).thenReturn(products);

        List<Product> result = productoService.showProducts();

        assertEquals(2, result.size());
        assertEquals("Laptop", result.get(0).getDescription());
        assertEquals("Mouse", result.get(1).getDescription());
        verify(productRepository).findAll();
    }

    @Test
    void showProducts_returnsEmptyList_whenNoProducts() {
        when(productRepository.findAll()).thenReturn(Collections.emptyList());

        List<Product> result = productoService.showProducts();

        assertTrue(result.isEmpty());
        verify(productRepository).findAll();
    }

    // --- searchProductById ---

    @Test
    void searchProductById_returnsProduct_whenExists() {
        Product product = new Product(1, "Laptop", 1200.0, 10);
        when(productRepository.findById(1)).thenReturn(Optional.of(product));

        Product result = productoService.searchProductById(1);

        assertNotNull(result);
        assertEquals(1, result.getProductId());
        assertEquals("Laptop", result.getDescription());
        assertEquals(1200.0, result.getPrice());
        assertEquals(10, result.getStock());
    }

    @Test
    void searchProductById_throwsException_whenNotFound() {
        when(productRepository.findById(99)).thenReturn(Optional.empty());

        ProductNotFoundException ex = assertThrows(ProductNotFoundException.class,
                () -> productoService.searchProductById(99));

        assertEquals("Producto no encontrado con id: 99", ex.getMessage());
    }

    @Test
    void searchProductById_throwsException_whenIdIsNull() {
        when(productRepository.findById(null)).thenReturn(Optional.empty());

        assertThrows(ProductNotFoundException.class,
                () -> productoService.searchProductById(null));
    }

    // --- saveProduct ---

    @Test
    void saveProduct_savesCorrectly() {
        Product product = new Product(null, "Teclado", 85.0, 20);
        when(productRepository.save(product)).thenReturn(new Product(1, "Teclado", 85.0, 20));

        productoService.saveProduct(product);

        verify(productRepository).save(product);
    }

    @Test
    void saveProduct_withNullProduct_throwsException() {
        when(productRepository.save(null)).thenThrow(IllegalArgumentException.class);

        assertThrows(IllegalArgumentException.class,
                () -> productoService.saveProduct(null));
    }

    @Test
    void saveProduct_calledTwiceWithSameProduct_savesEachTime() {
        Product product = new Product(1, "Laptop", 1200.0, 10);

        productoService.saveProduct(product);
        productoService.saveProduct(product);

        verify(productRepository, times(2)).save(product);
    }

    // --- deleteProductById ---

    @Test
    void deleteProductById_deletesCorrectly() {
        doNothing().when(productRepository).deleteById(1);

        productoService.deleteProductById(1);

        verify(productRepository).deleteById(1);
    }

    @Test
    void deleteProductById_withNullId_throwsException() {
        doThrow(IllegalArgumentException.class).when(productRepository).deleteById(null);

        assertThrows(IllegalArgumentException.class,
                () -> productoService.deleteProductById(null));
    }
}