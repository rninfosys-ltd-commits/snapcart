package com.service;

import com.entity.Category;
import com.entity.Moderator;
import com.entity.Role;
import com.entity.User;
import com.payload.request.ModeratorRequest;
import com.payload.request.SignupRequest;
import com.payload.response.ModeratorResponse;
import com.payload.response.EmployeeResponse;
import com.repository.ModeratorRepository;
import com.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Service layer for Moderator operations.
 * 
 * Handles business logic for assigning, updating, and managing moderators.
 */
@Service
public class ModeratorService {

    @Autowired
    private ModeratorRepository moderatorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private EmailService emailService;

    /**
     * Assign moderator role and permissions to a user.
     * 
     * @param request           ModeratorRequest with user ID and permissions
     * @param assignedByAdminId ID of the admin performing this action
     * @return ModeratorResponse with created moderator data
     */
    @Transactional
    public ModeratorResponse assignModerator(ModeratorRequest request, Long assignedByAdminId) {
        // Validate user ID is not null
        Long userId = request.getUserId();
        if (userId == null) {
            throw new IllegalArgumentException("User ID must not be null");
        }

        // Check if user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Check if already a moderator
        if (moderatorRepository.existsByUserId(userId)) {
            throw new RuntimeException("User is already a moderator");
        }

        // Update user role to MODERATOR
        user.setRole(Role.MODERATOR);
        userRepository.save(user);

        // Create Moderator entity
        Moderator moderator = new Moderator();
        moderator.setUser(user);
        moderator.setCategories(request.getCategories() != null ? request.getCategories() : new HashSet<>());
        moderator.setCanDeleteReviews(request.getCanDeleteReviews() != null ? request.getCanDeleteReviews() : false);
        moderator.setCanBanUsers(request.getCanBanUsers() != null ? request.getCanBanUsers() : false);
        moderator.setCanEditProducts(request.getCanEditProducts() != null ? request.getCanEditProducts() : false);
        moderator.setCanManageOrders(request.getCanManageOrders() != null ? request.getCanManageOrders() : false);
        moderator.setModerationLevel(request.getModerationLevel() != null ? request.getModerationLevel() : 1);
        moderator.setAssignedBy(assignedByAdminId);
        moderator.setNotes(request.getNotes());
        moderator.setIsActive(true);

        Moderator saved = moderatorRepository.save(moderator);
        return toResponse(saved);
    }

    /**
     * Update moderator permissions.
     * 
     * @param moderatorId ID of the moderator to update
     * @param request     Updated permissions
     * @return Updated ModeratorResponse
     */
    @Transactional
    public ModeratorResponse updateModerator(Long moderatorId, ModeratorRequest request) {
        if (moderatorId == null) {
            throw new IllegalArgumentException("Moderator ID must not be null");
        }
        Moderator moderator = moderatorRepository.findById(moderatorId)
                .orElseThrow(() -> new RuntimeException("Moderator not found with ID: " + moderatorId));

        if (request.getCategories() != null) {
            moderator.setCategories(request.getCategories());
        }
        if (request.getCanDeleteReviews() != null) {
            moderator.setCanDeleteReviews(request.getCanDeleteReviews());
        }
        if (request.getCanBanUsers() != null) {
            moderator.setCanBanUsers(request.getCanBanUsers());
        }
        if (request.getCanEditProducts() != null) {
            moderator.setCanEditProducts(request.getCanEditProducts());
        }
        if (request.getCanManageOrders() != null) {
            moderator.setCanManageOrders(request.getCanManageOrders());
        }
        if (request.getModerationLevel() != null) {
            moderator.setModerationLevel(request.getModerationLevel());
        }
        if (request.getNotes() != null) {
            moderator.setNotes(request.getNotes());
        }

        Moderator saved = moderatorRepository.save(Objects.requireNonNull(moderator));
        return toResponse(saved);
    }

