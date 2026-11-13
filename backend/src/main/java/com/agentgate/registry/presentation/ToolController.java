package com.agentgate.registry.presentation;

import com.agentgate.registry.application.OpenApiImporter;
import com.agentgate.registry.application.ToolDtos.*;
import com.agentgate.registry.application.ToolService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.constraints.NotBlank;
import org.springframework.validation.annotation.Validated;
import java.util.Map;
import java.util.UUID;

@RestController
@Validated
@RequestMapping("/api/v1/tools")
public class ToolController {
    private final ToolService toolService;
    private final OpenApiImporter openApiImporter;

    public ToolController(ToolService toolService, OpenApiImporter openApiImporter) {
        this.toolService = toolService; this.openApiImporter = openApiImporter;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ToolResponse create(@Valid @RequestBody CreateToolRequest request) { return toolService.create(request); }

    @GetMapping
    public Page<ToolResponse> list(@RequestParam(defaultValue = "false") boolean activeOnly,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return toolService.list(pageable, activeOnly);
    }

    @PutMapping("/{id}")
    public ToolResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateToolRequest request) {
        return toolService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable UUID id) { toolService.deactivate(id); }

    @PostMapping(value = "/import/openapi", consumes = "multipart/form-data")
    public Map<String, Object> importOpenApi(@RequestPart("file") MultipartFile file,
                                             @RequestParam @NotBlank String ownerTeam) {
        return Map.of("imported", openApiImporter.importFile(file, ownerTeam));
    }


}
