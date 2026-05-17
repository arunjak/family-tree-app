package com.familytree.tree;

import com.familytree.common.AuthUtils;
import com.familytree.tree.dto.FamilyTreeRequest;
import com.familytree.tree.dto.FamilyTreeResponse;
import com.familytree.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FamilyTreeService {

    private final FamilyTreeRepository treeRepository;
    private final AuthUtils authUtils;

    public List<FamilyTreeResponse> getAllTrees() {
        User user = authUtils.currentUser();
        return treeRepository.findAllByOwner(user).stream()
                .map(FamilyTreeResponse::from)
                .toList();
    }

    public FamilyTreeResponse getTree(Long id) {
        User user = authUtils.currentUser();
        return treeRepository.findByIdAndOwner(id, user)
                .map(FamilyTreeResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("Tree not found"));
    }

    public FamilyTreeResponse createTree(FamilyTreeRequest request) {
        User user = authUtils.currentUser();
        FamilyTree tree = FamilyTree.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(user)
                .build();
        return FamilyTreeResponse.from(treeRepository.save(tree));
    }

    public FamilyTreeResponse updateTree(Long id, FamilyTreeRequest request) {
        User user = authUtils.currentUser();
        FamilyTree tree = treeRepository.findByIdAndOwner(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Tree not found"));
        tree.setName(request.getName());
        tree.setDescription(request.getDescription());
        return FamilyTreeResponse.from(treeRepository.save(tree));
    }

    public void deleteTree(Long id) {
        User user = authUtils.currentUser();
        FamilyTree tree = treeRepository.findByIdAndOwner(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Tree not found"));
        treeRepository.delete(tree);
    }

    /** Used by other services to validate ownership without exposing entity */
    public FamilyTree getOwnedTree(Long treeId) {
        User user = authUtils.currentUser();
        return treeRepository.findByIdAndOwner(treeId, user)
                .orElseThrow(() -> new IllegalStateException("Access denied or tree not found"));
    }
}
