package com.legp.constructora.controller;

import com.legp.constructora.service.ReportService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.util.Optional;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private static final MediaType XLSX = MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/projects")
    public ResponseEntity<InputStreamResource> downloadProjectsReport(
            @RequestParam(required = false) Long id) {
        Optional<ByteArrayInputStream> file = reportService.generateProjectsReport(id);
        if (file.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        String filename = id != null ? "proyecto-" + id + ".xlsx" : "proyectos.xlsx";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(XLSX)
                .body(new InputStreamResource(file.get()));
    }

    @GetMapping("/quotes")
    public ResponseEntity<InputStreamResource> downloadQuotesReport(
            @RequestParam(required = false) Long id) {
        Optional<ByteArrayInputStream> file = reportService.generateQuotesReport(id);
        if (file.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        String filename = id != null ? "presupuesto-" + id + ".xlsx" : "presupuestos.xlsx";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(XLSX)
                .body(new InputStreamResource(file.get()));
    }
}
