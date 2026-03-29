package bella_boutique.bella.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class SaleRequestDTO {

    @NotNull(message = "Los items son obligatorios")
    @NotEmpty(message = "Debe incluir al menos un item")
    private List<SaleItemRequestDTO> items;

    @NotNull(message = "El tipo de pago es obligatorio")
    private String paymentType; // CONTADO o CREDITO

    private String sellerName;

    // Solo para crédito
    private String buyerName;
    private BigDecimal initialPayment;
    private List<CreditPaymentDTO> creditPayments;

    @Data
    public static class SaleItemRequestDTO {

        @NotNull(message = "El productId es obligatorio")
        private Long productId;

        @NotNull(message = "La cantidad es obligatoria")
        @Positive(message = "La cantidad debe ser mayor que 0")
        private Integer quantity;

        private Long productSizeId;
        private String sizeName;
    }
}