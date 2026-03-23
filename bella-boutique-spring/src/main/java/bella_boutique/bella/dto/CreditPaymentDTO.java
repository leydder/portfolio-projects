package bella_boutique.bella.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreditPaymentDTO {
    private Long id;

    @NotNull(message = "El monto es obligatorio")
    @Positive(message = "El monto debe ser mayor que 0")
    private BigDecimal amount;

    @NotNull(message = "La fecha de pago es obligatoria")
    private LocalDate dueDate;

    private boolean paid;
    private LocalDate paidDate;
    private String notes;
}