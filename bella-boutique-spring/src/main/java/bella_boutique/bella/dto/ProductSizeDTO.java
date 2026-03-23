package bella_boutique.bella.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductSizeDTO {
    private Long id;

    @NotBlank(message = "El nombre de la talla es obligatorio")
    private String sizeName;

    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;
}