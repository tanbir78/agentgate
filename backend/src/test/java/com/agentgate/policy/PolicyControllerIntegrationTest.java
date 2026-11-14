package com.agentgate.policy;

import com.agentgate.AgentGateApplication;
import com.agentgate.identity.domain.Agent;
import com.agentgate.identity.domain.Clearance;
import com.agentgate.identity.infrastructure.AgentRepository;
import com.agentgate.registry.domain.RiskLevel;
import com.agentgate.registry.domain.ToolDefinition;
import com.agentgate.registry.domain.ToolTransport;
import com.agentgate.registry.infrastructure.ToolRepository;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = AgentGateApplication.class)
@AutoConfigureMockMvc
@Transactional
class PolicyControllerIntegrationTest {

    private static final String BASE_URL = "/api/v1/policies";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper objectMapper;

    @Autowired
    private AgentRepository agentRepository;

    @Autowired
    private ToolRepository toolRepository;


    private ResultActions perform(MockHttpServletRequestBuilder request)
            throws Exception {
        return mockMvc.perform(
                request.with(user("admin").roles("ADMIN"))
        );
    }
    private UUID agentId;
    private UUID toolId;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString();

        Agent agent = agentRepository.saveAndFlush(
                new Agent(
                        "Policy Test Agent",
                        "policy-test-" + suffix,
                        "test-secret-hash",
                        Clearance.HIGH
                )
        );

        ToolDefinition tool = toolRepository.saveAndFlush(
                new ToolDefinition(
                        "policy-test-tool-" + suffix,
                        "Integration test tool",
                        ToolTransport.REST,
                        RiskLevel.LOW,
                        "platform-team",
                        "http://localhost:9999/test",
                        "POST",
                        Map.of(
                                "type", "object",
                                "properties", Map.of()
                        )
                )
        );

        agentId = agent.getId();
        toolId = tool.getId();
    }

    @Test
    void shouldCreatePolicyWithDraftStatus() throws Exception {
        perform(post(BASE_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPolicyJson("test-create")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.policyKey").value("test-create"))
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void shouldCompletePolicyLifecycle() throws Exception {
        String policyId = createPolicy("test-lifecycle");

        addAllowRule(policyId);

        perform(get(BASE_URL + "/" + policyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"));

        perform(get(BASE_URL + "/" + policyId + "/rules"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].effect").value("ALLOW"))
                .andExpect(jsonPath("$[0].enabled").value(true));

        perform(post(BASE_URL + "/" + policyId + "/activate")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.activatedAt").exists());

        perform(post(BASE_URL + "/" + policyId + "/archive")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ARCHIVED"));

        perform(get(BASE_URL + "/" + policyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ARCHIVED"));
    }

    @Test
    void shouldIncrementVersionForSamePolicyKey() throws Exception {
        createPolicy("test-versioning");

        perform(post(BASE_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPolicyJson("test-versioning")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.policyKey").value("test-versioning"))
                .andExpect(jsonPath("$.version").value(2));
    }

    @Test
    void shouldArchivePreviousActiveVersionWhenNewVersionIsActivated()
            throws Exception {

        String firstPolicyId = createPolicy("test-policy-rollover");
        addAllowRule(firstPolicyId);

        perform(post(BASE_URL + "/" + firstPolicyId + "/activate")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        String secondPolicyId = createPolicy("test-policy-rollover");
        addAllowRule(secondPolicyId);

        perform(post(BASE_URL + "/" + secondPolicyId + "/activate")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(2))
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        perform(get(BASE_URL + "/" + firstPolicyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ARCHIVED"));

        perform(get(BASE_URL + "/" + secondPolicyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void shouldRejectDuplicateEnabledRule() throws Exception {
        String policyId = createPolicy("test-duplicate-rule");

        addAllowRule(policyId);

        perform(post(BASE_URL + "/" + policyId + "/rules")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createRuleJson()))
                .andExpect(status().isConflict());
    }

    @Test
    void shouldRejectActivationWithoutEnabledRules() throws Exception {
        String policyId = createPolicy("test-empty-policy");

        perform(post(BASE_URL + "/" + policyId + "/activate")
                        .with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRejectInvalidPolicyKey() throws Exception {
        perform(post(BASE_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPolicyJson("1-invalid")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnNotFoundForMissingPolicy() throws Exception {
        UUID missingId = UUID.randomUUID();

        perform(get(BASE_URL + "/" + missingId))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldRejectRuleForMissingAgent() throws Exception {
        String policyId = createPolicy("test-missing-agent");

        String invalidRule = objectMapper.writeValueAsString(
                Map.of(
                        "agentId", UUID.randomUUID(),
                        "toolId", toolId,
                        "effect", "ALLOW",
                        "priority", 10,
                        "conditions", Map.of()
                )
        );

        perform(post(BASE_URL + "/" + policyId + "/rules")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidRule))
                .andExpect(status().isNotFound());
    }

    private String createPolicy(String policyKey) throws Exception {
        MvcResult result = perform(post(BASE_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPolicyJson(policyKey)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode response = objectMapper.readTree(
                result.getResponse().getContentAsString()
        );

        String id = response.get("id").asText();
        assertNotNull(id);

        return id;
    }

    private void addAllowRule(String policyId) throws Exception {
        perform(post(BASE_URL + "/" + policyId + "/rules")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createRuleJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.effect").value("ALLOW"))
                .andExpect(jsonPath("$.enabled").value(true));
    }

    private String createPolicyJson(String policyKey) throws Exception {
        return objectMapper.writeValueAsString(
                Map.of(
                        "policyKey", policyKey,
                        "description", "Policy integration test"
                )
        );
    }

    private String createRuleJson() throws Exception {
        return objectMapper.writeValueAsString(
                Map.of(
                        "agentId", agentId,
                        "toolId", toolId,
                        "effect", "ALLOW",
                        "priority", 10,
                        "conditions", Map.of(),
                        "description", "Integration test allow rule"
                )
        );
    }
}