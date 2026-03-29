package bella_boutique.bella.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SellerDTO {
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    private String firstName;

    @NotBlank(message = "El apellido es obligatorio")
    private String lastName;
}