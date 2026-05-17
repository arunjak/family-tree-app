package com.familytree.tree.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FamilyTreeRequest {

    @NotBlank(message = "Tree name is required")
    private String name;

    private String description;
}
