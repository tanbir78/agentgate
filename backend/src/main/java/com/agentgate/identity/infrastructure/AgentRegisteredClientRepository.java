package com.agentgate.identity.infrastructure;

import com.agentgate.identity.domain.Agent;
import com.agentgate.identity.application.AgentStore;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.stereotype.Component;
import java.time.Duration;
import java.util.UUID;
import com.agentgate.common.AgentGateProperties;

/** Adapts persisted Agent credentials to Spring Authorization Server's registered-client contract. */
@Component
public class AgentRegisteredClientRepository implements RegisteredClientRepository {
    private final AgentStore agents;
    private final AgentGateProperties properties;

    public AgentRegisteredClientRepository(AgentStore agents, AgentGateProperties properties) {
        this.agents = agents;
        this.properties = properties;
    }

    @Override
    public void save(RegisteredClient registeredClient) {
        throw new UnsupportedOperationException("Clients are managed through the AgentGate agent API");
    }

    @Override
    public RegisteredClient findById(String id) {
        try {
            return agents.findById(UUID.fromString(id)).filter(Agent::isActive).map(this::toRegisteredClient).orElse(null);
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    @Override
    public RegisteredClient findByClientId(String clientId) {
        return agents.findByClientId(clientId).filter(Agent::isActive).map(this::toRegisteredClient).orElse(null);
    }

    private RegisteredClient toRegisteredClient(Agent agent) {
        return RegisteredClient.withId(agent.getId().toString())
                .clientId(agent.getClientId())
                .clientSecret(agent.getClientSecretHash())
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
                .scope("tools:invoke")
                .tokenSettings(TokenSettings.builder()
                        .accessTokenTimeToLive(Duration.ofMinutes(properties.accessTokenMinutes()))
                        .build())
                .build();
    }
}
