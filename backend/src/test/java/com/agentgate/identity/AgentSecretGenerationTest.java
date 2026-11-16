package com.agentgate.identity;

import com.agentgate.identity.application.AgentDtos.CreateAgentRequest;
import com.agentgate.identity.application.AgentService;
import com.agentgate.identity.domain.Clearance;
import com.agentgate.identity.application.AgentStore;
import com.agentgate.audit.application.AuditService;
import com.agentgate.audit.application.AuditActorProvider;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AgentSecretGenerationTest {

    @Test
    void returnsOneTimeSecretButPersistsOnlyItsHash() {

        AgentStore repository = mock(AgentStore.class);
        AuditService auditService = mock(AuditService.class);
        AuditActorProvider auditActorProvider = mock(AuditActorProvider.class);

        when(repository.save(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        when(auditActorProvider.currentActor())
                .thenReturn("test-admin");

        AgentService service = new AgentService(
                repository,
                PasswordEncoderFactories.createDelegatingPasswordEncoder(),
                auditService,
                auditActorProvider
        );

        var response = service.create(
                new CreateAgentRequest("Support Agent", Clearance.LOW)
        );

        assertNotNull(response.clientSecret());
        assertTrue(response.clientId().startsWith("ag_"));

        verify(repository).save(argThat(agent ->
                agent.getClientSecretHash().startsWith("{bcrypt}")
                && !agent.getClientSecretHash().equals(response.clientSecret())
        ));

        verify(auditService).record(
                any(),
                any(),
                any(),
                any(),
                any(),
                any()
        );
    }
}