package com.familytree.tree.dto;

import com.familytree.tree.FamilyTree;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FamilyTreeResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;

    public static FamilyTreeResponse from(FamilyTree tree) {
        return FamilyTreeResponse.builder()
                .id(tree.getId())
                .name(tree.getName())
                .description(tree.getDescription())
                .createdAt(tree.getCreatedAt())
                .build();
    }
}