    /**
     * Update moderator's own brand profile and KYC info.
     */
    @Transactional
    public ModeratorResponse updateModeratorProfile(Long userId, ModeratorRequest request) {
        Moderator moderator = moderatorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Moderator not found for user ID: " + userId));

        if (request.getBrandName() != null)
            moderator.setBrandName(request.getBrandName());
        if (request.getBrandDescription() != null)
            moderator.setBrandDescription(request.getBrandDescription());
        if (request.getBrandLogoUrl() != null)
            moderator.setBrandLogoUrl(request.getBrandLogoUrl());
        if (request.getBankAccountNumber() != null)
            moderator.setBankAccountNumber(request.getBankAccountNumber());
        if (request.getIfscCode() != null)
            moderator.setIfscCode(request.getIfscCode());
        if (request.getPanNumber() != null)
            moderator.setPanNumber(request.getPanNumber());

        if (request.getWarehouseCity() != null)
            moderator.setWarehouseCity(request.getWarehouseCity());
        if (request.getWarehouseState() != null)
            moderator.setWarehouseState(request.getWarehouseState());
        if (request.getWarehousePincode() != null)
            moderator.setWarehousePincode(request.getWarehousePincode());

        if (request.getSignatureUrl() != null)
            moderator.setSignatureUrl(request.getSignatureUrl());

        if (request.getIsContractSigned() != null && request.getIsContractSigned()) {
            moderator.setIsContractSigned(true);
            if (moderator.getContractSignedAt() == null) {
                moderator.setContractSignedAt(java.time.LocalDateTime.now());
            }
        }

        if (request.getWarehouseCity() != null)
            moderator.setWarehouseCity(request.getWarehouseCity());
        if (request.getWarehouseState() != null)
            moderator.setWarehouseState(request.getWarehouseState());
        if (request.getWarehousePincode() != null)
            moderator.setWarehousePincode(request.getWarehousePincode());

        if (request.getSignatureUrl() != null)
            moderator.setSignatureUrl(request.getSignatureUrl());

        if (request.getIsContractSigned() != null && request.getIsContractSigned()) {
            moderator.setIsContractSigned(true);
            if (moderator.getContractSignedAt() == null) {
                moderator.setContractSignedAt(java.time.LocalDateTime.now());
            }
        }

        // Any profile update drops brand back to inactive or keeps pending until
        // re-approved?
        // For now, let's just save. Prompt says "must complete details... before brand
        // becomes active".

        return toResponse(moderatorRepository.save(moderator));
    }

    /**
     * Admin approves/rejects KYC and activates brand.
     */
    @Transactional
    public ModeratorResponse approveBrand(Long moderatorId, String status, Boolean active) {
        Moderator moderator = moderatorRepository.findById(moderatorId)
                .orElseThrow(() -> new RuntimeException("Moderator not found ID: " + moderatorId));

        if (status != null)
            moderator.setKycStatus(status);
        if (active != null)
            moderator.setIsBrandActive(active);

        return toResponse(moderatorRepository.save(moderator));
    }

    /**
     * Revoke moderator status (deactivate).
     * 
     * @param moderatorId ID of the moderator to revoke
     */
    @Transactional
    public void revokeModerator(Long moderatorId) {
        Moderator moderator = moderatorRepository.findById(Objects.requireNonNull(moderatorId))
                .orElseThrow(() -> new RuntimeException("Moderator not found with ID: " + moderatorId));

        // Deactivate moderator
        moderator.setIsActive(false);
        moderatorRepository.save(moderator);

        // Optionally revert user role to USER
        User user = moderator.getUser();
        user.setRole(Role.USER);
        userRepository.save(user);
    }

    /**
     * Reactivate a previously deactivated moderator.
     * 
     * @param moderatorId ID of the moderator to reactivate
     * @return Reactivated ModeratorResponse
     */
    @Transactional
    public ModeratorResponse reactivateModerator(Long moderatorId) {
        Moderator moderator = moderatorRepository.findById(Objects.requireNonNull(moderatorId))
                .orElseThrow(() -> new RuntimeException("Moderator not found with ID: " + moderatorId));

        moderator.setIsActive(true);
        moderatorRepository.save(moderator);

        // Restore user role to MODERATOR
        User user = moderator.getUser();
        user.setRole(Role.MODERATOR);
        userRepository.save(user);

        return toResponse(moderator);
    }

    /**
     * Get moderator by ID.
     */
    public ModeratorResponse getModeratorById(Long moderatorId) {
        Moderator moderator = moderatorRepository.findById(Objects.requireNonNull(moderatorId))
                .orElseThrow(() -> new RuntimeException("Moderator not found with ID: " + moderatorId));
        return toResponse(moderator);
    }

    /**
     * Get moderator by user ID.
     */
    public ModeratorResponse getModeratorByUserId(Long userId) {
        Moderator moderator = moderatorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Moderator not found for user ID: " + userId));
        return toResponse(moderator);
    }

