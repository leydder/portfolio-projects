package bella_boutique.bella.repository;

import bella_boutique.bella.model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SellerRepository extends JpaRepository<Seller, Long> {
}