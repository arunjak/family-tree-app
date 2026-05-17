package com.familytree.graph;

import com.familytree.person.dto.PersonResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PathResponse {
    private boolean found;
    private List<PersonResponse> path;
    private String description;
}
