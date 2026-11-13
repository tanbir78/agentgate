package com.agentgate.registry.application;

import com.agentgate.registry.domain.ToolServer;
import com.agentgate.registry.domain.ToolTransport;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.net.URI;
import java.time.Instant;
import java.util.UUID;

@Service
public class ToolServerService {
    private final ToolServerStore repository;
    public ToolServerService(ToolServerStore repository) { this.repository = repository; }

    @Transactional
    public ToolServerResponse create(CreateToolServerRequest request) {
        if (repository.existsByName(request.name())) throw new ResponseStatusException(HttpStatus.CONFLICT, "Server name already exists");
        URI uri = URI.create(request.baseUrl());
        if (uri.getHost() == null || !("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Server URL must be HTTP(S)");
        }
        ToolServer server = repository.save(new ToolServer(request.name(), request.transportType(), request.baseUrl()));
        return response(server);
    }

    @Transactional(readOnly = true)
    public Page<ToolServerResponse> list(Pageable pageable) { return repository.findAll(pageable).map(this::response); }

    @Transactional
    public void deactivate(UUID id) {
        ToolServer server = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tool server not found"));
        server.deactivate();
    }

    private ToolServerResponse response(ToolServer server) {
        return new ToolServerResponse(server.getId(), server.getName(), server.getTransportType(),
                server.getBaseUrl(), server.isActive(), server.getCreatedAt());
    }

    public record CreateToolServerRequest(@NotBlank String name, @NotNull ToolTransport transportType, @NotBlank String baseUrl) { }
    public record ToolServerResponse(UUID id, String name, ToolTransport transportType, String baseUrl, boolean active, Instant createdAt) { }
}
