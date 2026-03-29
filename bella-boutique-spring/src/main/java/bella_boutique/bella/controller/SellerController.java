package bella_boutique.bella.controller;

import bella_boutique.bella.dto.SellerDTO;
import bella_boutique.bella.exception.ResourceNotFoundException;
import bella_boutique.bella.model.Seller;
import bella_boutique.bella.repository.SellerRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sellers")
public class SellerController {

    private final SellerRepository sellerRepository;

    public SellerController(SellerRepository sellerRepository) {
        this.sellerRepository = sellerRepository;
    }

    @GetMapping
    public ResponseEntity<List<SellerDTO>> findAll() {
        List<SellerDTO> sellers = sellerRepository.findAll().stream().map(this::toDTO).toList();
        return ResponseEntity.ok(sellers);
    }

    @PostMapping
    public ResponseEntity<SellerDTO> create(@Valid @RequestBody SellerDTO dto) {
        Seller seller = new Seller();
        seller.setFirstName(dto.getFirstName().trim());
        seller.setLastName(dto.getLastName().trim());
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(sellerRepository.save(seller)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SellerDTO> update(@PathVariable Long id, @Valid @RequestBody SellerDTO dto) {
        Seller seller = sellerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendedor no encontrado"));
        seller.setFirstName(dto.getFirstName().trim());
        seller.setLastName(dto.getLastName().trim());
        return ResponseEntity.ok(toDTO(sellerRepository.save(seller)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sellerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendedor no encontrado"));
        sellerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private SellerDTO toDTO(Seller s) {
        SellerDTO dto = new SellerDTO();
        dto.setId(s.getId());
        dto.setFirstName(s.getFirstName());
        dto.setLastName(s.getLastName());
        return dto;
    }
}