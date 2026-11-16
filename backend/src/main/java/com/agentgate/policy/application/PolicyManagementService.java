package com.agentgate.policy.application;

import com.agentgate.identity.application.AgentStore;
import com.agentgate.audit.application.AuditService;
import com.agentgate.audit.application.AuditActorProvider;
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
    private final AuditService auditService;
    private final AuditActorProvider auditActorProvider;

    public PolicyManagementService(
            PolicyStore policyStore,
            PolicyRuleStore ruleStore,
            AgentStore agentStore,
            ToolStore toolStore,
            AuditService auditService,
            AuditActorProvider auditActorProvider) {

        this.policyStore = policyStore;
        this.ruleStore = ruleStore;
        this.agentStore = agentStore;
        this.toolStore = toolStore;
        this.auditService = auditService;
        this.auditActorProvider = auditActorProvider;
    }

    @Transactional(readOnly = true)
    public List<PolicyResponse> listPolicies() {
        return policyStore.findAllPolicies()
                .stream()
                .map(this::toPolicyResponse)
                .toList();
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
                request.description());

        Policy savedPolicy = policyStore.save(policy);

        auditService.record(
                auditActorProvider.currentActor(),
                null,
                null,
                "POLICY_CREATED",
                null,
                "Policy created: " + savedPolicy.getPolicyKey()
                        + ", version: " + savedPolicy.getVersion());

        return toPolicyResponse(savedPolicy);
    }

    public PolicyRuleResponse addRule(
            UUID policyId,
            AddPolicyRuleRequest request) {

        Policy policy = getPolicyOrThrow(policyId);

        if (policy.getStatus() != PolicyStatus.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Rules can only be added to a draft policy.");
        }

        agentStore.findByIdAndActiveTrue(request.agentId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Active agent not found."));

        toolStore.findByIdAndActiveTrue(request.toolId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Active tool not found."));

        boolean duplicate = ruleStore.findByPolicyId(policyId)
                .stream()
                .anyMatch(rule ->
                        rule.isEnabled()
                        && request.agentId().equals(rule.getAgentId())
                        && request.toolId().equals(rule.getToolId()));

        if (duplicate) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An enabled rule already exists for this agent and tool.");
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
                request.description());

        PolicyRule savedRule = ruleStore.save(rule);

        auditService.record(
                auditActorProvider.currentActor(),
                savedRule.getAgentId(),
                savedRule.getToolId(),
                "POLICY_RULE_ADDED",
                savedRule.getId().toString(),
                "Rule added to policy: " + policy.getPolicyKey());

        return toRuleResponse(savedRule);
    }

    public PolicyResponse activatePolicy(UUID policyId) {

        Policy policy = getPolicyOrThrow(policyId);

        if (policy.getStatus() != PolicyStatus.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only draft policies can be activated.");
        }

        if (!ruleStore.existsEnabledByPolicyId(policyId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A policy must contain at least one enabled rule before activation.");
        }

        policyStore.findByPolicyKeyAndStatus(
                policy.getPolicyKey(),
                PolicyStatus.ACTIVE
        ).ifPresent(previousPolicy -> {

            previousPolicy.archive();
            policyStore.save(previousPolicy);

            auditService.record(
                    auditActorProvider.currentActor(),
                    null,
                    null,
                    "POLICY_ARCHIVED",
                    null,
                    "Previous policy automatically archived: "
                            + previousPolicy.getPolicyKey()
                            + ", version: " + previousPolicy.getVersion());
        });

        policy.activate();

        Policy activatedPolicy = policyStore.save(policy);

        auditService.record(
                auditActorProvider.currentActor(),
                null,
                null,
                "POLICY_ACTIVATED",
                null,
                "Policy activated: " + activatedPolicy.getPolicyKey()
                        + ", version: " + activatedPolicy.getVersion());

        return toPolicyResponse(activatedPolicy);
    }

    public PolicyResponse archivePolicy(UUID policyId) {

        Policy policy = getPolicyOrThrow(policyId);

        if (policy.getStatus() != PolicyStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only active policies can be archived.");
        }

        policy.archive();

        Policy archivedPolicy = policyStore.save(policy);

        auditService.record(
                auditActorProvider.currentActor(),
                null,
                null,
                "POLICY_ARCHIVED",
                null,
                "Policy archived: " + archivedPolicy.getPolicyKey()
                        + ", version: " + archivedPolicy.getVersion());

        return toPolicyResponse(archivedPolicy);
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
                        "Policy not found."));
    }

    private PolicyResponse toPolicyResponse(Policy policy) {
        return new PolicyResponse(
                policy.getId(),
                policy.getPolicyKey(),
                policy.getVersion(),
                policy.getDescription(),
                policy.getStatus(),
                policy.getCreatedAt(),
                policy.getActivatedAt());
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
                rule.getCreatedAt());
    }
}