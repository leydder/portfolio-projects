package bella_boutique.bella.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SettleRequestDTO {

    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor que 0")
    private BigDecimal amount;

    private String notes;
}
