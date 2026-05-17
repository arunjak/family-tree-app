package com.familytree.person.dto;

import com.familytree.person.Gender;
import com.familytree.person.Person;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class PersonResponse {
    private Long id;
    private Long treeId;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private LocalDate dateOfDeath;
    private Gender gender;
    private String bio;
    private String photoUrl;
    private LocalDateTime createdAt;

    public static PersonResponse from(Person p) {
        return PersonResponse.builder()
                .id(p.getId())
                .treeId(p.getTree().getId())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .dateOfBirth(p.getDateOfBirth())
                .dateOfDeath(p.getDateOfDeath())
                .gender(p.getGender())
                .bio(p.getBio())
                .photoUrl(p.getPhotoUrl())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
