package com.legp.constructora.controller;

import com.legp.constructora.model.QuoteItem;
import com.legp.constructora.service.QuoteItemService;
import com.legp.constructora.service.QuoteService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/quote-items")
public class QuoteItemViewController {

    private final QuoteItemService quoteItemService;
    private final QuoteService quoteService;

    public QuoteItemViewController(QuoteItemService quoteItemService, QuoteService quoteService) {
        this.quoteItemService = quoteItemService;
        this.quoteService = quoteService;
    }

    @GetMapping
    public String listItems(Model model) {
        model.addAttribute("items", quoteItemService.getAllItems());
        model.addAttribute("item", new QuoteItem());
        model.addAttribute("quotes", quoteService.getAllQuotes());
        return "quote-items";
    }

    @PostMapping
    public String createItem(@ModelAttribute QuoteItem item) {
        quoteItemService.createItem(item);
        return "redirect:/quote-items";
    }
}
