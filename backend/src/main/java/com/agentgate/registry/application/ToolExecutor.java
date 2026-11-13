package com.agentgate.registry.application;

import com.agentgate.registry.domain.ToolDefinition;
import com.agentgate.registry.domain.ToolTransport;
import tools.jackson.databind.JsonNode;
import java.util.Map;

/** Port implemented by one adapter per downstream transport. */
public interface ToolExecutor {
    ToolTransport supports();
    JsonNode invoke(ToolDefinition tool, Map<String, Object> arguments);
}
