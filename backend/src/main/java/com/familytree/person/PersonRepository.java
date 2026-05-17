package com.familytree.person;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PersonRepository extends JpaRepository<Person, Long> {
    List<Person> findAllByTreeId(Long treeId);
    Optional<Person> findByIdAndTreeId(Long id, Long treeId);
    boolean existsByIdAndTreeId(Long id, Long treeId);
    void deleteAllByTreeId(Long treeId);
}
