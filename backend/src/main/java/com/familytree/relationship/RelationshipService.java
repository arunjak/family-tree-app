package com.familytree.relationship;

import com.familytree.person.Person;
import com.familytree.person.PersonService;
import com.familytree.relationship.dto.RelationshipRequest;
import com.familytree.relationship.dto.RelationshipResponse;
import com.familytree.tree.FamilyTree;
import com.familytree.tree.FamilyTreeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RelationshipService {

    private final RelationshipRepository relationshipRepository;
    private final FamilyTreeService treeService;
    private final PersonService personService;

    public List<RelationshipResponse> getAllRelationships(Long treeId) {
        treeService.getOwnedTree(treeId);
        return relationshipRepository.findAllByTreeId(treeId).stream()
                .map(RelationshipResponse::from)
                .toList();
    }

    public RelationshipResponse createRelationship(Long treeId, RelationshipRequest request) {
        FamilyTree tree = treeService.getOwnedTree(treeId);

        if (request.getPersonId().equals(request.getRelatedPersonId())) {
            throw new IllegalArgumentException("A person cannot have a relationship with themselves");
        }

        Person person = personService.getPersonEntity(treeId, request.getPersonId());
        Person related = personService.getPersonEntity(treeId, request.getRelatedPersonId());

        if (relationshipRepository.existsByPersonIdAndRelatedPersonIdAndRelationType(
                person.getId(), related.getId(), request.getRelationType())) {
            throw new IllegalArgumentException("This relationship already exists");
        }

        Relationship relationship = Relationship.builder()
                .tree(tree)
                .person(person)
                .relatedPerson(related)
                .relationType(request.getRelationType())
                .build();

        return RelationshipResponse.from(relationshipRepository.save(relationship));
    }

    public void deleteRelationship(Long treeId, Long relationshipId) {
        treeService.getOwnedTree(treeId);
        Relationship relationship = relationshipRepository.findById(relationshipId)
                .filter(r -> r.getTree().getId().equals(treeId))
                .orElseThrow(() -> new IllegalArgumentException("Relationship not found"));
        relationshipRepository.delete(relationship);
    }

    /** Used by GraphService — returns raw relationships for BFS traversal */
    public List<Relationship> getRawRelationships(Long treeId) {
        return relationshipRepository.findAllByTreeId(treeId);
    }
}
