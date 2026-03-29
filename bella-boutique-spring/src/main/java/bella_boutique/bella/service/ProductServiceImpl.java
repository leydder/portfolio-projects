package bella_boutique.bella.service;

import bella_boutique.bella.dto.ProductRequestDTO;
import bella_boutique.bella.dto.ProductResponseDTO;
import bella_boutique.bella.dto.ProductSizeDTO;
import bella_boutique.bella.exception.InvalidRequestException;
import bella_boutique.bella.exception.ResourceNotFoundException;
import bella_boutique.bella.model.Product;
import bella_boutique.bella.model.ProductSize;
import bella_boutique.bella.repository.ProductRepository;
import bella_boutique.bella.repository.ProductSizeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private static final String PRODUCT_NOT_FOUND = "Producto con ID %d no encontrado";
    private static final String INVALID_ID = "El ID debe ser un número positivo";

    private final ProductRepository productRepository;
    private final ProductSizeRepository productSizeRepository;

    public ProductServiceImpl(ProductRepository productRepository,
                              ProductSizeRepository productSizeRepository) {
        this.productRepository = productRepository;
        this.productSizeRepository = productSizeRepository;
    }

    @Override
    public List<ProductResponseDTO> findAll() {
        return productRepository.findAll().stream().map(this::toResponseDTO).toList();
    }

    @Override
    public List<ProductResponseDTO> search(String query) {
        return productRepository
                .findByReferenceNumberContainingIgnoreCaseOrNameContainingIgnoreCase(query, query)
                .stream().map(this::toResponseDTO).toList();
    }

    @Override
    public ProductResponseDTO findById(Long id) {
        validateId(id);
        return toResponseDTO(findProductById(id));
    }

    @Override
    @Transactional
    public ProductResponseDTO create(ProductRequestDTO dto) {
        if (dto.getPrice() != null && dto.getPrice().signum() <= 0) {
            throw new InvalidRequestException("El precio debe ser mayor que 0");
        }
        Product product = toEntity(dto);
        product = productRepository.save(product);

        if (dto.getSizes() != null && !dto.getSizes().isEmpty()) {
            saveSizes(product, dto.getSizes());
            updateTotalStock(product);
            product.setInitialStock(product.getStock());
        }
        return toResponseDTO(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponseDTO update(Long id, ProductRequestDTO dto) {
        validateId(id);
        Product product = findProductById(id);
        product.setReferenceNumber(dto.getReferenceNumber());
        product.setName(dto.getName());
        product.setImageUrl(dto.getImageUrl());
        product.setDescription(dto.getDescription());
        product.setPurchasePrice(dto.getPurchasePrice());
        product.setPrice(dto.getPrice());
        product.setSpecifications(dto.getSpecifications());

        if (dto.getSizes() != null) {
            productSizeRepository.deleteAll(productSizeRepository.findByProductId(id));
            saveSizes(product, dto.getSizes());
            updateTotalStock(product);
        } else {
            product.setStock(dto.getStock());
        }
        return toResponseDTO(productRepository.save(product));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        validateId(id);
        Product product = findProductById(id);
        if (productRepository.existsProductInSales(id)) {
            throw new InvalidRequestException("No se puede eliminar un producto que tiene ventas asociadas");
        }
        productRepository.delete(product);
    }

    public void updateTotalStock(Product product) {
        int total = productSizeRepository.findByProductId(product.getId())
                .stream().mapToInt(ProductSize::getStock).sum();
        product.setStock(total);
    }

    private void saveSizes(Product product, List<ProductSizeDTO> sizeDTOs) {
        List<ProductSize> sizes = new ArrayList<>();
        for (ProductSizeDTO sizeDTO : sizeDTOs) {
            ProductSize ps = new ProductSize();
            ps.setProduct(product);
            ps.setSizeName(sizeDTO.getSizeName());
            ps.setStock(sizeDTO.getStock());
            sizes.add(ps);
        }
        productSizeRepository.saveAll(sizes);
    }

    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new InvalidRequestException(INVALID_ID);
        }
    }

    private Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(String.format(PRODUCT_NOT_FOUND, id)));
    }

    private ProductResponseDTO toResponseDTO(Product product) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setId(product.getId());
        dto.setReferenceNumber(product.getReferenceNumber());
        dto.setName(product.getName());
        dto.setImageUrl(product.getImageUrl());
        dto.setDescription(product.getDescription());
        dto.setPurchasePrice(product.getPurchasePrice());
        dto.setPrice(product.getPrice());
        dto.setSpecifications(product.getSpecifications());
        dto.setStock(product.getStock());
        dto.setInitialStock(product.getInitialStock());
        dto.setCreatedAt(product.getCreatedAt());

        List<ProductSizeDTO> sizes = productSizeRepository.findByProductId(product.getId())
                .stream().map(ps -> {
                    ProductSizeDTO s = new ProductSizeDTO();
                    s.setId(ps.getId());
                    s.setSizeName(ps.getSizeName());
                    s.setStock(ps.getStock());
                    return s;
                }).toList();
        dto.setSizes(sizes);
        return dto;
    }

    private Product toEntity(ProductRequestDTO dto) {
        Product product = new Product();
        product.setReferenceNumber(dto.getReferenceNumber());
        product.setName(dto.getName());
        product.setImageUrl(dto.getImageUrl());
        product.setDescription(dto.getDescription());
        product.setPurchasePrice(dto.getPurchasePrice());
        product.setPrice(dto.getPrice());
        product.setSpecifications(dto.getSpecifications());
        int stockVal = dto.getStock() != null ? dto.getStock() : 0;
        product.setStock(stockVal);
        product.setInitialStock(stockVal);
        return product;
    }
}