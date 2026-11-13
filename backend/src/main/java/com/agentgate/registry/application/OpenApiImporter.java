package com.agentgate.registry.application;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.dataformat.yaml.YAMLMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class OpenApiImporter {
    private static final Pattern SAFE_NAME = Pattern.compile("[^a-zA-Z0-9_]+|^_+|_+$");
    private final ToolService toolService;
    private final JsonMapper jsonMapper;
    private final YAMLMapper yamlMapper = YAMLMapper.builder().build();

    public OpenApiImporter(ToolService toolService, JsonMapper jsonMapper) {
        this.toolService = toolService;
        this.jsonMapper = jsonMapper;
    }

    public List<ToolDtos.ToolResponse> importFile(MultipartFile file, String ownerTeam) {
        try {
            byte[] bytes = file.getBytes();
            JsonNode document = parse(bytes);
            if (!document.path("openapi").asText().startsWith("3.")) {
                throw new IllegalArgumentException("Only OpenAPI 3.x documents are supported");
            }
            String baseUrl = document.path("servers").path(0).path("url").asText("");
            if (baseUrl.isBlank()) throw new IllegalArgumentException("OpenAPI document must define servers[0].url");
            JsonNode paths = document.path("paths");
            if (!paths.isObject()) throw new IllegalArgumentException("OpenAPI paths are missing");
            List<ToolDtos.ToolResponse> imported = new ArrayList<>();
            Iterator<Map.Entry<String, JsonNode>> pathIterator = paths.properties().iterator();
            while (pathIterator.hasNext()) {
                Map.Entry<String, JsonNode> pathEntry = pathIterator.next();
                Iterator<Map.Entry<String, JsonNode>> operationIterator = pathEntry.getValue().properties().iterator();
                while (operationIterator.hasNext()) {
                    Map.Entry<String, JsonNode> operationEntry = operationIterator.next();
                    String method = operationEntry.getKey().toUpperCase(Locale.ROOT);
                    if (!List.of("GET", "POST", "PUT", "PATCH", "DELETE").contains(method)) continue;
                    JsonNode operation = operationEntry.getValue();
                    String rawName = operation.path("operationId").asText(method.toLowerCase(Locale.ROOT) + "_" + pathEntry.getKey());
                    String name = SAFE_NAME.matcher(rawName).replaceAll("_").toLowerCase(Locale.ROOT);
                    String description = operation.path("summary").asText(operation.path("description").asText("Imported from OpenAPI"));
                    JsonNode schemaNode = operation.path("requestBody").path("content").path("application/json").path("schema");
                    String schema = schemaNode.isObject() ? jsonMapper.writeValueAsString(schemaNode) : "{\"type\":\"object\"}";
                    imported.add(toolService.saveImported(name, description, ownerTeam,
                            baseUrl.replaceAll("/$", "") + pathEntry.getKey(), method, schema));
                }
            }
            return imported;
        } catch (Exception ex) {
            throw new IllegalArgumentException("Unable to import OpenAPI document: " + ex.getMessage(), ex);
        }
    }

    private JsonNode parse(byte[] bytes) throws Exception {
        try { return jsonMapper.readTree(bytes); }
        catch (Exception ignored) { return yamlMapper.readTree(bytes); }
    }
}
