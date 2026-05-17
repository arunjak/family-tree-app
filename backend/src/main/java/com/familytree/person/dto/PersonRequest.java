package com.familytree.person.dto;

import com.familytree.person.Gender;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

@Data
public class PersonRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;
    private LocalDate dateOfBirth;
    private LocalDate dateOfDeath;
    private Gender gender;
    private String bio;
}
