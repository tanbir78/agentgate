package com.agentgate.policy.application;

import com.agentgate.identity.application.AgentStore;
import com.agentgate.policy.domain.Policy;
import com.agentgate.policy.domain.PolicyEffect;
import com.agentgate.policy.domain.PolicyRule;
import com.agentgate.policy.domain.PolicyStatus;
import com.agentgate.registry.application.ToolStore;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static com.agentgate.policy.application.PolicyDtos.*;

@Service
@Transactional
public class PolicyManagementService {

    private final PolicyStore policyStore;
    private final PolicyRuleStore ruleStore;
    private final AgentStore agentStore;
    private final ToolStore toolStore;

    public PolicyManagementService(
            PolicyStore policyStore,
            PolicyRuleStore ruleStore,
            AgentStore agentStore,
            ToolStore toolStore) {

        this.policyStore = policyStore;
        this.ruleStore = ruleStore;
        this.agentStore = agentStore;
        this.toolStore = toolStore;
    }

    public PolicyResponse createPolicy(CreatePolicyRequest request) {

        String policyKey = request.policyKey().trim();

        int nextVersion = policyStore
                .findLatestByPolicyKey(policyKey)
                .map(policy -> Math.addExact(policy.getVersion(), 1))
                .orElse(1);

        Policy policy = new Policy(
                policyKey,
                nextVersion,
                request.description()
        );

        return toPolicyResponse(policyStore.save(policy));
    }

    public PolicyRuleResponse addRule(
            UUID policyId,
            AddPolicyRuleRequest request) {

        Policy policy = getPolicyOrThrow(policyId);

        if (policy.getStatus() != PolicyStatus.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Rules can only be added to a draft policy."
            );
        }

        agentStore.findByIdAndActiveTrue(request.agentId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Active agent not found."
                ));

        toolStore.findByIdAndActiveTrue(request.toolId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Active tool not found."
                ));

        boolean duplicate = ruleStore.findByPolicyId(policyId)
                .stream()
                .anyMatch(rule ->
                        rule.isEnabled()
                        && request.agentId().equals(rule.getAgentId())
                        && request.toolId().equals(rule.getToolId())
                );

        if (duplicate) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An enabled rule already exists for this agent and tool."
            );
        }

        Map<String, Object> conditions = request.conditions() == null
                ? Map.of()
                : Map.copyOf(request.conditions());

        PolicyRule rule = new PolicyRule(
                policy,
                request.agentId(),
                request.toolId(),
                request.effect(),
                request.priority(),
                conditions,
                request.description()
        );

        return toRuleResponse(ruleStore.save(rule));
    }

    public PolicyResponse activatePolicy(UUID policyId) {

        Policy policy = getPolicyOrThrow(policyId);

        if (policy.getStatus() != PolicyStatus.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only draft policies can be activated."
            );
        }

        if (!ruleStore.existsEnabledByPolicyId(policyId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A policy must contain at least one enabled rule before activation."
            );
        }

        policyStore.findByPolicyKeyAndStatus(
                policy.getPolicyKey(),
                PolicyStatus.ACTIVE
        ).ifPresent(previousPolicy -> {
            previousPolicy.archive();
            policyStore.save(previousPolicy);
        });

        policy.activate();

        return toPolicyResponse(policyStore.save(policy));
    }

    public PolicyResponse archivePolicy(UUID policyId) {

        Policy policy = getPolicyOrThrow(policyId);

        if (policy.getStatus() != PolicyStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only active policies can be archived."
            );
        }

        policy.archive();

        return toPolicyResponse(policyStore.save(policy));
    }

    @Transactional(readOnly = true)
    public PolicyResponse getPolicy(UUID policyId) {
        return toPolicyResponse(getPolicyOrThrow(policyId));
    }

    @Transactional(readOnly = true)
    public List<PolicyRuleResponse> getPolicyRules(UUID policyId) {

        getPolicyOrThrow(policyId);

        return ruleStore.findByPolicyId(policyId)
                .stream()
                .map(this::toRuleResponse)
                .toList();
    }

    private Policy getPolicyOrThrow(UUID policyId) {
        return policyStore.findById(policyId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Policy not found."
                ));
    }

    private PolicyResponse toPolicyResponse(Policy policy) {
        return new PolicyResponse(
                policy.getId(),
                policy.getPolicyKey(),
                policy.getVersion(),
                policy.getDescription(),
                policy.getStatus(),
                policy.getCreatedAt(),
                policy.getActivatedAt()
        );
    }

    private PolicyRuleResponse toRuleResponse(PolicyRule rule) {
        return new PolicyRuleResponse(
                rule.getId(),
                rule.getPolicy().getId(),
                rule.getAgentId(),
                rule.getToolId(),
                rule.getEffect(),
                rule.getPriority(),
                rule.getConditions(),
                rule.isEnabled(),
                rule.getDescription(),
                rule.getCreatedAt()
        );
    }
}