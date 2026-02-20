package com.service;

import com.entity.Address;
import com.entity.User;
import com.repository.AddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    private static final int MAX_ADDRESSES_PER_USER = 10;

    public List<Address> getUserAddresses(User user) {
        return addressRepository.findByUserOrderByIsDefaultDesc(user);
    }

    public Address getAddressById(Long id, User user) {
        return addressRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Address not found or unauthorized"));
    }

    public Address getDefaultAddress(User user) {
        return addressRepository.findByUserAndIsDefaultTrue(user).orElse(null);
    }

    @Transactional
    public Address createAddress(User user, Address address) {
        long count = addressRepository.countByUser(user);
        if (count >= MAX_ADDRESSES_PER_USER) {
            throw new RuntimeException("Maximum " + MAX_ADDRESSES_PER_USER + " addresses allowed per user");
        }

        address.setUser(user);

        // If this is the first address or marked as default, set it as default
        if (count == 0 || address.isDefault()) {
            address.setDefault(true);
            // Clear other defaults if setting this as default
            if (count > 0) {
                addressRepository.clearDefaultAddresses(user, -1L);
            }
        }

        return addressRepository.save(address);
    }

    @Transactional
    public Address updateAddress(Long id, User user, Address updatedAddress) {
        Address existing = getAddressById(id, user);

        existing.setLabel(updatedAddress.getLabel());
        existing.setFullName(updatedAddress.getFullName());
        existing.setPhone(updatedAddress.getPhone());
        existing.setAddressLine(updatedAddress.getAddressLine());
        existing.setCity(updatedAddress.getCity());
        existing.setState(updatedAddress.getState());
        existing.setPincode(updatedAddress.getPincode());

        if (updatedAddress.isDefault() && !existing.isDefault()) {
            addressRepository.clearDefaultAddresses(user, id);
            existing.setDefault(true);
        }

        return addressRepository.save(existing);
    }

    @Transactional
    public void deleteAddress(Long id, User user) {
        Address address = getAddressById(id, user);
        boolean wasDefault = address.isDefault();

        addressRepository.delete(address);

        // If deleted address was default, set another as default
        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserOrderByIsDefaultDesc(user);
            if (!remaining.isEmpty()) {
                Address newDefault = remaining.get(0);
                newDefault.setDefault(true);
                addressRepository.save(newDefault);
            }
        }
    }

    @Transactional
    public Address setAsDefault(Long id, User user) {
        Address address = getAddressById(id, user);
        addressRepository.clearDefaultAddresses(user, id);
        address.setDefault(true);
        return addressRepository.save(address);
    }
}
