package com.agentgate.registry;

import com.agentgate.registry.application.ToolSchemaValidator;
import tools.jackson.databind.json.JsonMapper;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class ToolSchemaValidatorTest {
    private final ToolSchemaValidator validator = new ToolSchemaValidator(JsonMapper.builder().build());

    @Test
    void acceptsValidRequiredStringArgument() {
        assertDoesNotThrow(() -> validator.validateArguments(
                "{\"type\":\"object\",\"required\":[\"customerId\"],\"properties\":{\"customerId\":{\"type\":\"string\"}}}",
                Map.of("customerId", "C-100")));
    }

    @Test
    void rejectsMissingRequiredArgument() {
        assertThrows(ResponseStatusException.class, () -> validator.validateArguments(
                "{\"type\":\"object\",\"required\":[\"customerId\"]}", Map.of()));
    }

    @Test
    void rejectsUnexpectedArgumentWhenAdditionalPropertiesAreDisabled() {
        assertThrows(ResponseStatusException.class, () -> validator.validateArguments(
                "{\"type\":\"object\",\"properties\":{\"id\":{\"type\":\"string\"}},\"additionalProperties\":false}",
                Map.of("id", "1", "admin", true)));
    }
}
