package com.legp.constructora.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quotes")
public class Quote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    private String quoteNumber;
    private LocalDate date;

    private BigDecimal administrationPercent;
    private BigDecimal unforeseenPercent;
    private BigDecimal utilityPercent;

    private BigDecimal subtotal;
    private BigDecimal aiuAmount;
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    private QuoteStatus status;

    @OneToMany(mappedBy = "quote", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuoteItem> items = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public String getQuoteNumber() {
        return quoteNumber;
    }

    public void setQuoteNumber(String quoteNumber) {
        this.quoteNumber = quoteNumber;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public BigDecimal getAdministrationPercent() {
        return administrationPercent;
    }

    public void setAdministrationPercent(BigDecimal administrationPercent) {
        this.administrationPercent = administrationPercent;
    }

    public BigDecimal getUnforeseenPercent() {
        return unforeseenPercent;
    }

    public void setUnforeseenPercent(BigDecimal unforeseenPercent) {
        this.unforeseenPercent = unforeseenPercent;
    }

    public BigDecimal getUtilityPercent() {
        return utilityPercent;
    }

    public void setUtilityPercent(BigDecimal utilityPercent) {
        this.utilityPercent = utilityPercent;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getAiuAmount() {
        return aiuAmount;
    }

    public void setAiuAmount(BigDecimal aiuAmount) {
        this.aiuAmount = aiuAmount;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public QuoteStatus getStatus() {
        return status;
    }

    public void setStatus(QuoteStatus status) {
        this.status = status;
    }

    public List<QuoteItem> getItems() {
        return items;
    }

    public void setItems(List<QuoteItem> items) {
        this.items = items;
    }
}
