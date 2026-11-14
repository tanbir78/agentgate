package com.agentgate.gateway.application;

import com.agentgate.identity.application.AgentService;
import com.agentgate.policy.application.PolicyDecisionProvider;
import com.agentgate.identity.application.DelegationIdentityResolver;
import com.agentgate.registry.application.ToolExecutor;
import com.agentgate.registry.application.ToolService;
import com.agentgate.registry.domain.ToolDefinition;
import tools.jackson.databind.JsonNode;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ToolExecutionService {
    private final AgentService agentService;
    private final DelegationIdentityResolver delegationIdentityResolver;
    private final ToolService toolService;
    private final PolicyDecisionProvider policyDecisionProvider;
    private final List<ToolExecutor> executors;

    public ToolExecutionService(AgentService agentService, DelegationIdentityResolver delegationIdentityResolver,
                                ToolService toolService, PolicyDecisionProvider policyDecisionProvider, List<ToolExecutor> executors) {
        this.agentService = agentService;
        this.delegationIdentityResolver = delegationIdentityResolver;
        this.toolService = toolService;
        this.policyDecisionProvider = policyDecisionProvider;
        this.executors = executors;
    }

    public InvocationResult invoke(String agentClientId, String toolName, Map<String, Object> arguments,
                                  String endUserId, String delegationSignature) {
        agentService.requireActiveByClientId(agentClientId);
        String verifiedEndUserId = delegationIdentityResolver.resolve(agentClientId, endUserId, delegationSignature).orElse(null);
        ToolDefinition tool;
        try {
            tool = toolService.findByName(toolName);
        } catch (ResponseStatusException exception) {
            if (exception.getStatusCode().value() == HttpStatus.NOT_FOUND.value()) {
                return new InvocationResult("DENY", toolName, "NOT_DISCOVERABLE",
                        "This tool is not available to the authenticated agent.", null);
            }
            throw exception;
        }
        if (!tool.isActive() || !policyDecisionProvider.canDiscover(agentClientId, tool)) {
            return new InvocationResult("DENY", toolName, "NOT_DISCOVERABLE",
                    "This tool is not available to the authenticated agent.", null);
        }
        toolService.validateArguments(tool, arguments);
        PolicyDecisionProvider.PolicyDecision decision = policyDecisionProvider.evaluate(agentClientId, verifiedEndUserId, tool, arguments);
        if (decision.decision() != PolicyDecisionProvider.Decision.ALLOW) {
            return new InvocationResult(decision.decision().name(), toolName, decision.ruleId(),
                    decision.explanation(), null);
        }
        ToolExecutor executor = executors.stream().filter(candidate -> candidate.supports() == tool.getTransportType())
                .findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED,
                        "No adapter is registered for " + tool.getTransportType()));
        JsonNode result = executor.invoke(tool, arguments);
        return new InvocationResult("ALLOW", toolName, decision.ruleId(), "Tool call completed", result);
    }

    public List<Map<String, Object>> discover(String agentClientId) {
        // Only active agents may discover tools.
        agentService.requireActiveByClientId(agentClientId);

        // Keep domain entities inside the application layer so policy checks
        // receive ToolDefinition rather than the API-facing ToolResponse DTO.
        return toolService.listActiveDefinitions().stream()
                // Apply the same discovery policy to every active tool.
                .filter(tool -> policyDecisionProvider.canDiscover(agentClientId, tool))
                // Convert allowed domain entities into the MCP discovery shape.
                .map(tool -> Map.<String, Object>of(
                        "name", tool.getName(),
                        "description", tool.getDescription(),
                        "riskLevel", tool.getRiskLevel().name(),
                        "inputSchema", tool.getInputSchema()))
                .toList();
    }

    public record InvocationResult(String decision, String tool, String ruleId, String explanation, JsonNode result) { }
}
