package com.legp.constructora.controller;

import com.legp.constructora.model.Quote;
import com.legp.constructora.service.QuoteService;
import com.legp.constructora.service.ProjectService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/quotes")
public class QuoteViewController {

    private final QuoteService quoteService;
    private final ProjectService projectService;

    public QuoteViewController(QuoteService quoteService, ProjectService projectService) {
        this.quoteService = quoteService;
        this.projectService = projectService;
    }

    @GetMapping
    public String listQuotes(Model model) {
        model.addAttribute("quotes", quoteService.getAllQuotes());
        model.addAttribute("quote", new Quote());
        model.addAttribute("projects", projectService.getAllProjects());
        return "quotes";
    }

    @PostMapping
    public String createQuote(@ModelAttribute Quote quote) {
        quoteService.createQuote(quote);
        return "redirect:/quotes";
    }
}
