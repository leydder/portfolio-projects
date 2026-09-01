package com.legp.constructora.service;

import com.legp.constructora.model.Project;
import com.legp.constructora.model.Quote;
import com.legp.constructora.model.QuoteItem;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.Optional;

@Service
public class ReportService {

    private final ProjectService projectService;
    private final QuoteService quoteService;

    public ReportService(ProjectService projectService, QuoteService quoteService) {
        this.projectService = projectService;
        this.quoteService = quoteService;
    }

    public Optional<ByteArrayInputStream> generateProjectsReport(Long projectId) {
        List<Project> projects;
        if (projectId != null) {
            Optional<Project> project = projectService.getProjectById(projectId);
            if (project.isEmpty()) {
                return Optional.empty();
            }
            projects = List.of(project.get());
        } else {
            projects = projectService.getAllProjects();
        }
        return Optional.of(buildProjectsWorkbook(projects));
    }

    public Optional<ByteArrayInputStream> generateQuotesReport(Long quoteId) {
        List<Quote> quotes;
        if (quoteId != null) {
            Optional<Quote> quote = quoteService.getQuoteById(quoteId);
            if (quote.isEmpty()) {
                return Optional.empty();
            }
            quotes = List.of(quote.get());
        } else {
            quotes = quoteService.getAllQuotes();
        }
        return Optional.of(buildQuotesWorkbook(quotes, quoteId != null));
    }

    private ByteArrayInputStream buildProjectsWorkbook(List<Project> projects) {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Proyectos");
            CellStyle headerStyle = headerStyle(workbook);

            String[] headers = { "ID", "Nombre", "Descripción", "Cliente", "Estado",
                    "Fecha inicio", "Fecha fin", "Ubicación" };
            writeHeader(sheet, headerStyle, headers);

            int rowIdx = 1;
            for (Project project : projects) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(project.getId());
                row.createCell(1).setCellValue(nullToEmpty(project.getName()));
                row.createCell(2).setCellValue(nullToEmpty(project.getDescription()));
                row.createCell(3).setCellValue(project.getClient() != null ? nullToEmpty(project.getClient().getName()) : "");
                row.createCell(4).setCellValue(project.getStatus() != null ? project.getStatus().name() : "");
                row.createCell(5).setCellValue(project.getStartDate() != null ? project.getStartDate().toString() : "");
                row.createCell(6).setCellValue(project.getEndDate() != null ? project.getEndDate().toString() : "");
                row.createCell(7).setCellValue(nullToEmpty(project.getLocation()));
            }

            autoSizeColumns(sheet, headers.length);
            return toStream(workbook);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private ByteArrayInputStream buildQuotesWorkbook(List<Quote> quotes, boolean includeItemsSheet) {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Presupuestos");
            CellStyle headerStyle = headerStyle(workbook);

            String[] headers = { "ID", "Proyecto", "Nro.", "Fecha", "Estado",
                    "Administración %", "Imprevistos %", "Utilidad %", "Subtotal", "AIU", "Total", "Items" };
            writeHeader(sheet, headerStyle, headers);

            int rowIdx = 1;
            for (Quote quote : quotes) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(quote.getId());
                row.createCell(1).setCellValue(quote.getProject() != null ? nullToEmpty(quote.getProject().getName()) : "");
                row.createCell(2).setCellValue(nullToEmpty(quote.getQuoteNumber()));
                row.createCell(3).setCellValue(quote.getDate() != null ? quote.getDate().toString() : "");
                row.createCell(4).setCellValue(quote.getStatus() != null ? quote.getStatus().name() : "");
                setNumericCell(row.createCell(5), quote.getAdministrationPercent());
                setNumericCell(row.createCell(6), quote.getUnforeseenPercent());
                setNumericCell(row.createCell(7), quote.getUtilityPercent());
                setNumericCell(row.createCell(8), quote.getSubtotal());
                setNumericCell(row.createCell(9), quote.getAiuAmount());
                setNumericCell(row.createCell(10), quote.getTotal());
                row.createCell(11).setCellValue(quote.getItems() != null ? quote.getItems().size() : 0);
            }

            autoSizeColumns(sheet, headers.length);

            if (includeItemsSheet && !quotes.isEmpty()) {
                writeItemsSheet(workbook, quotes.get(0));
            }

            return toStream(workbook);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private void writeItemsSheet(XSSFWorkbook workbook, Quote quote) {
        Sheet sheet = workbook.createSheet("Items");
        CellStyle headerStyle = headerStyle(workbook);

        String[] headers = { "Descripción", "Unidad", "Cantidad", "Precio unit.", "Subtotal" };
        writeHeader(sheet, headerStyle, headers);

        int rowIdx = 1;
        for (QuoteItem item : quote.getItems()) {
            Row row = sheet.createRow(rowIdx++);
            row.createCell(0).setCellValue(nullToEmpty(item.getDescription()));
            row.createCell(1).setCellValue(nullToEmpty(item.getUnit()));
            setNumericCell(row.createCell(2), item.getQuantity());
            setNumericCell(row.createCell(3), item.getUnitPrice());
            setNumericCell(row.createCell(4), item.getSubtotal());
        }

        autoSizeColumns(sheet, headers.length);
    }

    private void writeHeader(Sheet sheet, CellStyle headerStyle, String[] headers) {
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    private CellStyle headerStyle(XSSFWorkbook workbook) {
        Font font = workbook.createFont();
        font.setBold(true);
        CellStyle style = workbook.createCellStyle();
        style.setFont(font);
        return style;
    }

    private void setNumericCell(Cell cell, java.math.BigDecimal value) {
        if (value != null) {
            cell.setCellValue(value.doubleValue());
        }
    }

    private void autoSizeColumns(Sheet sheet, int columnCount) {
        for (int i = 0; i < columnCount; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private String nullToEmpty(String value) {
        return value != null ? value : "";
    }

    private ByteArrayInputStream toStream(XSSFWorkbook workbook) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}
