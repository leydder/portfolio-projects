package bella_boutique.bella.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.util.List;

@Data
public class SaleRequestDTO {

    @NotNull(message = "Los items son obligatorios")
    @NotEmpty(message = "Debe incluir al menos un item")
    private List<SaleItemRequestDTO> items;

    @Data
    public static class SaleItemRequestDTO {

        @NotNull(message = "El productId es obligatorio")
        private Long productId;

        @NotNull(message = "La cantidad es obligatoria")
        @Positive(message = "La cantidad debe ser mayor que 0")
        private Integer quantity;
    }
}
