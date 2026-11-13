package com.agentgate.identity.infrastructure;

import com.agentgate.identity.domain.Agent;
import com.agentgate.identity.application.AgentStore;
import org.springframework.security.oauth2.server.authorization.token.JwtEncodingContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenCustomizer;
import org.springframework.stereotype.Component;

@Component
public class AgentTokenCustomizer implements OAuth2TokenCustomizer<JwtEncodingContext> {
    private final AgentStore agents;
    public AgentTokenCustomizer(AgentStore agents) { this.agents = agents; }

    @Override
    public void customize(JwtEncodingContext context) {
        String clientId = context.getRegisteredClient().getClientId();
        Agent agent = agents.findByClientId(clientId)
                .filter(Agent::isActive)
                .orElseThrow(() -> new IllegalStateException("Agent is missing or disabled"));
        context.getClaims()
                .claim("agent_id", agent.getId().toString())
                .claim("clearance", agent.getClearance().name());
    }
}
