package com.agentgate.approval.presentation;

import com.agentgate.AgentGateApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = AgentGateApplication.class)
@AutoConfigureMockMvc
class ApprovalSecurityIntegrationTest {

    private static final String BASE_URL = "/api/v1/approvals";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void adminShouldAccessApprovalEndpoint() throws Exception {
        mockMvc.perform(get(BASE_URL)
                .with(user("admin").roles("ADMIN", "APPROVER")))
                .andExpect(status().isOk());
    }

    @Test
    void approverShouldAccessApprovalEndpoint() throws Exception {
        mockMvc.perform(get(BASE_URL)
                .with(user("approver").roles("APPROVER")))
                .andExpect(status().isOk());
    }

    @Test
    void ordinaryUserShouldBeForbidden() throws Exception {
        mockMvc.perform(get(BASE_URL)
                .with(user("ordinary-user").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void unauthenticatedUserShouldBeUnauthorized() throws Exception {
        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isUnauthorized());
    }
}