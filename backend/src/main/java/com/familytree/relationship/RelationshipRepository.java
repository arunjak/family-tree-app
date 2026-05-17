package com.familytree.relationship;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RelationshipRepository extends JpaRepository<Relationship, Long> {

    List<Relationship> findAllByTreeId(Long treeId);

    @Query("""
        SELECT r FROM Relationship r
        WHERE r.tree.id = :treeId
          AND (r.person.id = :personId OR r.relatedPerson.id = :personId)
    """)
    List<Relationship> findAllByTreeIdAndPersonId(
            @Param("treeId") Long treeId,
            @Param("personId") Long personId);

    boolean existsByPersonIdAndRelatedPersonIdAndRelationType(
            Long personId, Long relatedPersonId, RelationType relationType);

    void deleteAllByTreeId(Long treeId);

    /** Delete ALL relationships for a person before deleting the person */
    @Modifying
    @Query("DELETE FROM Relationship r WHERE r.person.id = :personId OR r.relatedPerson.id = :personId")
    void deleteAllByPersonId(@Param("personId") Long personId);
}
