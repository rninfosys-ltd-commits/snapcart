package com.controller.admin;

// import com.entity.Order;
// import com.repository.OrderRepository;
import com.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * InvoiceController
 * =================
 * 
 * Controller for invoice operations
 */
@RestController("adminInvoiceController")
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    // @Autowired
    // private OrderRepository orderRepository;

    /**
     * Download invoice PDF (User access)
     * 
     * GET /api/invoices/{orderId}
     */
    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long orderId) {
        try {
            // Order order = orderRepository.findById(orderId)
            // .orElseThrow(() -> new RuntimeException("Order not found"));

            byte[] invoicePdf = invoiceService.generateInvoice(orderId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "SnapCart_Invoice_" + orderId + ".pdf");

            return new ResponseEntity<>(invoicePdf, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Resend invoice email (SUPER_ADMIN only)
     * 
     * POST /api/admin/invoices/{orderId}/resend
     */
    @PostMapping("/admin/invoices/{orderId}/resend")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, String>> resendInvoice(@PathVariable Long orderId) {
        try {
            invoiceService.sendInvoiceEmail(orderId);

            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Invoice resent successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
