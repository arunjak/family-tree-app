package com.familytree.relationship.dto;

import com.familytree.relationship.RelationType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RelationshipRequest {

    @NotNull(message = "personId is required")
    private Long personId;

    @NotNull(message = "relatedPersonId is required")
    private Long relatedPersonId;

    @NotNull(message = "relationType is required")
    private RelationType relationType;
}
