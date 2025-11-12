package com.example.aicodereview.repository;

import com.example.aicodereview.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPullRequestId(Long pullRequestId);
}
