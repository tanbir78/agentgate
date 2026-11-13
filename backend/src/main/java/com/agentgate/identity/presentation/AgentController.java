package com.agentgate.identity.presentation;

import com.agentgate.identity.application.AgentDtos.CreateAgentRequest;
import com.agentgate.identity.application.AgentDtos.CreatedAgentResponse;
import com.agentgate.identity.application.AgentDtos.UpdateAgentRequest;
import com.agentgate.identity.application.AgentDtos.AgentResponse;
import com.agentgate.identity.application.AgentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/agents")
@PreAuthorize("hasRole('ADMIN')")
public class AgentController {
    private final AgentService service;
    public AgentController(AgentService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreatedAgentResponse create(@Valid @RequestBody CreateAgentRequest request) {
        return service.create(request);
    }

    @GetMapping
    public Page<AgentResponse> list(@PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return service.list(pageable);
    }

    @PutMapping("/{id}")
    public AgentResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateAgentRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable UUID id) { service.deactivate(id); }
}
