package com.example.aicodereview.controller;

import com.example.aicodereview.dto.RepoDto;
import com.example.aicodereview.service.RepoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/repos")
public class RepoController {

    private final RepoService repoService;

    public RepoController(RepoService repoService) {
        this.repoService = repoService;
    }

    @GetMapping
    public ResponseEntity<List<RepoDto>> getAllRepos() {
        return ResponseEntity.ok(repoService.getAllRepos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RepoDto> getRepoById(@PathVariable Long id) {
        return ResponseEntity.ok(repoService.getRepoById(id));
    }

    @PostMapping
    public ResponseEntity<RepoDto> createRepo(@Valid @RequestBody RepoDto repoDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repoService.createRepo(repoDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RepoDto> updateRepo(@PathVariable Long id, @Valid @RequestBody RepoDto repoDto) {
        return ResponseEntity.ok(repoService.updateRepo(id, repoDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRepo(@PathVariable Long id) {
        repoService.deleteRepo(id);
        return ResponseEntity.noContent().build();
    }
}
