package bella_boutique.bella.repository;

import bella_boutique.bella.model.ProductSize;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductSizeRepository extends JpaRepository<ProductSize, Long> {
    List<ProductSize> findByProductId(Long productId);
    Optional<ProductSize> findByProductIdAndSizeName(Long productId, String sizeName);
}