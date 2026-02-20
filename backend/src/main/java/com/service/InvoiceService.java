package com.service;

import com.entity.Order;
import com.entity.OrderItem;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class InvoiceService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private EmailService emailService;

    // Font Configuration
    private static final Font FONT_TITLE = FontFactory.getFont(FontFactory.HELVETICA, 14, Font.BOLD);
    private static final Font FONT_SUBTITLE = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.BOLD);
    private static final Font FONT_BODY = FontFactory.getFont(FontFactory.HELVETICA, 9, Font.NORMAL);
    private static final Font FONT_BODY_BOLD = FontFactory.getFont(FontFactory.HELVETICA, 9, Font.BOLD);
    private static final Font FONT_SMALL = FontFactory.getFont(FontFactory.HELVETICA, 8, Font.NORMAL);
    private static final Font FONT_TABLE_HEADER = FontFactory.getFont(FontFactory.HELVETICA, 8, Font.BOLD);

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public byte[] generateInvoice(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        return generateInvoiceFromOrder(order);
    }

    private byte[] generateInvoiceFromOrder(Order order) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 20, 20, 20, 20);
            PdfWriter.getInstance(document, out);

            document.open();

            // 1. Header Section
            // Logo (Left) and Invoice Title (Right)
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[] { 1f, 1f });

            // Mock Logo Placeholder
            PdfPCell logoCell = new PdfPCell(
                    new Paragraph("SnapCart", FontFactory.getFont(FontFactory.HELVETICA, 24, Font.BOLD)));
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            headerTable.addCell(logoCell);

            PdfPCell titleCell = new PdfPCell(
                    new Paragraph("Tax Invoice/Bill of Supply/Cash Memo\n(Original for Recipient)", FONT_TITLE));
            titleCell.setBorder(Rectangle.NO_BORDER);
            titleCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            headerTable.addCell(titleCell);

            document.add(headerTable);
            document.add(new Paragraph("\n"));

            // 2. Seller and Buyer Details
            PdfPTable addressTable = new PdfPTable(2);
            addressTable.setWidthPercentage(100);
            addressTable.setWidths(new float[] { 1.2f, 1f });

            // Sold By (Left)
            PdfPCell soldByCell = new PdfPCell();
            soldByCell.setBorder(Rectangle.NO_BORDER);
            soldByCell.addElement(new Paragraph("Sold By:", FONT_SUBTITLE));
            soldByCell.addElement(new Paragraph("SNAPCART RETAIL PRIVATE LIMITED", FONT_BODY_BOLD));
            soldByCell.addElement(new Paragraph(
                    "Building 101, Tech Park, Electronic City\nBengaluru, Karnataka, 560100\nIN", FONT_BODY));
            soldByCell.addElement(new Paragraph("\nPAN No: ABCDE1234F", FONT_BODY_BOLD));
            soldByCell.addElement(new Paragraph("GST Registration No: 29ABCDE1234F1Z5", FONT_BODY_BOLD));
            addressTable.addCell(soldByCell);

            // Bill/Ship To (Right)
            PdfPCell buyerCell = new PdfPCell();
            buyerCell.setBorder(Rectangle.NO_BORDER);
            buyerCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

            // Billing Address
            PdfPTable billTable = new PdfPTable(1);
            billTable.setWidthPercentage(100);
            PdfPCell billCell = new PdfPCell();
            billCell.setBorder(Rectangle.NO_BORDER);
            billCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            billCell.addElement(createRightAlignedParagraph("Billing Address:", FONT_SUBTITLE));
            billCell.addElement(createRightAlignedParagraph(order.getUser().getName(), FONT_BODY));
            // Parse shipping address for billing (assuming same for now if not structured)
            billCell.addElement(createRightAlignedParagraph(formatAddress(order.getShippingAddress()), FONT_BODY));
            billCell.addElement(createRightAlignedParagraph("State/UT Code: 29", FONT_BODY_BOLD)); // Mock code
            billTable.addCell(billCell);
            buyerCell.addElement(billTable);

            buyerCell.addElement(new Paragraph("\n"));

            // Shipping Address
            PdfPTable shipTable = new PdfPTable(1);
            shipTable.setWidthPercentage(100);
            PdfPCell shipCell = new PdfPCell();
            shipCell.setBorder(Rectangle.NO_BORDER);
            shipCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            shipCell.addElement(createRightAlignedParagraph("Shipping Address:", FONT_SUBTITLE));
            shipCell.addElement(createRightAlignedParagraph(order.getUser().getName(), FONT_BODY));
            shipCell.addElement(createRightAlignedParagraph(formatAddress(order.getShippingAddress()), FONT_BODY));
            shipCell.addElement(createRightAlignedParagraph("State/UT Code: 29", FONT_BODY_BOLD));
            shipCell.addElement(createRightAlignedParagraph("Place of supply: KARNATAKA", FONT_BODY_BOLD));
            shipCell.addElement(createRightAlignedParagraph("Place of delivery: KARNATAKA", FONT_BODY_BOLD));
            shipTable.addCell(shipCell);
            buyerCell.addElement(shipTable);

            addressTable.addCell(buyerCell);
            document.add(addressTable);
            document.add(new Paragraph("\n"));

            // 3. Order Details Section
            PdfPTable orderInfoTable = new PdfPTable(2);
            orderInfoTable.setWidthPercentage(100);

            // Left: Order No
            PdfPCell orderNumCell = new PdfPCell();
            orderNumCell.setBorder(Rectangle.NO_BORDER);
            orderNumCell.addElement(new Paragraph("Order Number: " + order.getId(), FONT_BODY_BOLD));
            orderNumCell.addElement(new Paragraph(
                    "Order Date: " + order.getOrderDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")),
                    FONT_BODY_BOLD));
            orderInfoTable.addCell(orderNumCell);

            // Right: Invoice No
            PdfPCell invoiceNumCell = new PdfPCell();
            invoiceNumCell.setBorder(Rectangle.NO_BORDER);
            invoiceNumCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            invoiceNumCell.addElement(
                    createRightAlignedParagraph("Invoice Number: INV-" + order.getId() + "-2026", FONT_BODY_BOLD));
            invoiceNumCell.addElement(createRightAlignedParagraph(
                    "Invoice Date: " + order.getOrderDate().format(DateTimeFormatter.ofPattern("dd.MM.yyyy")),
                    FONT_BODY_BOLD));
            orderInfoTable.addCell(invoiceNumCell);

            document.add(orderInfoTable);
            document.add(new Paragraph("\n"));

            // 4. Products Table
            // Columns: Sl(0.5), Desc(4), Unit Price(1), Qty(0.5), Net Amt(1), Tax
            // Rate(0.5), Tax Type(0.5), Tax Amt(1), Total(1)
            float[] columnWidths = { 0.5f, 4f, 1.2f, 0.6f, 1.2f, 0.8f, 0.8f, 1.2f, 1.5f };
            PdfPTable table = new PdfPTable(columnWidths);
            table.setWidthPercentage(100);
            table.setHeaderRows(1);

            // Headers
            addTableHeader(table, "Sl. No");
            addTableHeader(table, "Description");
            addTableHeader(table, "Unit Price");
            addTableHeader(table, "Qty");
            addTableHeader(table, "Net Amount");
            addTableHeader(table, "Tax Rate");
            addTableHeader(table, "Tax Type");
            addTableHeader(table, "Tax Amount");
            addTableHeader(table, "Total Amount");

            AtomicInteger slNo = new AtomicInteger(1);
            double totalTaxAmount = 0;
            double totalBaseAmount = 0;

            // Assumption: Prices are GST Inclusive (18%)
            double gstRate = 0.18;

            for (OrderItem item : order.getItems()) {
                double totalItemPriceInclusive = item.getPrice() * item.getQuantity();

                // Back-calculate Base Price and Tax
                double baseAmount = totalItemPriceInclusive / (1 + gstRate);
                double taxAmount = totalItemPriceInclusive - baseAmount;

                double cgstAmount = taxAmount / 2;
                double sgstAmount = taxAmount / 2;

                double unitBasePrice = baseAmount / item.getQuantity();

                totalBaseAmount += baseAmount;
                totalTaxAmount += taxAmount;

                addTableCell(table, String.valueOf(slNo.getAndIncrement()), Element.ALIGN_CENTER);

                String description = item.getVariant().getProduct().getName() + "\n" +
                        "Color: " + item.getVariant().getColor() + " | Size: " + item.getVariant().getSize() + "\n" +
                        "HSN: 6404";
                addTableCell(table, description, Element.ALIGN_LEFT);
                addTableCell(table, String.format("₹%.2f", unitBasePrice), Element.ALIGN_RIGHT);
                addTableCell(table, String.valueOf(item.getQuantity()), Element.ALIGN_CENTER);
                addTableCell(table, String.format("₹%.2f", baseAmount), Element.ALIGN_RIGHT);
                addTableCell(table, "9%\n9%", Element.ALIGN_CENTER);
                addTableCell(table, "CGST\nSGST", Element.ALIGN_CENTER);
                addTableCell(table, String.format("₹%.2f\n₹%.2f", cgstAmount, sgstAmount), Element.ALIGN_RIGHT);
                addTableCell(table, String.format("₹%.2f", totalItemPriceInclusive), Element.ALIGN_RIGHT);
            }

            // Total Row
            PdfPCell totalLabelCell = new PdfPCell(new Phrase("TOTAL:", FONT_BODY_BOLD));
            totalLabelCell.setColspan(8);
            totalLabelCell.setBorderWidth(1);
            table.addCell(totalLabelCell);

            PdfPCell totalValueCell = new PdfPCell(
                    new Phrase("₹" + String.format("%.2f", order.getTotalAmount()), FONT_BODY_BOLD));
            totalValueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalValueCell.setBorderWidth(1);
            table.addCell(totalValueCell);

            document.add(table);

            // 5. Amount in Words & Signatory
            PdfPTable footerTable = new PdfPTable(2);
            footerTable.setWidthPercentage(100);
            footerTable.setWidths(new float[] { 1.5f, 1f });
            footerTable.setSpacingBefore(10f);

            // Left: Words & Tax Summary
            PdfPCell wordsCell = new PdfPCell();
            wordsCell.setBorder(Rectangle.BOX);
            wordsCell.setPadding(10);
            wordsCell.addElement(new Paragraph("Amount in Words:", FONT_BODY_BOLD));
            wordsCell.addElement(
                    new Paragraph(convertAmountToWords((long) order.getTotalAmount()) + " only", FONT_BODY));

            wordsCell.addElement(new Paragraph("\nTax Summary:", FONT_SUBTITLE));
            wordsCell.addElement(new Paragraph(String.format("Taxable Value: ₹%.2f", totalBaseAmount), FONT_SMALL));
            wordsCell.addElement(new Paragraph(String.format("CGST (9%%): ₹%.2f", totalTaxAmount / 2), FONT_SMALL));
            wordsCell.addElement(new Paragraph(String.format("SGST (9%%): ₹%.2f", totalTaxAmount / 2), FONT_SMALL));
            wordsCell.addElement(new Paragraph(String.format("Total Tax: ₹%.2f", totalTaxAmount), FONT_BODY_BOLD));

            footerTable.addCell(wordsCell);

            // Right: Signatory
            PdfPCell signCell = new PdfPCell();
            signCell.setBorder(Rectangle.BOX);
            signCell.setPadding(10);
            signCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            signCell.addElement(createRightAlignedParagraph("For SNAPCART RETAIL PRIVATE LIMITED:", FONT_BODY_BOLD));
            // Placeholder for signature image if needed
            signCell.addElement(new Paragraph("\n\n"));
            signCell.addElement(createRightAlignedParagraph("Authorized Signatory", FONT_BODY));
            footerTable.addCell(signCell);

            document.add(footerTable);

            document.add(new Paragraph("Whether tax is payable under reverse charge - No", FONT_BODY));
            document.add(new Paragraph("\n"));

            // 6. Bottom info bar
            PdfPTable bottomTable = new PdfPTable(4);
            bottomTable.setWidthPercentage(100);
            bottomTable.setWidths(new float[] { 2f, 2f, 1f, 1.5f });

            addBottomCell(bottomTable, "Payment Transaction ID:\n"
                    + (order.getPaymentReference() != null ? order.getPaymentReference() : "N/A"));
            addBottomCell(bottomTable,
                    "Date & Time:\n" + order.getOrderDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
            addBottomCell(bottomTable, "Invoice Value:\n₹" + String.format("%.2f", order.getTotalAmount()));
            addBottomCell(bottomTable, "Mode of Payment:\n"
                    + (order.getPaymentMethod() != null ? order.getPaymentMethod().toUpperCase() : "Prepaid"));

            document.add(bottomTable);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error generating invoice PDF", e);
        }
    }

    private void addTableHeader(PdfPTable table, String header) {
        PdfPCell cell = new PdfPCell(new Phrase(header, FONT_TABLE_HEADER));
        cell.setBackgroundColor(new Color(220, 220, 220));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(4);
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, String text, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FONT_SMALL));
        cell.setHorizontalAlignment(align);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(4);
        table.addCell(cell);
    }

    private void addBottomCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FONT_SMALL));
        cell.setPadding(5);
        table.addCell(cell);
    }

    private Paragraph createRightAlignedParagraph(String text, Font font) {
        Paragraph p = new Paragraph(text, font);
        p.setAlignment(Element.ALIGN_RIGHT);
        return p;
    }

    private String formatAddress(String rawAddress) {
        if (rawAddress == null)
            return "";
        try {
            // Simple check to clean JSON format if present
            if (rawAddress.startsWith("{")) {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(rawAddress);
                String addr = "";
                if (node.has("addressLine"))
                    addr += node.get("addressLine").asText();
                if (node.has("city"))
                    addr += ", " + node.get("city").asText();
                if (node.has("state"))
                    addr += ", " + node.get("state").asText();
                if (node.has("pincode"))
                    addr += " - " + node.get("pincode").asText();
                return addr;
            }
        } catch (Exception e) {
        }
        return rawAddress;
    }

    // --- Helper: Number to Words ---
    private static final String[] units = { "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
            "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen",
            "Nineteen" };
    private static final String[] tens = { "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty",
            "Ninety" };

    public String convertAmountToWords(long n) {
        if (n < 0)
            return "Minus " + convertAmountToWords(-n);
        if (n < 20)
            return units[(int) n];
        if (n < 100)
            return tens[(int) n / 10] + ((n % 10 != 0) ? " " : "") + units[(int) n % 10];
        if (n < 1000)
            return units[(int) n / 100] + " Hundred" + ((n % 100 != 0) ? " " : "") + convertAmountToWords(n % 100);
        if (n < 100000)
            return convertAmountToWords(n / 1000) + " Thousand" + ((n % 1000 != 0) ? " " : "")
                    + convertAmountToWords(n % 1000);
        if (n < 10000000)
            return convertAmountToWords(n / 100000) + " Lakh" + ((n % 100000 != 0) ? " " : "")
                    + convertAmountToWords(n % 100000);
        return convertAmountToWords(n / 10000000) + " Crore" + ((n % 10000000 != 0) ? " " : "")
                + convertAmountToWords(n % 10000000);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public void sendInvoiceEmail(Long orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

            byte[] invoicePdf = generateInvoice(orderId);
            emailService.sendOrderConfirmation(
                    order.getUser().getEmail(),
                    order.getId().toString(),
                    invoicePdf);
        } catch (Exception e) {
            throw new RuntimeException("Error sending invoice email", e);
        }
    }
}
