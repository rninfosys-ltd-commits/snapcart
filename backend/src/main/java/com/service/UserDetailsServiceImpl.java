package com.service;

import com.entity.User;
import com.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Autowired
    private com.repository.ModeratorRepository moderatorRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with email: " + email));

        // Resolve tenantId if not explicitly set on User
        if (user.getTenantId() == null
                && (user.getRole() == com.entity.Role.MODERATOR || user.getRole() == com.entity.Role.EMPLOYEE)) {
            moderatorRepository.findByUserId(user.getId()).ifPresent(m -> {
                user.setTenantId(m.getId());
            });
        }

        return UserDetailsImpl.build(user);
    }
}