    /**
     * Get all active moderators.
     */
    public List<ModeratorResponse> getAllActiveModerators() {
        return moderatorRepository.findByIsActiveTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all moderators (active and inactive).
     */
    public List<ModeratorResponse> getAllModerators() {
        return moderatorRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get moderators for a specific category.
     */
    public List<ModeratorResponse> getModeratorsByCategory(Category category) {
        return moderatorRepository.findByCategoriesContaining(category)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Check if moderator has a specific permission.
     * 
     * @param userId     User ID of the moderator
     * @param permission Permission to check (e.g., "DELETE_REVIEWS", "BAN_USERS")
     * @return true if moderator has the permission
     */
    public boolean hasPermission(Long userId, String permission) {
        Moderator moderator = moderatorRepository.findByUserId(userId).orElse(null);

        if (moderator == null || !moderator.getIsActive()) {
            return false;
        }

        return switch (permission.toUpperCase()) {
            case "DELETE_REVIEWS" -> moderator.getCanDeleteReviews();
            case "BAN_USERS" -> moderator.getCanBanUsers();
            case "EDIT_PRODUCTS" -> moderator.getCanEditProducts();
            case "MANAGE_ORDERS" -> moderator.getCanManageOrders();
            default -> false;
        };
    }

    /**
     * Check if moderator can manage a specific category.
     */
    public boolean canManageCategory(Long userId, Category category) {
        Moderator moderator = moderatorRepository.findByUserId(userId).orElse(null);

        if (moderator == null || !moderator.getIsActive()) {
            return false;
        }

        return moderator.getCategories().isEmpty() || moderator.getCategories().contains(category);
    }

    /**
     * Create a new employee for a moderator.
     */
    @Transactional
    public EmployeeResponse createEmployee(SignupRequest request, Long moderatorId) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User employee = new User();
        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        employee.setPassword(encoder.encode(request.getPassword()));
        employee.setMobile(request.getMobile());
        employee.setGender(request.getGender());
        employee.setRole(Role.EMPLOYEE);
        employee.setParentId(moderatorId);

        User saved = userRepository.save(employee);

        // Fetch moderator name
        String moderatorName = userRepository.findById(moderatorId)
                .map(User::getName)
                .orElse("Your Manager");

        emailService.sendEmployeeWelcomeEmail(saved.getEmail(), saved.getName(), request.getPassword(), moderatorName);

        return toEmployeeResponse(saved);
    }

    /**
     * Get all employees for a specific moderator.
     */
    public List<EmployeeResponse> getEmployeesByModerator(Long moderatorId) {
        return userRepository.findByParentId(moderatorId)
                .stream()
                .map(this::toEmployeeResponse)
                .collect(Collectors.toList());
    }

    private EmployeeResponse toEmployeeResponse(User user) {
        return new EmployeeResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getMobile(),
                user.getGender(),
                user.getRole(),
                user.getParentId());
    }

    /**
     * Convert Moderator entity to response DTO.
     */
    private ModeratorResponse toResponse(Moderator moderator) {
        User user = moderator.getUser();
        return ModeratorResponse.builder()
                .id(moderator.getId())
                .userId(user.getId())
                .userName(user.getName())
                .userEmail(user.getEmail())
                .categories(moderator.getCategories())
                .canDeleteReviews(moderator.getCanDeleteReviews())
                .canBanUsers(moderator.getCanBanUsers())
                .canEditProducts(moderator.getCanEditProducts())
                .canManageOrders(moderator.getCanManageOrders())
                .moderationLevel(moderator.getModerationLevel())
                .assignedAt(moderator.getAssignedAt())
                .assignedBy(moderator.getAssignedBy())
                .isActive(moderator.getIsActive())
                .notes(moderator.getNotes())
                .brandName(moderator.getBrandName())
                .brandDescription(moderator.getBrandDescription())
                .brandLogoUrl(moderator.getBrandLogoUrl())
                .bankAccountNumber(moderator.getBankAccountNumber())
                .ifscCode(moderator.getIfscCode())
                .panNumber(moderator.getPanNumber())
                .kycStatus(moderator.getKycStatus())
                .isBrandActive(moderator.getIsBrandActive())
                .warehouseCity(moderator.getWarehouseCity())
                .warehouseState(moderator.getWarehouseState())
                .warehousePincode(moderator.getWarehousePincode())
                .isContractSigned(moderator.getIsContractSigned())
                .contractSignedAt(moderator.getContractSignedAt())
                .signatureUrl(moderator.getSignatureUrl())
                .build();
    }
}
