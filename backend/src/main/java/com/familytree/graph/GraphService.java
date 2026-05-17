package com.familytree.graph;

import com.familytree.person.Person;
import com.familytree.person.PersonService;
import com.familytree.person.dto.PersonResponse;
import com.familytree.relationship.Relationship;
import com.familytree.relationship.RelationshipService;
import com.familytree.tree.FamilyTreeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class GraphService {

    private final RelationshipService relationshipService;
    private final PersonService personService;
    private final FamilyTreeService treeService;

    public PathResponse findPath(Long treeId, Long fromId, Long toId) {
        treeService.getOwnedTree(treeId); // verify ownership

        if (fromId.equals(toId)) {
            Person self = personService.getPersonEntity(treeId, fromId);
            return PathResponse.builder()
                    .found(true)
                    .path(List.of(PersonResponse.from(self)))
                    .description(self.getFirstName() + " is the same person!")
                    .build();
        }

        // Build adjacency map: personId → list of (neighborId, relationType label)
        Map<Long, List<GraphEdge>> adjacency = buildAdjacency(treeId);

        // BFS
        Map<Long, Long> parentMap = new LinkedHashMap<>();
        Map<Long, String> edgeLabel = new LinkedHashMap<>();
        Queue<Long> queue = new LinkedList<>();
        Set<Long> visited = new HashSet<>();

        queue.add(fromId);
        visited.add(fromId);
        parentMap.put(fromId, null);

        boolean found = false;
        while (!queue.isEmpty()) {
            Long current = queue.poll();
            if (current.equals(toId)) {
                found = true;
                break;
            }
            for (GraphEdge edge : adjacency.getOrDefault(current, List.of())) {
                if (!visited.contains(edge.neighborId())) {
                    visited.add(edge.neighborId());
                    parentMap.put(edge.neighborId(), current);
                    edgeLabel.put(edge.neighborId(), edge.label());
                    queue.add(edge.neighborId());
                }
            }
        }

        if (!found) {
            return PathResponse.builder()
                    .found(false)
                    .path(List.of())
                    .description("No relationship path found between these two people")
                    .build();
        }

        // Reconstruct path
        List<Long> pathIds = reconstructPath(parentMap, fromId, toId);
        List<PersonResponse> pathPersons = pathIds.stream()
                .map(id -> PersonResponse.from(personService.getPersonEntity(treeId, id)))
                .toList();

        String description = buildDescription(pathPersons, pathIds, edgeLabel);

        return PathResponse.builder()
                .found(true)
                .path(pathPersons)
                .description(description)
                .build();
    }

    // --- private helpers ---

    private Map<Long, List<GraphEdge>> buildAdjacency(Long treeId) {
        List<Relationship> relationships = relationshipService.getRawRelationships(treeId);
        Map<Long, List<GraphEdge>> adj = new HashMap<>();

        for (Relationship r : relationships) {
            Long a = r.getPerson().getId();
            Long b = r.getRelatedPerson().getId();
            String label = r.getRelationType().name();

            adj.computeIfAbsent(a, k -> new ArrayList<>()).add(new GraphEdge(b, label));
            adj.computeIfAbsent(b, k -> new ArrayList<>()).add(new GraphEdge(a, label));
        }
        return adj;
    }

    private List<Long> reconstructPath(Map<Long, Long> parentMap, Long fromId, Long toId) {
        LinkedList<Long> path = new LinkedList<>();
        Long current = toId;
        while (current != null) {
            path.addFirst(current);
            current = parentMap.get(current);
        }
        return path;
    }

    private String buildDescription(List<PersonResponse> persons,
                                    List<Long> ids,
                                    Map<Long, String> edgeLabel) {
        if (persons.size() == 2) {
            String label = edgeLabel.getOrDefault(ids.get(1), "RELATED");
            return persons.get(0).getFirstName() + " is " + label.toLowerCase()
                    + " of " + persons.get(1).getFirstName();
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < persons.size() - 1; i++) {
            String label = edgeLabel.getOrDefault(ids.get(i + 1), "→");
            sb.append(persons.get(i).getFirstName())
              .append(" --[").append(label).append("]--> ");
        }
        sb.append(persons.getLast().getFirstName());
        return sb.toString();
    }

    private record GraphEdge(Long neighborId, String label) {}
}
