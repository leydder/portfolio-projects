package bella_boutique.bella.service;

import bella_boutique.bella.dto.SaleRequestDTO;
import bella_boutique.bella.dto.SaleResponseDTO;
import bella_boutique.bella.exception.InsufficientStockException;
import bella_boutique.bella.exception.ResourceNotFoundException;
import bella_boutique.bella.exception.InvalidRequestException;
import bella_boutique.bella.model.Product;
import bella_boutique.bella.model.Sale;
import bella_boutique.bella.model.SaleItem;
import bella_boutique.bella.repository.ProductRepository;
import bella_boutique.bella.repository.SaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class SaleServiceImpl implements SaleService {

    private static final String PRODUCT_NOT_FOUND = "Producto con ID %d no encontrado";
    private static final String SALE_NOT_FOUND = "Venta con ID %d no encontrada";
    private static final String INSUFFICIENT_STOCK = "Stock insuficiente para el producto '%s'. Disponible: %d, solicitado: %d";

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    public SaleServiceImpl(SaleRepository saleRepository, ProductRepository productRepository) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public SaleResponseDTO create(SaleRequestDTO dto) {
        Sale sale = new Sale();
        List<SaleItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (SaleRequestDTO.SaleItemRequestDTO itemDTO : dto.getItems()) {
            // Busca el producto, falla si no existe
            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            String.format(PRODUCT_NOT_FOUND, itemDTO.getProductId())));

            // Verifica que haya stock suficiente antes de descontar
            if (product.getStock() < itemDTO.getQuantity()) {
                throw new InsufficientStockException(
                        String.format(INSUFFICIENT_STOCK,
                                product.getName(), product.getStock(), itemDTO.getQuantity()));
            }

            // Descuenta el stock atómicamente dentro de la transacción
            product.setStock(product.getStock() - itemDTO.getQuantity());
            productRepository.save(product);

            // Guarda el precio al momento de la venta, no el precio actual futuro
            SaleItem item = new SaleItem();
            item.setSale(sale);
            item.setProduct(product);
            item.setQuantity(itemDTO.getQuantity());
            item.setUnitPrice(product.getPrice());

            items.add(item);
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity())));
        }

        sale.setItems(items);
        sale.setTotalAmount(total);

        return toResponseDTO(saleRepository.save(sale));
    }

    @Override
    public List<SaleResponseDTO> findAll() {
        return saleRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public SaleResponseDTO findById(Long id) {
        if (id == null || id <= 0) {
            throw new InvalidRequestException("El ID debe ser un número positivo");
        }
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(SALE_NOT_FOUND, id)));
        return toResponseDTO(sale);
    }

    private SaleResponseDTO toResponseDTO(Sale sale) {
        SaleResponseDTO dto = new SaleResponseDTO();
        dto.setId(sale.getId());
        dto.setSaleDate(sale.getSaleDate());
        dto.setTotalAmount(sale.getTotalAmount());
        dto.setItems(sale.getItems().stream().map(item -> {
            SaleResponseDTO.SaleItemResponseDTO itemDTO = new SaleResponseDTO.SaleItemResponseDTO();
            itemDTO.setId(item.getId());
            itemDTO.setProductId(item.getProduct().getId());
            itemDTO.setProductName(item.getProduct().getName());
            itemDTO.setQuantity(item.getQuantity());
            itemDTO.setUnitPrice(item.getUnitPrice());
            return itemDTO;
        }).toList());
        return dto;
    }
}
