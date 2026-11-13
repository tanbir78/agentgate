package com.agentgate.gateway.infrastructure;

import com.agentgate.gateway.application.DefaultDenyPolicyDecisionProvider;
import com.agentgate.gateway.application.PolicyDecisionProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PolicyBootstrapConfiguration {
    /** The bootstrap policy denies everything; a real FR3 evaluator replaces this bean automatically. */
    @Bean
    @ConditionalOnMissingBean(PolicyDecisionProvider.class)
    PolicyDecisionProvider defaultDenyPolicyDecisionProvider() {
        return new DefaultDenyPolicyDecisionProvider();
    }
}
