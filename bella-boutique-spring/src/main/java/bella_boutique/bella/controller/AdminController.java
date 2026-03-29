package bella_boutique.bella.controller;

import bella_boutique.bella.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final CreditPaymentRepository creditPaymentRepository;
    private final SaleRepository saleRepository;
    private final ProductSizeRepository productSizeRepository;
    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;

    public AdminController(CreditPaymentRepository creditPaymentRepository,
                           SaleRepository saleRepository,
                           ProductSizeRepository productSizeRepository,
                           ProductRepository productRepository,
                           SellerRepository sellerRepository) {
        this.creditPaymentRepository = creditPaymentRepository;
        this.saleRepository = saleRepository;
        this.productSizeRepository = productSizeRepository;
        this.productRepository = productRepository;
        this.sellerRepository = sellerRepository;
    }

    @Transactional
    @DeleteMapping("/reset-data")
    public ResponseEntity<Map<String, String>> resetData() {
        creditPaymentRepository.deleteAll();
        saleRepository.deleteAll();
        productSizeRepository.deleteAll();
        productRepository.deleteAll();
        sellerRepository.deleteAll();
        return ResponseEntity.ok(Map.of("message", "Datos eliminados correctamente"));
    }
}