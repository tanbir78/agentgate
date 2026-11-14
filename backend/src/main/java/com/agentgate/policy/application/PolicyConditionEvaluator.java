package com.agentgate.policy.application;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.Map;
import java.util.Objects;

/**
 * Condition schema: {"argumentName":{"operator":"EQUALS","value":"expected"}}
 * Operators: EQUALS, NOT_EQUALS, GREATER_THAN, LESS_THAN, CONTAINS, IN, EXISTS.
 * Malformed and unknown operators fail closed.
 */
public final class PolicyConditionEvaluator {
    public boolean matches(Map<String, Object> conditions, Map<String, Object> arguments) {
        if (conditions == null || conditions.isEmpty()) return true;
        if (arguments == null) return false;
        for (var entry : conditions.entrySet()) {
            if (!(entry.getValue() instanceof Map<?, ?> spec)) return false;
            if (!(spec.get("operator") instanceof String operator)) return false;
            Object expected = spec.get("value");
            boolean exists = arguments.containsKey(entry.getKey());
            Object actual = arguments.get(entry.getKey());
            boolean matched;
            try {
                matched = switch (operator) {
                    case "EXISTS" -> exists == Boolean.TRUE.equals(expected);
                    case "EQUALS" -> exists && Objects.equals(actual, expected);
                    case "NOT_EQUALS" -> exists && !Objects.equals(actual, expected);
                    case "GREATER_THAN" -> exists && compare(actual, expected) > 0;
                    case "LESS_THAN" -> exists && compare(actual, expected) < 0;
                    case "CONTAINS" -> exists && contains(actual, expected);
                    case "IN" -> exists && expected instanceof Collection<?> values && values.contains(actual);
                    default -> false;
                };
            } catch (RuntimeException ex) { return false; }
            if (!matched) return false;
        }
        return true;
    }
    private int compare(Object a, Object b) {
        if (a instanceof Number && b instanceof Number)
            return new BigDecimal(a.toString()).compareTo(new BigDecimal(b.toString()));
        if (a instanceof String x && b instanceof String y) return x.compareTo(y);
        throw new IllegalArgumentException("Incomparable condition values");
    }
    private boolean contains(Object actual, Object expected) {
        if (actual instanceof String text && expected instanceof String part) return text.contains(part);
        if (actual instanceof Collection<?> values) return values.contains(expected);
        return false;
    }
}