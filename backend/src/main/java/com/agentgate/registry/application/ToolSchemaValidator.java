package com.agentgate.registry.application;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import java.util.Iterator;
import java.util.Map;

/** Validates the common JSON Schema object keywords used by imported REST tools. */
@Component
public class ToolSchemaValidator {
    private final JsonMapper mapper;
    public ToolSchemaValidator(JsonMapper mapper) { this.mapper = mapper; }

    public JsonNode parseSchema(String schemaText) {
        try {
            JsonNode schema = mapper.readTree(schemaText);
            if (schema == null || !schema.isObject()) throw new IllegalArgumentException("Schema must be a JSON object");
            return schema;
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid JSON input schema");
        }
    }

    public void validateArguments(String schemaText, Map<String, Object> arguments) {
        if (arguments == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tool arguments must be a JSON object");
        JsonNode schema = parseSchema(schemaText);
        JsonNode required = schema.path("required");
        if (required.isArray()) {
            for (JsonNode field : required) {
                String name = field.asText();
                if (!arguments.containsKey(name) || arguments.get(name) == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing required argument: " + name);
                }
            }
        }
        JsonNode properties = schema.path("properties");
        if (properties.isObject()) {
            Iterator<Map.Entry<String, JsonNode>> fields = properties.properties().iterator();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> field = fields.next();
                if (!arguments.containsKey(field.getKey())) continue;
                String expected = field.getValue().path("type").asText("");
                Object actual = arguments.get(field.getKey());
                if (!matches(expected, actual)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Argument '" + field.getKey() + "' must be of type " + expected);
                }
            }
        }
        if (schema.path("additionalProperties").isBoolean()
                && !schema.path("additionalProperties").asBoolean() && properties.isObject()) {
            for (String key : arguments.keySet()) {
                if (!properties.has(key)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Unexpected argument: " + key);
            }
        }
    }

    private boolean matches(String expected, Object value) {
        return switch (expected) {
            case "string" -> value instanceof String;
            case "integer" -> value instanceof Number number && number.doubleValue() % 1.0d == 0.0d;
            case "number" -> value instanceof Number;
            case "boolean" -> value instanceof Boolean;
            case "object" -> value instanceof Map<?, ?>;
            case "array" -> value instanceof Iterable<?>;
            default -> true;
        };
    }
}
