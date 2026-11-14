package com.agentgate.policy;

import com.agentgate.AgentGateApplication;
import com.agentgate.policy.application.DatabasePolicyDecisionProvider;
import com.agentgate.policy.application.PolicyDecisionProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = AgentGateApplication.class)
class PolicyProviderWiringTest {

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private PolicyDecisionProvider policyDecisionProvider;

    @Test
    void databasePolicyProviderShouldBeRegisteredAsPrimaryProvider() {
        assertNotNull(policyDecisionProvider);

        assertInstanceOf(
                DatabasePolicyDecisionProvider.class,
                policyDecisionProvider
        );
    }

    @Test
    void onlyOnePolicyDecisionProviderShouldBeRegistered() {
        String[] providerBeans =
                applicationContext.getBeanNamesForType(
                        PolicyDecisionProvider.class
                );

        org.junit.jupiter.api.Assertions.assertEquals(
                1,
                providerBeans.length
        );
    }
}