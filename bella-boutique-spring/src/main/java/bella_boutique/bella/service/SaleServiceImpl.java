package bella_boutique.bella.service;

import bella_boutique.bella.dto.CreditPaymentDTO;
import bella_boutique.bella.dto.SaleRequestDTO;
import bella_boutique.bella.dto.SaleResponseDTO;
import bella_boutique.bella.dto.SettleRequestDTO;
import bella_boutique.bella.exception.InsufficientStockException;
import bella_boutique.bella.exception.InvalidRequestException;
import bella_boutique.bella.exception.ResourceNotFoundException;
import bella_boutique.bella.model.*;
import bella_boutique.bella.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class SaleServiceImpl implements SaleService {

    private static final String PRODUCT_NOT_FOUND = "Producto con ID %d no encontrado";
    private static final String SALE_NOT_FOUND = "Venta con ID %d no encontrada";
    private static final String INSUFFICIENT_STOCK = "Stock insuficiente para '%s' talla '%s'. Disponible: %d, solicitado: %d";

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final ProductSizeRepository productSizeRepository;
    private final CreditPaymentRepository creditPaymentRepository;
    private final ProductService productService;

    public SaleServiceImpl(SaleRepository saleRepository,
                           ProductRepository productRepository,
                           ProductSizeRepository productSizeRepository,
                           CreditPaymentRepository creditPaymentRepository,
                           ProductService productService) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.productSizeRepository = productSizeRepository;
        this.creditPaymentRepository = creditPaymentRepository;
        this.productService = productService;
    }

    @Override
    @Transactional
    public SaleResponseDTO create(SaleRequestDTO dto) {
        PaymentType paymentType = parsePaymentType(dto.getPaymentType());
        validateCreditFields(paymentType, dto);

        Sale sale = buildSale(dto, paymentType);
        List<SaleItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (SaleRequestDTO.SaleItemRequestDTO itemDTO : dto.getItems()) {
            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            String.format(PRODUCT_NOT_FOUND, itemDTO.getProductId())));

            SaleItem item = buildSaleItem(sale, product, itemDTO);
            items.add(item);
            total = total.add(item.getUnitPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity())));
        }

        sale.setItems(items);
        sale.setTotalAmount(total);
        sale.setRemainingBalance(calculateRemainingBalance(paymentType, total, dto.getInitialPayment()));

        Sale savedSale = saleRepository.save(sale);
        saveCreditPayments(paymentType, dto, savedSale);

        return toResponseDTO(savedSale);
    }

    @Override
    public List<SaleResponseDTO> findAll() {
        return saleRepository.findAll().stream().map(this::toResponseDTO).toList();
    }

    @Override
    public SaleResponseDTO findById(Long id) {
        if (id == null || id <= 0) throw new InvalidRequestException("El ID debe ser un número positivo");
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(String.format(SALE_NOT_FOUND, id)));
        return toResponseDTO(sale);
    }

    @Override
    @Transactional
    public SaleResponseDTO registerPayment(Long saleId, CreditPaymentDTO dto) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new ResourceNotFoundException(String.format(SALE_NOT_FOUND, saleId)));

        if (sale.getPaymentType() != PaymentType.CREDITO) {
            throw new InvalidRequestException("Solo se pueden registrar pagos en ventas a crédito");
        }

        CreditPayment payment = creditPaymentRepository.findById(dto.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado"));

        // Permitir sobrescribir el monto de la cuota
        if (dto.getAmount() != null && dto.getAmount().signum() > 0) {
            payment.setAmount(dto.getAmount());
        }
        payment.setPaid(true);
        payment.setPaidDate(java.time.LocalDate.now());
        creditPaymentRepository.save(payment);

        BigDecimal totalPagado = creditPaymentRepository.findBySaleId(saleId).stream()
                .filter(CreditPayment::isPaid)
                .map(CreditPayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal inicial = sale.getInitialPayment() != null ? sale.getInitialPayment() : BigDecimal.ZERO;
        BigDecimal nuevoSaldo = sale.getTotalAmount().subtract(inicial).subtract(totalPagado);

        if (nuevoSaldo.compareTo(BigDecimal.ZERO) <= 0) {
            // Cerrar todas las cuotas pendientes restantes
            List<CreditPayment> restantes = creditPaymentRepository.findBySaleId(saleId).stream()
                    .filter(cp -> !cp.isPaid())
                    .toList();
            restantes.forEach(cp -> {
                cp.setPaid(true);
                cp.setPaidDate(java.time.LocalDate.now());
                cp.setAmount(BigDecimal.ZERO);
            });
            creditPaymentRepository.saveAll(restantes);
            sale.setRemainingBalance(BigDecimal.ZERO);
        } else {
            sale.setRemainingBalance(nuevoSaldo);
        }
        saleRepository.save(sale);

        return toResponseDTO(sale);
    }

    @Override
    @Transactional
    public SaleResponseDTO settleDebt(Long saleId, SettleRequestDTO dto) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new ResourceNotFoundException(String.format(SALE_NOT_FOUND, saleId)));

        if (sale.getPaymentType() != PaymentType.CREDITO) {
            throw new InvalidRequestException("Solo se puede liquidar una venta a crédito");
        }
        if (sale.getRemainingBalance().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidRequestException("Esta venta ya está saldada");
        }

        BigDecimal saldoPendiente = sale.getRemainingBalance();
        boolean esDescuento = dto.getAmount().compareTo(saldoPendiente) < 0;

        String nota = (dto.getNotes() != null && !dto.getNotes().isBlank())
                ? dto.getNotes()
                : (esDescuento
                    ? "Cancelación de deuda por decisión de gerencia. Acordado: $" + dto.getAmount().toPlainString()
                      + " de $" + saldoPendiente.toPlainString() + " pendiente."
                    : "Pago total de deuda.");

        List<CreditPayment> pendientes = creditPaymentRepository.findBySaleId(saleId).stream()
                .filter(cp -> !cp.isPaid())
                .toList();

        if (!pendientes.isEmpty()) {
            // Primera cuota recibe el monto y la nota del acuerdo
            CreditPayment primera = pendientes.get(0);
            primera.setAmount(dto.getAmount());
            primera.setPaid(true);
            primera.setPaidDate(java.time.LocalDate.now());
            primera.setNotes(nota);
            creditPaymentRepository.save(primera);

            // Resto se zerean y marcan pagadas
            List<CreditPayment> resto = pendientes.stream().skip(1).toList();
            resto.forEach(cp -> {
                cp.setPaid(true);
                cp.setPaidDate(java.time.LocalDate.now());
                cp.setAmount(BigDecimal.ZERO);
            });
            creditPaymentRepository.saveAll(resto);
        }

        sale.setRemainingBalance(BigDecimal.ZERO);
        saleRepository.save(sale);

        return toResponseDTO(sale);
    }

    private void validateCreditFields(PaymentType paymentType, SaleRequestDTO dto) {
        if (paymentType != PaymentType.CREDITO) return;
        if (dto.getBuyerName() == null || dto.getBuyerName().isBlank()) {
            throw new InvalidRequestException("El nombre del comprador es obligatorio para ventas a crédito");
        }
        if (dto.getInitialPayment() == null || dto.getInitialPayment().signum() < 0) {
            throw new InvalidRequestException("El pago inicial es obligatorio para ventas a crédito");
        }
    }

    private Sale buildSale(SaleRequestDTO dto, PaymentType paymentType) {
        Sale sale = new Sale();
        sale.setPaymentType(paymentType);
        sale.setBuyerName(dto.getBuyerName());
        sale.setInitialPayment(dto.getInitialPayment());
        sale.setSellerName(dto.getSellerName());
        return sale;
    }

    private SaleItem buildSaleItem(Sale sale, Product product, SaleRequestDTO.SaleItemRequestDTO itemDTO) {
        SaleItem item = new SaleItem();
        item.setSale(sale);
        item.setProduct(product);
        item.setQuantity(itemDTO.getQuantity());
        BigDecimal unitPrice = (itemDTO.getUnitPrice() != null) ? itemDTO.getUnitPrice() : product.getPrice();
        item.setUnitPrice(unitPrice);
        item.setPurchasePrice(product.getPurchasePrice());

        if (itemDTO.getProductSizeId() != null) {
            deductSizeStock(item, product, itemDTO);
        } else {
            deductGeneralStock(item, product, itemDTO);
        }
        return item;
    }

    private void deductSizeStock(SaleItem item, Product product, SaleRequestDTO.SaleItemRequestDTO itemDTO) {
        ProductSize size = productSizeRepository.findById(itemDTO.getProductSizeId())
                .orElseThrow(() -> new ResourceNotFoundException("Talla no encontrada"));

        if (size.getStock() < itemDTO.getQuantity()) {
            throw new InsufficientStockException(String.format(INSUFFICIENT_STOCK,
                    product.getName(), size.getSizeName(), size.getStock(), itemDTO.getQuantity()));
        }

        size.setStock(size.getStock() - itemDTO.getQuantity());
        productSizeRepository.save(size);
        item.setSizeName(size.getSizeName());
        item.setProductSize(size);

        productService.updateTotalStock(product);
        productRepository.save(product);
    }

    private void deductGeneralStock(SaleItem item, Product product, SaleRequestDTO.SaleItemRequestDTO itemDTO) {
        if (product.getStock() < itemDTO.getQuantity()) {
            throw new InsufficientStockException(String.format(
                    "Stock insuficiente para '%s'. Disponible: %d, solicitado: %d",
                    product.getName(), product.getStock(), itemDTO.getQuantity()));
        }
        product.setStock(product.getStock() - itemDTO.getQuantity());
        productRepository.save(product);
        item.setSizeName(itemDTO.getSizeName());
    }

    private BigDecimal calculateRemainingBalance(PaymentType paymentType, BigDecimal total, BigDecimal initialPayment) {
        if (paymentType != PaymentType.CREDITO) return BigDecimal.ZERO;
        BigDecimal inicial = initialPayment != null ? initialPayment : BigDecimal.ZERO;
        return total.subtract(inicial);
    }

    private void saveCreditPayments(PaymentType paymentType, SaleRequestDTO dto, Sale savedSale) {
        if (paymentType != PaymentType.CREDITO || dto.getCreditPayments() == null) return;
        for (CreditPaymentDTO cpDTO : dto.getCreditPayments()) {
            CreditPayment cp = new CreditPayment();
            cp.setSale(savedSale);
            cp.setAmount(cpDTO.getAmount());
            cp.setDueDate(cpDTO.getDueDate());
            cp.setPaid(false);
            cp.setNotes(cpDTO.getNotes());
            creditPaymentRepository.save(cp);
        }
    }

    private PaymentType parsePaymentType(String type) {
        try {
            return PaymentType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidRequestException("Tipo de pago inválido. Use CONTADO o CREDITO");
        }
    }

    private SaleResponseDTO toResponseDTO(Sale sale) {
        SaleResponseDTO dto = new SaleResponseDTO();
        dto.setId(sale.getId());
        dto.setSaleDate(sale.getSaleDate());
        dto.setTotalAmount(sale.getTotalAmount());
        dto.setPaymentType(sale.getPaymentType().name());
        dto.setBuyerName(sale.getBuyerName());
        dto.setInitialPayment(sale.getInitialPayment());
        dto.setRemainingBalance(sale.getRemainingBalance());
        dto.setSellerName(sale.getSellerName());

        dto.setItems(sale.getItems().stream().map(item -> {
            SaleResponseDTO.SaleItemResponseDTO i = new SaleResponseDTO.SaleItemResponseDTO();
            i.setId(item.getId());
            i.setProductId(item.getProduct().getId());
            i.setProductName(item.getProduct().getName());
            i.setReferenceNumber(item.getProduct().getReferenceNumber());
            i.setQuantity(item.getQuantity());
            i.setUnitPrice(item.getUnitPrice());
            i.setPurchasePrice(item.getPurchasePrice());
            i.setSizeName(item.getSizeName());
            return i;
        }).toList());

        List<CreditPaymentDTO> payments = creditPaymentRepository.findBySaleId(sale.getId())
                .stream().map(cp -> {
                    CreditPaymentDTO cpDTO = new CreditPaymentDTO();
                    cpDTO.setId(cp.getId());
                    cpDTO.setAmount(cp.getAmount());
                    cpDTO.setDueDate(cp.getDueDate());
                    cpDTO.setPaid(cp.isPaid());
                    cpDTO.setPaidDate(cp.getPaidDate());
                    cpDTO.setNotes(cp.getNotes());
                    return cpDTO;
                }).toList();
        dto.setCreditPayments(payments);

        return dto;
    }
}