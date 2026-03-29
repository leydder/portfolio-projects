package bella_boutique.bella.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class ProductRequestDTO {

    @NotBlank(message = "El número de referencia es obligatorio")
    private String referenceNumber;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, message = "El nombre debe tener mínimo 2 caracteres")
    private String name;

    private String imageUrl;
    private String description;

    private BigDecimal purchasePrice;

    @NotNull(message = "El precio de venta es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor que 0")
    private BigDecimal price;

    private Map<String, String> specifications;

    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;

    private List<ProductSizeDTO> sizes;
}
