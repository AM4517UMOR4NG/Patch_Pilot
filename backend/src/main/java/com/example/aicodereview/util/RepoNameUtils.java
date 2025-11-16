package com.example.aicodereview.util;

public final class RepoNameUtils {

    private RepoNameUtils() {
    }

    public static String normalize(String name) {
        return normalize(name, null);
    }

    public static String normalize(String name, String cloneUrl) {
        String candidate = extractCandidate(name, cloneUrl);

        // Strip query/hash and trailing slashes
        candidate = candidate.replaceAll("[#?].*$", "");
        candidate = candidate.replaceAll("/+$", "");

        // Remove common GitHub prefixes and SSH form
        candidate = candidate.replaceFirst("^https?://(www\\.)?github\\.com/", "");
        candidate = candidate.replaceFirst("^git@github\\.com:", "");
        candidate = candidate.replaceFirst("^www\\.?github\\.com/", "");
        candidate = candidate.replaceFirst("^github\\.com/", "");

        // Remove .git suffix
        candidate = candidate.replaceFirst("\\.git$", "");

        // Ensure only owner/repo (ignore extra path segments like /tree/main)
        if (candidate.contains("/")) {
            String[] parts = candidate.split("/");
            if (parts.length >= 2) {
                candidate = parts[0] + "/" + parts[1];
            }
        }

        if (!candidate.contains("/") || candidate.startsWith("/") || candidate.endsWith("/")) {
            throw new IllegalArgumentException("Repository name must be in the format owner/repository");
        }

        return candidate;
    }

    private static String extractCandidate(String name, String cloneUrl) {
        String candidate = name != null ? name.trim() : "";

        if (candidate.isEmpty()) {
            candidate = extractFromCloneUrl(cloneUrl);
        }

        if (!candidate.contains("/") && cloneUrl != null) {
            String fromCloneUrl = extractFromCloneUrl(cloneUrl);
            if (fromCloneUrl != null) {
                candidate = fromCloneUrl;
            }
        }

        if (candidate == null || candidate.trim().isEmpty()) {
            throw new IllegalArgumentException("Repository name cannot be empty");
        }

        return candidate.trim();
    }

    private static String extractFromCloneUrl(String cloneUrl) {
        if (cloneUrl == null || cloneUrl.trim().isEmpty()) {
            return null;
        }

        String s = cloneUrl.trim();
        // strip query/hash and trailing slashes
        s = s.replaceAll("[#?].*$", "");
        s = s.replaceAll("/+$", "");
        // remove .git
        s = s.replaceFirst("\\.git$", "");
        // remove prefixes
        s = s.replaceFirst("^https?://(www\\.)?github\\.com/", "");
        s = s.replaceFirst("^git@github\\.com:", "");
        s = s.replaceFirst("^www\\.?github\\.com/", "");
        s = s.replaceFirst("^github\\.com/", "");

        if (s.contains("/")) {
            String[] parts = s.split("/");
            if (parts.length >= 2) {
                return parts[0] + "/" + parts[1];
            }
        }
        return s;
    }
}
