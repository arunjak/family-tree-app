package com.familytree.tree;

import com.familytree.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FamilyTreeRepository extends JpaRepository<FamilyTree, Long> {
    List<FamilyTree> findAllByOwner(User owner);
    Optional<FamilyTree> findByIdAndOwner(Long id, User owner);
    boolean existsByIdAndOwner(Long id, User owner);
}
