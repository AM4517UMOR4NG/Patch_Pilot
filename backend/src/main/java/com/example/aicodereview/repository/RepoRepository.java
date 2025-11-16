package com.example.aicodereview.repository;

import com.example.aicodereview.entity.Repo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RepoRepository extends JpaRepository<Repo, Long> {
    Optional<Repo> findByName(String name);
    Optional<Repo> findByNameIgnoreCase(String name);
    boolean existsByName(String name);
    boolean existsByNameIgnoreCase(String name);
}
