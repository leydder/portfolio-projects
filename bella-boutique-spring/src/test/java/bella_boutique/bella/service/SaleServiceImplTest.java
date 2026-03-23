package bella_boutique.bella.service;

import bella_boutique.bella.dto.SaleRequestDTO;
import bella_boutique.bella.exception.InsufficientStockException;
import bella_boutique.bella.exception.ResourceNotFoundException;
import bella_boutique.bella.model.PaymentType;
import bella_boutique.bella.model.Product;
import bella_boutique.bella.model.Sale;
import bella_boutique.bella.repository.CreditPaymentRepository;
import bella_boutique.bella.repository.ProductRepository;
import bella_boutique.bella.repository.ProductSizeRepository;
import bella_boutique.bella.repository.SaleRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SaleServiceImplTest {

    @Mock
    private SaleRepository saleRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductSizeRepository productSizeRepository;

    @Mock
    private CreditPaymentRepository creditPaymentRepository;

    @Mock
    private ProductServiceImpl productService;

    @InjectMocks
    private SaleServiceImpl saleService;

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
    void create_ventaExitosa_descontaStockCorrectamente() {
        SaleRequestDTO dto = buildSaleRequest(1L, 3);

        Sale savedSale = new Sale();
        savedSale.setId(1L);
        savedSale.setPaymentType(PaymentType.CONTADO);
        savedSale.setTotalAmount(new BigDecimal("89.97"));
        savedSale.setRemainingBalance(BigDecimal.ZERO);
        savedSale.setItems(List.of());

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(saleRepository.save(any(Sale.class))).thenReturn(savedSale);
        when(creditPaymentRepository.findBySaleId(1L)).thenReturn(List.of());

        saleService.create(dto);

        assertEquals(7, product.getStock());
        verify(productRepository).save(product);
    }

    @Test
    void create_stockInsuficiente_lanzaInsufficientStockException() {
        SaleRequestDTO dto = buildSaleRequest(1L, 20); // pide 20, hay 10

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        assertThrows(InsufficientStockException.class, () -> saleService.create(dto));

        assertEquals(10, product.getStock());
        verify(productRepository, never()).save(any());
    }

    @Test
    void create_productoInexistente_lanzaResourceNotFoundException() {
        SaleRequestDTO dto = buildSaleRequest(99L, 1);

        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> saleService.create(dto));
    }

    private SaleRequestDTO buildSaleRequest(Long productId, int quantity) {
        SaleRequestDTO.SaleItemRequestDTO item = new SaleRequestDTO.SaleItemRequestDTO();
        item.setProductId(productId);
        item.setQuantity(quantity);

        SaleRequestDTO dto = new SaleRequestDTO();
        dto.setPaymentType("CONTADO");
        dto.setItems(List.of(item));
        return dto;
    }
}