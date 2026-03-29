package bella_boutique.bella.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreditPaymentDTO {
    private Long id;

    private BigDecimal amount;

    private LocalDate dueDate;

    private boolean paid;
    private LocalDate paidDate;
    private String notes;
}