package com.controller.moderator;

import com.payload.response.AnalyticsSummary;
import com.payload.response.ChartData;
import com.service.AnalyticsService;
import com.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController("moderatorAnalyticsController")
@RequestMapping("/api/moderator/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<AnalyticsSummary> getSummary(
            @RequestParam(defaultValue = "monthly") String range,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(analyticsService.getSummary(currentUser.getId(), range));
    }

    @GetMapping("/orders-trend")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<ChartData> getOrdersTrend(
            @RequestParam(defaultValue = "monthly") String range,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(analyticsService.getOrdersTrend(currentUser.getId(), range));
    }

    @GetMapping("/revenue-trend")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<ChartData> getRevenueTrend(
            @RequestParam(defaultValue = "monthly") String range,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(analyticsService.getRevenueTrend(currentUser.getId(), range));
    }

    @GetMapping("/category-distribution")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<ChartData> getCategoryDistribution(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.ok(analyticsService.getCategoryDistribution(currentUser.getId()));
    }
}
