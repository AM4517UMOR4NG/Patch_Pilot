package com.example.aicodereview.service;

import com.example.aicodereview.dto.RepoDto;
import com.example.aicodereview.entity.Repo;
import com.example.aicodereview.repository.RepoRepository;
import com.example.aicodereview.util.RepoNameUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RepoService {

    private final RepoRepository repoRepository;

    public RepoService(RepoRepository repoRepository) {
        this.repoRepository = repoRepository;
    }

    public List<RepoDto> getAllRepos() {
        return repoRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public RepoDto getRepoById(Long id) {
        Repo repo = repoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Repository not found"));
        return convertToDto(repo);
    }

    public RepoDto createRepo(RepoDto repoDto) {
        String normalizedName = RepoNameUtils.normalize(repoDto.getName(), repoDto.getCloneUrl());

        if (repoRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new RuntimeException("Repository with this name already exists");
        }
        
        Repo repo = new Repo();
        repo.setName(normalizedName);
        repo.setCloneUrl(ensureCloneUrl(repoDto.getCloneUrl(), normalizedName));
        repo.setDefaultBranch(repoDto.getDefaultBranch());
        repo.setWebhookSecret(repoDto.getWebhookSecret());
        
        repo = repoRepository.save(repo);
        return convertToDto(repo);
    }

    public RepoDto updateRepo(Long id, RepoDto repoDto) {
        Repo repo = repoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Repository not found"));

        String normalizedName = RepoNameUtils.normalize(repoDto.getName(), repoDto.getCloneUrl());
        if (!repo.getName().equalsIgnoreCase(normalizedName)
                && repoRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new RuntimeException("Repository with this name already exists");
        }

        repo.setName(normalizedName);
        repo.setCloneUrl(ensureCloneUrl(repoDto.getCloneUrl(), normalizedName));
        repo.setDefaultBranch(repoDto.getDefaultBranch());
        repo.setWebhookSecret(repoDto.getWebhookSecret());
        
        repo = repoRepository.save(repo);
        return convertToDto(repo);
    }

    public void deleteRepo(Long id) {
        if (!repoRepository.existsById(id)) {
            throw new RuntimeException("Repository not found");
        }
        repoRepository.deleteById(id);
    }

    private RepoDto convertToDto(Repo repo) {
        RepoDto dto = new RepoDto();
        dto.setId(repo.getId());
        dto.setName(repo.getName());
        dto.setCloneUrl(repo.getCloneUrl());
        dto.setDefaultBranch(repo.getDefaultBranch());
        dto.setWebhookSecret(repo.getWebhookSecret());
        dto.setCreatedAt(repo.getCreatedAt());
        dto.setUpdatedAt(repo.getUpdatedAt());
        return dto;
    }

    private String ensureCloneUrl(String cloneUrl, String normalizedName) {
        if (cloneUrl == null || cloneUrl.trim().isEmpty()) {
            return "https://github.com/" + normalizedName + ".git";
        }
        return cloneUrl.trim();
    }
}
