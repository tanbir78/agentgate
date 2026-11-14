package com.agentgate.policy.application;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class PolicyConditionEvaluatorTest {

    private PolicyConditionEvaluator evaluator;

    @BeforeEach
    void setUp() {
        evaluator = new PolicyConditionEvaluator();
    }

    private Map<String, Object> condition(
            String argument,
            String operator,
            Object value
    ) {
        return Map.of(
                argument,
                Map.of("operator", operator, "value", value)
        );
    }

    @Test
    void emptyConditionsShouldAllow() {
        assertTrue(evaluator.matches(Map.of(), Map.of()));
    }

    @Test
    void nullConditionsShouldAllow() {
        assertTrue(evaluator.matches(null, Map.of()));
    }

    @Test
    void nullArgumentsShouldFailClosed() {
        assertFalse(evaluator.matches(
                condition("role", "EQUALS", "admin"),
                null
        ));
    }

    @Test
    void equalsShouldMatch() {
        assertTrue(evaluator.matches(
                condition("role", "EQUALS", "admin"),
                Map.of("role", "admin")
        ));
    }

    @Test
    void equalsShouldRejectDifferentValue() {
        assertFalse(evaluator.matches(
                condition("role", "EQUALS", "admin"),
                Map.of("role", "user")
        ));
    }

    @Test
    void notEqualsShouldMatchDifferentValue() {
        assertTrue(evaluator.matches(
                condition("role", "NOT_EQUALS", "admin"),
                Map.of("role", "user")
        ));
    }

    @Test
    void notEqualsShouldRejectSameValue() {
        assertFalse(evaluator.matches(
                condition("role", "NOT_EQUALS", "admin"),
                Map.of("role", "admin")
        ));
    }

    @Test
    void missingArgumentShouldFailEqualsAndNotEquals() {
        assertFalse(evaluator.matches(
                condition("role", "EQUALS", "admin"),
                Map.of()
        ));

        assertFalse(evaluator.matches(
                condition("role", "NOT_EQUALS", "admin"),
                Map.of()
        ));
    }

    @Test
    void greaterThanShouldCompareNumbers() {
        assertTrue(evaluator.matches(
                condition("amount", "GREATER_THAN", 100),
                Map.of("amount", 150)
        ));
    }

    @Test
    void lessThanShouldCompareNumbers() {
        assertTrue(evaluator.matches(
                condition("amount", "LESS_THAN", 100),
                Map.of("amount", 50)
        ));
    }

    @Test
    void numericComparisonShouldSupportDifferentNumberTypes() {
        assertTrue(evaluator.matches(
                condition("amount", "EQUALS", 10.0),
                Map.of("amount", 10)
        ) == false);

        assertTrue(evaluator.matches(
                condition("amount", "GREATER_THAN", 9.5),
                Map.of("amount", 10)
        ));
    }

    @Test
    void stringComparisonShouldWork() {
        assertTrue(evaluator.matches(
                condition("name", "GREATER_THAN", "Alice"),
                Map.of("name", "Bob")
        ));
    }

    @Test
    void incomparableValuesShouldFailClosed() {
        assertFalse(evaluator.matches(
                condition("amount", "GREATER_THAN", "100"),
                Map.of("amount", 150)
        ));
    }

    @Test
    void containsShouldMatchSubstring() {
        assertTrue(evaluator.matches(
                condition("email", "CONTAINS", "@example.com"),
                Map.of("email", "user@example.com")
        ));
    }

    @Test
    void containsShouldMatchCollectionItem() {
        assertTrue(evaluator.matches(
                condition("roles", "CONTAINS", "admin"),
                Map.of("roles", List.of("user", "admin"))
        ));
    }

    @Test
    void containsShouldRejectMissingItem() {
        assertFalse(evaluator.matches(
                condition("roles", "CONTAINS", "admin"),
                Map.of("roles", List.of("user", "guest"))
        ));
    }

    @Test
    void inShouldMatchAllowedValue() {
        assertTrue(evaluator.matches(
                condition("role", "IN", List.of("admin", "manager")),
                Map.of("role", "admin")
        ));
    }

    @Test
    void inShouldRejectDisallowedValue() {
        assertFalse(evaluator.matches(
                condition("role", "IN", List.of("admin", "manager")),
                Map.of("role", "guest")
        ));
    }

    @Test
    void existsShouldMatchPresentArgument() {
        assertTrue(evaluator.matches(
                condition("userId", "EXISTS", true),
                Map.of("userId", "123")
        ));
    }

    @Test
    void existsShouldMatchAbsentArgumentWhenExpectedFalse() {
        assertTrue(evaluator.matches(
                condition("userId", "EXISTS", false),
                Map.of()
        ));
    }

    @Test
    void existsShouldRejectMissingArgumentWhenExpectedTrue() {
        assertFalse(evaluator.matches(
                condition("userId", "EXISTS", true),
                Map.of()
        ));
    }

    @Test
    void unknownOperatorShouldFailClosed() {
        assertFalse(evaluator.matches(
                condition("role", "INVALID_OPERATOR", "admin"),
                Map.of("role", "admin")
        ));
    }

    @Test
    void malformedConditionShouldFailClosed() {
        assertFalse(evaluator.matches(
                Map.of("role", "admin"),
                Map.of("role", "admin")
        ));
    }

    @Test
    void missingOperatorShouldFailClosed() {
        assertFalse(evaluator.matches(
                Map.of("role", Map.of("value", "admin")),
                Map.of("role", "admin")
        ));
    }

    @Test
    void multipleConditionsShouldAllMatch() {
        Map<String, Object> conditions = Map.of(
                "role", Map.of("operator", "EQUALS", "value", "admin"),
                "active", Map.of("operator", "EQUALS", "value", true)
        );

        assertTrue(evaluator.matches(
                conditions,
                Map.of("role", "admin", "active", true)
        ));
    }

    @Test
    void multipleConditionsShouldFailWhenOneDoesNotMatch() {
        Map<String, Object> conditions = Map.of(
                "role", Map.of("operator", "EQUALS", "value", "admin"),
                "active", Map.of("operator", "EQUALS", "value", true)
        );

        assertFalse(evaluator.matches(
                conditions,
                Map.of("role", "admin", "active", false)
        ));
    }
}