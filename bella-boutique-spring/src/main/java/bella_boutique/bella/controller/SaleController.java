package bella_boutique.bella.controller;

import bella_boutique.bella.dto.SaleRequestDTO;
import bella_boutique.bella.dto.SaleResponseDTO;
import bella_boutique.bella.service.SaleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @PostMapping
    public ResponseEntity<SaleResponseDTO> create(@Valid @RequestBody SaleRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(saleService.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<SaleResponseDTO>> findAll() {
        return ResponseEntity.ok(saleService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SaleResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.findById(id));
    }
}

