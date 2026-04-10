package bella_boutique.bella.repository;

import bella_boutique.bella.model.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    List<SaleItem> findByProductId(Long productId);

    @Modifying
    @Query("DELETE FROM SaleItem si WHERE si.product.id = :productId")
    void deleteByProductId(@Param("productId") Long productId);
}