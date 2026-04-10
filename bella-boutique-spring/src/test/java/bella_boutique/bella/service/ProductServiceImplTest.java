package bella_boutique.bella.service;

import bella_boutique.bella.dto.ProductRequestDTO;
import bella_boutique.bella.dto.ProductResponseDTO;
import bella_boutique.bella.exception.InvalidRequestException;
import bella_boutique.bella.exception.ResourceNotFoundException;
import bella_boutique.bella.model.Product;
import bella_boutique.bella.repository.ProductRepository;
import bella_boutique.bella.repository.ProductSizeRepository;
import bella_boutique.bella.repository.SaleItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductSizeRepository productSizeRepository;

    @Mock
    private SaleItemRepository saleItemRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product product;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setId(1L);
        product.setName("Camiseta");
        product.setPrice(new BigDecimal("29.99"));
        product.setStock(10);
    }

    @Test
    void findAll_retornaListaDeProductos() {
        when(productRepository.findAll()).thenReturn(List.of(product));
        when(productSizeRepository.findByProductId(1L)).thenReturn(List.of());

        List<ProductResponseDTO> result = productService.findAll();

        assertEquals(1, result.size());
        assertEquals("Camiseta", result.get(0).getName());
    }

    @Test
    void findAll_retornaListaVaciaSinExcepcion() {
        when(productRepository.findAll()).thenReturn(List.of());

        List<ProductResponseDTO> result = productService.findAll();

        assertTrue(result.isEmpty());
    }

    @Test
    void findById_retornaProductoExistente() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productSizeRepository.findByProductId(1L)).thenReturn(List.of());

        ProductResponseDTO result = productService.findById(1L);

        assertEquals(1L, result.getId());
        assertEquals("Camiseta", result.getName());
    }

    @Test
    void findById_idInexistente_lanzaResourceNotFoundException() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.findById(99L));
    }

    @Test
    void findById_idNulo_lanzaInvalidRequestException() {
        assertThrows(InvalidRequestException.class, () -> productService.findById(null));
    }

    @Test
    void findById_idNegativo_lanzaInvalidRequestException() {
        assertThrows(InvalidRequestException.class, () -> productService.findById(-1L));
    }

    @Test
    void create_guardaYRetornaProducto() {
        ProductRequestDTO dto = new ProductRequestDTO();
        dto.setName("Camiseta");
        dto.setPrice(new BigDecimal("29.99"));
        dto.setStock(10);

        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productSizeRepository.findByProductId(1L)).thenReturn(List.of());

        ProductResponseDTO result = productService.create(dto);

        assertEquals("Camiseta", result.getName());
        verify(productRepository, atLeastOnce()).save(any(Product.class));
    }

    @Test
    void create_precioNegativo_lanzaInvalidRequestException() {
        ProductRequestDTO dto = new ProductRequestDTO();
        dto.setName("Camiseta");
        dto.setPrice(new BigDecimal("-10.00"));
        dto.setStock(10);

        assertThrows(InvalidRequestException.class, () -> productService.create(dto));
    }

    @Test
    void delete_productoConVentas_eliminaSinExcepcion() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productSizeRepository.findByProductId(1L)).thenReturn(List.of());

        assertDoesNotThrow(() -> productService.delete(1L));

        verify(saleItemRepository).deleteByProductId(1L);
        verify(productRepository).delete(product);
    }
}