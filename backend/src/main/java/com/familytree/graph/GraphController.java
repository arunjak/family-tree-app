package com.familytree.graph;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/trees/{treeId}")
@RequiredArgsConstructor
public class GraphController {

    private final GraphService graphService;

    @GetMapping("/find-path")
    public ResponseEntity<PathResponse> findPath(
            @PathVariable Long treeId,
            @RequestParam Long from,
            @RequestParam Long to) {
        return ResponseEntity.ok(graphService.findPath(treeId, from, to));
    }
}
