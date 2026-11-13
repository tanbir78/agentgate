package com.agentgate.registry.infrastructure;

import com.agentgate.registry.domain.ToolDefinition;
import com.agentgate.registry.domain.ToolTransport;
import com.agentgate.registry.application.ToolExecutor;
import tools.jackson.databind.JsonNode;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.Map;

/** Adapter translating a registered REST tool into an outbound HTTP request. */
@Component
public class RestToolAdapter implements ToolExecutor {
    private final RestClient.Builder restClientBuilder;
    public RestToolAdapter(RestClient.Builder restClientBuilder) { this.restClientBuilder = restClientBuilder; }

    @Override
    public ToolTransport supports() { return ToolTransport.REST; }

    @Override
    public JsonNode invoke(ToolDefinition tool, Map<String, Object> arguments) {
        if (tool.getTransportType() != ToolTransport.REST) {
            throw new IllegalArgumentException("Tool is not a REST endpoint");
        }
        HttpMethod method = HttpMethod.valueOf(tool.getHttpMethod());
        var request = restClientBuilder.build().method(method).uri(uriBuilder -> {
            UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(tool.getEndpointUrl());
            if (method == HttpMethod.GET || method == HttpMethod.DELETE) {
                arguments.forEach((key, value) -> builder.queryParam(key, value));
            }
            return builder.build().encode().toUri();
        });
        if (method == HttpMethod.GET || method == HttpMethod.DELETE) {
            return request.retrieve().body(JsonNode.class);
        }
        return request.body(arguments).retrieve().body(JsonNode.class);
    }
}
