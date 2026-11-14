
package com.agentgate.registry.infrastructure;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * Provides the shared RestClient builder for outbound REST tool calls.
 */
@Configuration
public class RestClientConfiguration {

    @Bean
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder();
    }
}
