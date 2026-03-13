package gm.inventarios.modelo;
// Esta clase va a crear la tabla de producto asociada a la BD usando JPA y hibernate
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data  // metodo lombok para los metodos Get y Set
@NoArgsConstructor
@AllArgsConstructor
public class Producto {
    @Id // Identifica que esta es la llave primaria
    @GeneratedValue(strategy = GenerationType.IDENTITY) // se genera auto incremental el id producto
    Integer idProducto;

    @NotBlank(message = "La descripción es obligatoria")
    String descripcion;

    @Positive(message = "El precio debe ser mayor que cero")
    Double precio;

    @PositiveOrZero(message = "La existencia no puede ser negativa")
    Integer existencia;
}
