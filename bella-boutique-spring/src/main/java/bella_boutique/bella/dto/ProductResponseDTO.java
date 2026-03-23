package bella_boutique.bella.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class ProductResponseDTO {
    private Long id;
    private String referenceNumber;
    private String name;
    private String imageUrl;
    private String description;
    private BigDecimal price;
    private Double rating;
    private Map<String, String> specifications;
    private Integer stock;
    private LocalDateTime createdAt;
}
