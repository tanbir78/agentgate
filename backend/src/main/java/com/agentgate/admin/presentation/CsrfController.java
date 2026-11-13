package com.agentgate.admin.presentation;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

/** Provides the double-submit CSRF token to the authenticated admin SPA/CLI. */
@RestController
@RequestMapping("/api/v1/csrf")
public class CsrfController {
    @GetMapping
    public Map<String, String> token(CsrfToken csrfToken) {
        return Map.of("headerName", csrfToken.getHeaderName(), "token", csrfToken.getToken());
    }
}
