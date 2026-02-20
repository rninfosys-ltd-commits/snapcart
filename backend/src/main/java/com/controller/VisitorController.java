package com.controller;

import com.entity.Visitor;
import com.payload.request.VisitorRequest;
import com.service.VisitorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/visitors")
public class VisitorController {

    @Autowired
    private VisitorService visitorService;

    @PostMapping("/track")
    public ResponseEntity<Visitor> trackVisitor(@RequestBody VisitorRequest request) {
        return ResponseEntity.ok(visitorService.trackVisitor(request));
    }

    @PostMapping("/email")
    public ResponseEntity<Void> updateEmail(@RequestBody VisitorRequest request) {
        if (request.getVisitorToken() != null && request.getEmail() != null) {
            visitorService.updateEmail(request.getVisitorToken(), request.getEmail());
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }
}
