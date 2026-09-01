package com.legp.constructora.service;

import org.springframework.stereotype.Service;
import com.legp.constructora.repository.QuoteItemRepository;
import com.legp.constructora.model.QuoteItem;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

@Service
public class QuoteItemService {
    private final QuoteItemRepository quoteItemRepository;
    private final QuoteService quoteService;

    public QuoteItemService(QuoteItemRepository quoteItemRepository, QuoteService quoteService) {
        this.quoteItemRepository = quoteItemRepository;
        this.quoteService = quoteService;
    }

    public QuoteItem createItem(QuoteItem item) {
        item.setSubtotal(calculateSubtotal(item));
        QuoteItem saved = quoteItemRepository.save(item);
        quoteService.recalculateTotals(saved.getQuoteId());
        return saved;
    }

    public List<QuoteItem> getAllItems() {
        return quoteItemRepository.findAll();
    }

    public Optional<QuoteItem> getItemById(Long id) {
        return quoteItemRepository.findById(id);
    }

    public Optional<QuoteItem> updateItem(Long id, QuoteItem itemDetails) {
        return quoteItemRepository.findById(id).map(item -> {
            item.setDescription(itemDetails.getDescription());
            item.setUnit(itemDetails.getUnit());
            item.setQuantity(itemDetails.getQuantity());
            item.setUnitPrice(itemDetails.getUnitPrice());
            item.setSubtotal(calculateSubtotal(item));
            QuoteItem saved = quoteItemRepository.save(item);
            quoteService.recalculateTotals(saved.getQuoteId());
            return saved;
        });
    }

    public boolean deleteItem(Long id) {
        Optional<QuoteItem> item = quoteItemRepository.findById(id);
        if (item.isEmpty()) {
            return false;
        }
        Long quoteId = item.get().getQuoteId();
        quoteItemRepository.deleteById(id);
        quoteService.recalculateTotals(quoteId);
        return true;
    }

    private BigDecimal calculateSubtotal(QuoteItem item) {
        if (item.getQuantity() == null || item.getUnitPrice() == null) {
            throw new IllegalArgumentException("quantity y unitPrice son obligatorios");
        }
        return item.getQuantity().multiply(item.getUnitPrice()).setScale(2, RoundingMode.HALF_UP);
    }

}
