package com.legp.constructora.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.legp.constructora.repository.QuoteRepository;
import com.legp.constructora.model.Quote;
import com.legp.constructora.model.QuoteItem;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

@Service
public class QuoteService {
    private final QuoteRepository quoteRepository;

    public QuoteService(QuoteRepository quoteRepository) {
        this.quoteRepository = quoteRepository;
    }

    public Quote createQuote(Quote quote) {
        quote.setSubtotal(BigDecimal.ZERO);
        quote.setAiuAmount(BigDecimal.ZERO);
        quote.setTotal(BigDecimal.ZERO);
        return quoteRepository.save(quote);
    }

    public List<Quote> getAllQuotes() {
        return quoteRepository.findAll();
    }

    public Optional<Quote> getQuoteById(Long id) {
        return quoteRepository.findById(id);
    }

    public Optional<Quote> updateQuote(Long id, Quote quoteDetails) {
        return quoteRepository.findById(id).map(quote -> {
            quote.setProject(quoteDetails.getProject());
            quote.setQuoteNumber(quoteDetails.getQuoteNumber());
            quote.setDate(quoteDetails.getDate());
            quote.setAdministrationPercent(quoteDetails.getAdministrationPercent());
            quote.setUnforeseenPercent(quoteDetails.getUnforeseenPercent());
            quote.setUtilityPercent(quoteDetails.getUtilityPercent());
            quote.setStatus(quoteDetails.getStatus());
            quoteRepository.save(quote);
            recalculateTotals(id);
            return quoteRepository.findById(id).orElseThrow();
        });
    }

    public boolean deleteQuote(Long id) {
        if (!quoteRepository.existsById(id)) {
            return false;
        }
        quoteRepository.deleteById(id);
        return true;
    }

    @Transactional
    public void recalculateTotals(Long quoteId) {
        Quote quote = quoteRepository.findById(quoteId).orElseThrow();

        BigDecimal subtotal = quote.getItems().stream()
                .map(QuoteItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal administrationPercent = quote.getAdministrationPercent() != null ? quote.getAdministrationPercent() : BigDecimal.ZERO;
        BigDecimal unforeseenPercent = quote.getUnforeseenPercent() != null ? quote.getUnforeseenPercent() : BigDecimal.ZERO;
        BigDecimal utilityPercent = quote.getUtilityPercent() != null ? quote.getUtilityPercent() : BigDecimal.ZERO;

        BigDecimal aiuPercent = administrationPercent
                .add(unforeseenPercent)
                .add(utilityPercent);

        BigDecimal aiuAmount = subtotal.multiply(aiuPercent)
                .divide(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);

        quote.setSubtotal(subtotal);
        quote.setAiuAmount(aiuAmount);
        quote.setTotal(subtotal.add(aiuAmount));

        quoteRepository.save(quote);
    }

}
