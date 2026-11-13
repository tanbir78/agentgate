package com.agentgate.gateway.application;

import org.springframework.ai.mcp.annotation.McpTool;
import org.springframework.ai.mcp.annotation.McpToolParam;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;

/** MCP facade. Its transport endpoint is protected by the OAuth2 resource-server filter chain. */
@Component
public class AgentGateMcpTools {
    private final ToolExecutionService executionService;
    public AgentGateMcpTools(ToolExecutionService executionService) { this.executionService = executionService; }

    @McpTool(name = "agentgate_list_tools", description = "Lists tools this authenticated agent is currently authorized to discover.")
    public List<Map<String, Object>> listTools() {
        return executionService.discover(currentAgentClientId());
    }

    @McpTool(name = "agentgate_call_tool", description = "Invokes a registered tool through AgentGate policy and execution controls.")
    public ToolExecutionService.InvocationResult callTool(
            @McpToolParam(description = "Registered tool name", required = true) String toolName,
            @McpToolParam(description = "Tool arguments as an object", required = true) Map<String, Object> arguments,
            @McpToolParam(description = "Optional end-user identifier", required = false) String endUserId,
            @McpToolParam(description = "HMAC signature from the trusted identity broker", required = false) String delegationSignature) {
        return executionService.invoke(currentAgentClientId(), toolName, arguments, endUserId, delegationSignature);
    }

    private String currentAgentClientId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Authenticated agent context is missing");
        }
        return authentication.getName();
    }
}
