package com.familytree.person;

import com.familytree.person.dto.PersonRequest;
import com.familytree.person.dto.PersonResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/trees/{treeId}/persons")
@RequiredArgsConstructor
public class PersonController {

    private final PersonService personService;

    @GetMapping
    public ResponseEntity<List<PersonResponse>> getAllPersons(@PathVariable Long treeId) {
        return ResponseEntity.ok(personService.getAllPersons(treeId));
    }

    @GetMapping("/{personId}")
    public ResponseEntity<PersonResponse> getPerson(
            @PathVariable Long treeId,
            @PathVariable Long personId) {
        return ResponseEntity.ok(personService.getPerson(treeId, personId));
    }

    @PostMapping
    public ResponseEntity<PersonResponse> createPerson(
            @PathVariable Long treeId,
            @Valid @RequestBody PersonRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(personService.createPerson(treeId, request));
    }

    @PutMapping("/{personId}")
    public ResponseEntity<PersonResponse> updatePerson(
            @PathVariable Long treeId,
            @PathVariable Long personId,
            @Valid @RequestBody PersonRequest request) {
        return ResponseEntity.ok(personService.updatePerson(treeId, personId, request));
    }

    @DeleteMapping("/{personId}")
    public ResponseEntity<Void> deletePerson(
            @PathVariable Long treeId,
            @PathVariable Long personId) {
        personService.deletePerson(treeId, personId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{personId}/photo")
    public ResponseEntity<PersonResponse> uploadPhoto(
            @PathVariable Long treeId,
            @PathVariable Long personId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(personService.uploadPhoto(treeId, personId, file));
    }

    @DeleteMapping("/{personId}/photo")
    public ResponseEntity<PersonResponse> deletePhoto(
            @PathVariable Long treeId,
            @PathVariable Long personId) {
        return ResponseEntity.ok(personService.deletePhoto(treeId, personId));
    }
}
