package com.familytree.tree;

import com.familytree.tree.dto.FamilyTreeRequest;
import com.familytree.tree.dto.FamilyTreeResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/trees")
@RequiredArgsConstructor
public class FamilyTreeController {

    private final FamilyTreeService treeService;

    @GetMapping
    public ResponseEntity<List<FamilyTreeResponse>> getAllTrees() {
        return ResponseEntity.ok(treeService.getAllTrees());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FamilyTreeResponse> getTree(@PathVariable Long id) {
        return ResponseEntity.ok(treeService.getTree(id));
    }

    @PostMapping
    public ResponseEntity<FamilyTreeResponse> createTree(
            @Valid @RequestBody FamilyTreeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(treeService.createTree(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FamilyTreeResponse> updateTree(
            @PathVariable Long id,
            @Valid @RequestBody FamilyTreeRequest request) {
        return ResponseEntity.ok(treeService.updateTree(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTree(@PathVariable Long id) {
        treeService.deleteTree(id);
        return ResponseEntity.noContent().build();
    }
}
