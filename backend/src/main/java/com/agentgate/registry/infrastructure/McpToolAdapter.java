package com.agentgate.registry.infrastructure;

import com.agentgate.registry.application.ToolExecutor;
import com.agentgate.registry.domain.ToolDefinition;
import com.agentgate.registry.domain.ToolTransport;
import jakarta.annotation.PreDestroy;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import io.modelcontextprotocol.client.McpClient;
import io.modelcontextprotocol.client.McpSyncClient;
import io.modelcontextprotocol.client.transport.HttpClientStreamableHttpTransport;
import io.modelcontextprotocol.spec.McpSchema;
import org.springframework.stereotype.Component;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/** Strategy adapter using a cached official MCP Java SDK client per downstream server endpoint. */
@Component
public class McpToolAdapter implements ToolExecutor {
    private final JsonMapper mapper;
    private final ConcurrentMap<String, McpSyncClient> clients = new ConcurrentHashMap<>();

    public McpToolAdapter(JsonMapper mapper) { this.mapper = mapper; }

    @Override public ToolTransport supports() { return ToolTransport.MCP; }

    @Override
    public JsonNode invoke(ToolDefinition tool, Map<String, Object> arguments) {
        McpSyncClient client = clients.computeIfAbsent(tool.getEndpointUrl(), this::createInitializedClient);
        McpSchema.CallToolRequest request = McpSchema.CallToolRequest.builder(tool.getName())
                .arguments(arguments)
                .build();
        McpSchema.CallToolResult result = client.callTool(request);
        return mapper.valueToTree(result);
    }

    private McpSyncClient createInitializedClient(String endpoint) {
        var transport = HttpClientStreamableHttpTransport.builder(endpoint)
                .endpoint("/mcp")
                .customizeClient(clientBuilder -> clientBuilder.connectTimeout(Duration.ofSeconds(3)))
                .maxResponseSize(1_048_576)
                .build();
        McpSyncClient client = McpClient.sync(transport)
                .requestTimeout(Duration.ofSeconds(10))
                .build();
        client.initialize();
        return client;
    }

    @PreDestroy
    void closeClients() {
        clients.values().forEach(McpSyncClient::closeGracefully);
        clients.clear();
    }
}
