package com.familytree.relationship;

import com.familytree.relationship.dto.RelationshipRequest;
import com.familytree.relationship.dto.RelationshipResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/trees/{treeId}/relationships")
@RequiredArgsConstructor
public class RelationshipController {

    private final RelationshipService relationshipService;

    @GetMapping
    public ResponseEntity<List<RelationshipResponse>> getAllRelationships(
            @PathVariable Long treeId) {
        return ResponseEntity.ok(relationshipService.getAllRelationships(treeId));
    }

    @PostMapping
    public ResponseEntity<RelationshipResponse> createRelationship(
            @PathVariable Long treeId,
            @Valid @RequestBody RelationshipRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(relationshipService.createRelationship(treeId, request));
    }

    @DeleteMapping("/{relationshipId}")
    public ResponseEntity<Void> deleteRelationship(
            @PathVariable Long treeId,
            @PathVariable Long relationshipId) {
        relationshipService.deleteRelationship(treeId, relationshipId);
        return ResponseEntity.noContent().build();
    }
}
