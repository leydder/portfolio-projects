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
    private List<SaleItemResponseDTO> items;

    @Data
    public static class SaleItemResponseDTO {
        private Long id;
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
    }
}
