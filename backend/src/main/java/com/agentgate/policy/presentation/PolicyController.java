package com.agentgate.policy.presentation;

import com.agentgate.policy.application.PolicyManagementService;
import com.agentgate.policy.application.PolicyDtos.CreatePolicyRequest;
import com.agentgate.policy.application.PolicyDtos.AddPolicyRuleRequest;
import com.agentgate.policy.application.PolicyDtos.PolicyResponse;
import com.agentgate.policy.application.PolicyDtos.PolicyRuleResponse;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/policies")
public class PolicyController {

    private final PolicyManagementService policyService;

    public PolicyController(PolicyManagementService policyService) {
        this.policyService = policyService;
    }

    @GetMapping
    public List<PolicyResponse> listPolicies() {
        return policyService.listPolicies();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PolicyResponse createPolicy(
            @Valid @RequestBody CreatePolicyRequest request) {
        return policyService.createPolicy(request);
    }

    @GetMapping("/{id}")
    public PolicyResponse getPolicy(@PathVariable UUID id) {
        return policyService.getPolicy(id);
    }

    @GetMapping("/{id}/rules")
    public List<PolicyRuleResponse> getPolicyRules(
            @PathVariable UUID id) {
        return policyService.getPolicyRules(id);
    }

    @PostMapping("/{id}/rules")
    @ResponseStatus(HttpStatus.CREATED)
    public PolicyRuleResponse addRule(
            @PathVariable UUID id,
            @Valid @RequestBody AddPolicyRuleRequest request) {
        return policyService.addRule(id, request);
    }

    @PostMapping("/{id}/activate")
    public PolicyResponse activatePolicy(@PathVariable UUID id) {
        return policyService.activatePolicy(id);
    }

    @PostMapping("/{id}/archive")
    public PolicyResponse archivePolicy(@PathVariable UUID id) {
        return policyService.archivePolicy(id);
    }
}