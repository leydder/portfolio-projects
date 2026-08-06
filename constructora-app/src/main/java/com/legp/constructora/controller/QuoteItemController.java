package com.legp.constructora.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;
import com.legp.constructora.service.QuoteItemService;
import com.legp.constructora.model.QuoteItem;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/quote-items")
public class QuoteItemController {

    private final QuoteItemService quoteItemService;

    public QuoteItemController(QuoteItemService quoteItemService) {
        this.quoteItemService = quoteItemService;
    }

    @PostMapping
    public QuoteItem createItem(@RequestBody QuoteItem item) {
        return quoteItemService.createItem(item);
    }

    @GetMapping
    public List<QuoteItem> getAllItems() {
        return quoteItemService.getAllItems();
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuoteItem> getItemById(@PathVariable Long id) {
        Optional<QuoteItem> item = quoteItemService.getItemById(id);
        return item.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuoteItem> updateItem(@PathVariable Long id, @RequestBody QuoteItem item) {
        return quoteItemService.updateItem(id, item)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        if (quoteItemService.deleteItem(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

}
