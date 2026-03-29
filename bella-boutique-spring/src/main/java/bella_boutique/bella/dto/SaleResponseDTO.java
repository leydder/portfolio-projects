package bella_boutique.bella.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SaleResponseDTO {
    private Long id;
    private LocalDateTime saleDate;
    private BigDecimal totalAmount;
    private String paymentType;
    private String buyerName;
    private BigDecimal initialPayment;
    private BigDecimal remainingBalance;
    private String sellerName;
    private List<SaleItemResponseDTO> items;
    private List<CreditPaymentDTO> creditPayments;

    @Data
    public static class SaleItemResponseDTO {
        private Long id;
        private Long productId;
        private String productName;
        private String referenceNumber;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal purchasePrice;
        private String sizeName;
    }
}