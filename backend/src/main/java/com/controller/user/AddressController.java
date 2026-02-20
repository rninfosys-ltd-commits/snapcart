package com.controller.user;

import com.entity.Address;
import com.entity.User;
import com.repository.UserRepository;
import com.service.AddressService;
import com.service.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/addresses")
@PreAuthorize("hasRole('USER') or hasRole('MODERATOR') or hasRole('ADMIN')")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Address>> getMyAddresses() {
        User user = getCurrentUser();
        return ResponseEntity.ok(addressService.getUserAddresses(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Address> getAddress(@PathVariable Long id) {
        User user = getCurrentUser();
        return ResponseEntity.ok(addressService.getAddressById(id, user));
    }

    @GetMapping("/default")
    public ResponseEntity<Address> getDefaultAddress() {
        User user = getCurrentUser();
        Address defaultAddress = addressService.getDefaultAddress(user);
        if (defaultAddress == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(defaultAddress);
    }

    @PostMapping
    public ResponseEntity<Address> createAddress(@RequestBody Address address) {
        User user = getCurrentUser();
        return ResponseEntity.ok(addressService.createAddress(user, address));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Address> updateAddress(@PathVariable Long id, @RequestBody Address address) {
        User user = getCurrentUser();
        return ResponseEntity.ok(addressService.updateAddress(id, user, address));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        User user = getCurrentUser();
        addressService.deleteAddress(id, user);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<Address> setAsDefault(@PathVariable Long id) {
        User user = getCurrentUser();
        return ResponseEntity.ok(addressService.setAsDefault(id, user));
    }

    private User getCurrentUser() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        return userRepository.findById(Objects.requireNonNull(userDetails.getId(), "User ID is required"))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
