package com.familytree.relationship.dto;

import com.familytree.relationship.Relationship;
import com.familytree.relationship.RelationType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RelationshipResponse {
    private Long id;
    private Long treeId;
    private Long personId;
    private String personName;
    private Long relatedPersonId;
    private String relatedPersonName;
    private RelationType relationType;

    public static RelationshipResponse from(Relationship r) {
        return RelationshipResponse.builder()
                .id(r.getId())
                .treeId(r.getTree().getId())
                .personId(r.getPerson().getId())
                .personName(r.getPerson().getFirstName() + " " + r.getPerson().getLastName())
                .relatedPersonId(r.getRelatedPerson().getId())
                .relatedPersonName(r.getRelatedPerson().getFirstName() + " "
                        + r.getRelatedPerson().getLastName())
                .relationType(r.getRelationType())
                .build();
    }
}
