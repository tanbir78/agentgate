package com.agentgate.registry.presentation;

import com.agentgate.registry.application.ToolServerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tool-servers")
public class ToolServerController {
    private final ToolServerService service;
    public ToolServerController(ToolServerService service) { this.service = service; }

    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public ToolServerService.ToolServerResponse create(@Valid @RequestBody ToolServerService.CreateToolServerRequest request) {
        return service.create(request);
    }

    @GetMapping
    public Page<ToolServerService.ToolServerResponse> list(@PageableDefault(size = 20) Pageable pageable) {
        return service.list(pageable);
    }

    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable UUID id) { service.deactivate(id); }
}
