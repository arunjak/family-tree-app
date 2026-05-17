package com.familytree.person;

import com.familytree.person.dto.PersonRequest;
import com.familytree.person.dto.PersonResponse;
import com.familytree.tree.FamilyTree;
import com.familytree.common.FileStorageService;
import com.familytree.relationship.RelationshipRepository;
import com.familytree.tree.FamilyTreeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PersonService {

    private final PersonRepository personRepository;
    private final FamilyTreeService treeService;
    private final RelationshipRepository relationshipRepository;
    private final FileStorageService fileStorageService;

    public List<PersonResponse> getAllPersons(Long treeId) {
        treeService.getOwnedTree(treeId); // verify ownership
        return personRepository.findAllByTreeId(treeId).stream()
                .map(PersonResponse::from)
                .toList();
    }

    public PersonResponse getPerson(Long treeId, Long personId) {
        treeService.getOwnedTree(treeId);
        return personRepository.findByIdAndTreeId(personId, treeId)
                .map(PersonResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("Person not found"));
    }

    public PersonResponse createPerson(Long treeId, PersonRequest request) {
        FamilyTree tree = treeService.getOwnedTree(treeId);
        Person person = Person.builder()
                .tree(tree)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .dateOfBirth(request.getDateOfBirth())
                .dateOfDeath(request.getDateOfDeath())
                .gender(request.getGender())
                .bio(request.getBio())
                .build();
        return PersonResponse.from(personRepository.save(person));
    }

    public PersonResponse updatePerson(Long treeId, Long personId, PersonRequest request) {
        treeService.getOwnedTree(treeId);
        Person person = personRepository.findByIdAndTreeId(personId, treeId)
                .orElseThrow(() -> new IllegalArgumentException("Person not found"));

        person.setFirstName(request.getFirstName());
        person.setLastName(request.getLastName());
        person.setDateOfBirth(request.getDateOfBirth());
        person.setDateOfDeath(request.getDateOfDeath());
        person.setGender(request.getGender());
        person.setBio(request.getBio());

        return PersonResponse.from(personRepository.save(person));
    }

    @Transactional
    public void deletePerson(Long treeId, Long personId) {
        treeService.getOwnedTree(treeId);
        Person person = personRepository.findByIdAndTreeId(personId, treeId)
                .orElseThrow(() -> new IllegalArgumentException("Person not found"));
        // Delete all relationships first to avoid FK constraint violations
        relationshipRepository.deleteAllByPersonId(personId);
        personRepository.delete(person);
    }

    /** Used by other services — skips ownership re-check for internal calls */
    public Person getPersonEntity(Long treeId, Long personId) {
        return personRepository.findByIdAndTreeId(personId, treeId)
                .orElseThrow(() -> new IllegalArgumentException("Person not found in this tree"));
    }

    @Transactional
    public PersonResponse uploadPhoto(Long treeId, Long personId, MultipartFile file) {
        treeService.getOwnedTree(treeId);
        Person person = personRepository.findByIdAndTreeId(personId, treeId)
                .orElseThrow(() -> new IllegalArgumentException("Person not found"));

        // Delete old photo if present
        if (person.getPhotoUrl() != null) {
            fileStorageService.delete(fileStorageService.filenameFromUrl(person.getPhotoUrl()));
        }

        String filename = fileStorageService.store(file, personId);
        person.setPhotoUrl("/api/files/" + filename);
        return PersonResponse.from(personRepository.save(person));
    }

    @Transactional
    public PersonResponse deletePhoto(Long treeId, Long personId) {
        treeService.getOwnedTree(treeId);
        Person person = personRepository.findByIdAndTreeId(personId, treeId)
                .orElseThrow(() -> new IllegalArgumentException("Person not found"));
        if (person.getPhotoUrl() != null) {
            fileStorageService.delete(fileStorageService.filenameFromUrl(person.getPhotoUrl()));
            person.setPhotoUrl(null);
        }
        return PersonResponse.from(personRepository.save(person));
    }
}
