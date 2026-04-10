package bella_boutique.bella.service;

import bella_boutique.bella.dto.CreditPaymentDTO;
import bella_boutique.bella.dto.SaleRequestDTO;
import bella_boutique.bella.dto.SaleResponseDTO;
import bella_boutique.bella.dto.SettleRequestDTO;
import java.util.List;

public interface SaleService {
    SaleResponseDTO create(SaleRequestDTO dto);
    List<SaleResponseDTO> findAll();
    SaleResponseDTO findById(Long id);
    SaleResponseDTO registerPayment(Long saleId, CreditPaymentDTO dto);
    SaleResponseDTO settleDebt(Long saleId, SettleRequestDTO dto);
    void delete(Long id);
    List<SaleResponseDTO> findAllDeleted();
}
