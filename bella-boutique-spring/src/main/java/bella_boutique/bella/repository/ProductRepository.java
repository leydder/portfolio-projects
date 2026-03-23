package bella_boutique.bella.repository;

import bella_boutique.bella.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT COUNT(si) > 0 FROM SaleItem si WHERE si.product.id = :id")
    boolean existsProductInSales(@Param("id") Long id);

    List<Product> findByReferenceNumberContainingIgnoreCaseOrNameContainingIgnoreCase(String ref, String name);
}
