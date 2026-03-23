package bella_boutique.bella.service;

import bella_boutique.bella.dto.ProductRequestDTO;
import bella_boutique.bella.dto.ProductResponseDTO;
import bella_boutique.bella.model.Product;
import java.util.List;

public interface ProductService {
    List<ProductResponseDTO> findAll();
    List<ProductResponseDTO> search(String query);
    ProductResponseDTO findById(Long id);
    ProductResponseDTO create(ProductRequestDTO dto);
    ProductResponseDTO update(Long id, ProductRequestDTO dto);
    void delete(Long id);
    void updateTotalStock(Product product);
}
