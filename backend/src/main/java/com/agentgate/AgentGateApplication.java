package com.agentgate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/** Entry point. Responsibility: bootstrap only. Implements C1. */
@SpringBootApplication
@ConfigurationPropertiesScan
public class AgentGateApplication {
    public static void main(String[] args) {
        SpringApplication.run(AgentGateApplication.class, args);
    }
}
