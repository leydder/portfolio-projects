package bella_boutique.bella.service;

import bella_boutique.bella.dto.ProductRequestDTO;
import bella_boutique.bella.dto.ProductResponseDTO;
import bella_boutique.bella.exception.InvalidRequestException;
import bella_boutique.bella.exception.ResourceNotFoundException;
import bella_boutique.bella.model.Product;
import bella_boutique.bella.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private static final String PRODUCT_NOT_FOUND = "Producto con ID %d no encontrado";
    private static final String INVALID_ID = "El ID debe ser un número positivo";

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public List<ProductResponseDTO> findAll() {
        return productRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public List<ProductResponseDTO> search(String query) {
        return productRepository
                .findByReferenceNumberContainingIgnoreCaseOrNameContainingIgnoreCase(query, query)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    public ProductResponseDTO findById(Long id) {
        validateId(id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(PRODUCT_NOT_FOUND, id)));
        return toResponseDTO(product);
    }

    @Override
    public ProductResponseDTO create(ProductRequestDTO dto) {
        if (dto.getPrice() != null && dto.getPrice().signum() <= 0) {
            throw new InvalidRequestException("El precio debe ser mayor que 0");
        }
        Product product = toEntity(dto);
        return toResponseDTO(productRepository.save(product));
    }

    @Override
    public ProductResponseDTO update(Long id, ProductRequestDTO dto) {
        validateId(id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(PRODUCT_NOT_FOUND, id)));
        product.setReferenceNumber(dto.getReferenceNumber());
        product.setName(dto.getName());
        product.setImageUrl(dto.getImageUrl());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setRating(dto.getRating());
        product.setSpecifications(dto.getSpecifications());
        product.setStock(dto.getStock());
        return toResponseDTO(productRepository.save(product));
    }

    @Override
    public void delete(Long id) {
        validateId(id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        String.format(PRODUCT_NOT_FOUND, id)));
        // Verifica que el producto no tenga ventas asociadas antes de eliminar
        if (productRepository.existsProductInSales(id)) {
            throw new InvalidRequestException(
                    "No se puede eliminar un producto que tiene ventas asociadas");
        }
        productRepository.delete(product);
    }

    // Valida que el ID no sea nulo ni negativo
    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new InvalidRequestException(INVALID_ID);
        }
    }

    private ProductResponseDTO toResponseDTO(Product product) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(product.getId());
        dto.setReferenceNumber(product.getReferenceNumber());
        dto.setName(product.getName());
        dto.setImageUrl(product.getImageUrl());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setRating(product.getRating());
        dto.setSpecifications(product.getSpecifications());
        dto.setStock(product.getStock());
        dto.setCreatedAt(product.getCreatedAt());
        return dto;
    }

    private Product toEntity(ProductRequestDTO dto) {
        Product product = new Product();
        product.setReferenceNumber(dto.getReferenceNumber());
        product.setName(dto.getName());
        product.setImageUrl(dto.getImageUrl());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setRating(dto.getRating());
        product.setSpecifications(dto.getSpecifications());
        product.setStock(dto.getStock());
        return product;
    }
}

