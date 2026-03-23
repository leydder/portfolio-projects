package bella_boutique.bella.service;

import bella_boutique.bella.dto.CreditPaymentDTO;
import bella_boutique.bella.dto.SaleRequestDTO;
import bella_boutique.bella.dto.SaleResponseDTO;
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
    private final ProductServiceImpl productService;

    public SaleServiceImpl(SaleRepository saleRepository,
                           ProductRepository productRepository,
                           ProductSizeRepository productSizeRepository,
                           CreditPaymentRepository creditPaymentRepository,
                           ProductServiceImpl productService) {
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

        // Validaciones de crédito
        if (paymentType == PaymentType.CREDITO) {
            if (dto.getBuyerName() == null || dto.getBuyerName().isBlank()) {
                throw new InvalidRequestException("El nombre del comprador es obligatorio para ventas a crédito");
            }
            if (dto.getInitialPayment() == null || dto.getInitialPayment().signum() < 0) {
                throw new InvalidRequestException("El pago inicial es obligatorio para ventas a crédito");
            }
        }

        Sale sale = new Sale();
        sale.setPaymentType(paymentType);
        sale.setBuyerName(dto.getBuyerName());
        sale.setInitialPayment(dto.getInitialPayment());

        List<SaleItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (SaleRequestDTO.SaleItemRequestDTO itemDTO : dto.getItems()) {
            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            String.format(PRODUCT_NOT_FOUND, itemDTO.getProductId())));

            SaleItem item = new SaleItem();
            item.setSale(sale);
            item.setProduct(product);
            item.setQuantity(itemDTO.getQuantity());
            item.setUnitPrice(product.getPrice());

            // Si viene con talla, descuenta de esa talla específica
            if (itemDTO.getProductSizeId() != null) {
                ProductSize size = productSizeRepository.findById(itemDTO.getProductSizeId())
                        .orElseThrow(() -> new ResourceNotFoundException("Talla no encontrada"));

                // Verifica stock suficiente en esa talla
                if (size.getStock() < itemDTO.getQuantity()) {
                    throw new InsufficientStockException(String.format(INSUFFICIENT_STOCK,
                            product.getName(), size.getSizeName(), size.getStock(), itemDTO.getQuantity()));
                }

                // Descuenta el stock de la talla
                size.setStock(size.getStock() - itemDTO.getQuantity());
                productSizeRepository.save(size);

                item.setSizeName(size.getSizeName());
                item.setProductSize(size);

                // Actualiza el stock total del producto
                productService.updateTotalStock(product);
                productRepository.save(product);

            } else {
                // Sin talla: descuenta del stock general
                if (product.getStock() < itemDTO.getQuantity()) {
                    throw new InsufficientStockException(String.format(
                            "Stock insuficiente para '%s'. Disponible: %d, solicitado: %d",
                            product.getName(), product.getStock(), itemDTO.getQuantity()));
                }
                product.setStock(product.getStock() - itemDTO.getQuantity());
                productRepository.save(product);
                item.setSizeName(itemDTO.getSizeName());
            }

            items.add(item);
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity())));
        }

        sale.setItems(items);
        sale.setTotalAmount(total);

        // Calcula saldo restante para crédito
        if (paymentType == PaymentType.CREDITO) {
            BigDecimal inicial = dto.getInitialPayment() != null ? dto.getInitialPayment() : BigDecimal.ZERO;
            sale.setRemainingBalance(total.subtract(inicial));
        } else {
            sale.setRemainingBalance(BigDecimal.ZERO);
        }

        Sale savedSale = saleRepository.save(sale);

        // Guarda los pagos a crédito si existen
        if (paymentType == PaymentType.CREDITO && dto.getCreditPayments() != null) {
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

        // Marca el pago como pagado
        CreditPayment cp = creditPaymentRepository.findById(dto.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado"));
        cp.setPaid(true);
        cp.setPaidDate(java.time.LocalDate.now());
        creditPaymentRepository.save(cp);

        // Actualiza el saldo restante
        BigDecimal totalPagado = creditPaymentRepository.findBySaleId(saleId).stream()
                .filter(CreditPayment::isPaid)
                .map(CreditPayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal inicial = sale.getInitialPayment() != null ? sale.getInitialPayment() : BigDecimal.ZERO;
        sale.setRemainingBalance(sale.getTotalAmount().subtract(inicial).subtract(totalPagado));
        saleRepository.save(sale);

        return toResponseDTO(sale);
    }

    private PaymentType parsePaymentType(String type) {
        try {
            return PaymentType.valueOf(type.toUpperCase());
        } catch (Exception e) {
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

        dto.setItems(sale.getItems().stream().map(item -> {
            SaleResponseDTO.SaleItemResponseDTO i = new SaleResponseDTO.SaleItemResponseDTO();
            i.setId(item.getId());
            i.setProductId(item.getProduct().getId());
            i.setProductName(item.getProduct().getName());
            i.setReferenceNumber(item.getProduct().getReferenceNumber());
            i.setQuantity(item.getQuantity());
            i.setUnitPrice(item.getUnitPrice());
            i.setSizeName(item.getSizeName());
            return i;
        }).toList());

        // Carga los pagos a crédito
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