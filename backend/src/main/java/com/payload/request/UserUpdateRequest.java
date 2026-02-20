package com.payload.request;

import com.entity.Role;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for updating user details.
 */
@Data
public class UserUpdateRequest {

    @Size(max = 15, message = "Name cannot exceed 15 characters")
    private String name;

    @Size(max = 15, message = "Mobile cannot exceed 15 characters")
    private String mobile;

    @Size(max = 10, message = "Gender cannot exceed 10 characters")
    private String gender;

    /**
     * New role to assign (Admin only).
     */
    private Role role;
}
