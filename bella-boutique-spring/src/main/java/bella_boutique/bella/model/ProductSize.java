package bella_boutique.bella.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "product_sizes")
public class ProductSize {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private String sizeName;

    @Column(nullable = false)
    private Integer stock;
}