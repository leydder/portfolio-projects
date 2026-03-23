package bella_boutique.bella.repository;

import bella_boutique.bella.model.CreditPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CreditPaymentRepository extends JpaRepository<CreditPayment, Long> {
    List<CreditPayment> findBySaleId(Long saleId);
}