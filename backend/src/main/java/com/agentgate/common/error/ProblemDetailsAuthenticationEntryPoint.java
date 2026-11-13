package com.agentgate.common.error;

import tools.jackson.databind.json.JsonMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.net.URI;

@Component
public class ProblemDetailsAuthenticationEntryPoint implements AuthenticationEntryPoint {
    private final JsonMapper mapper;
    public ProblemDetailsAuthenticationEntryPoint(JsonMapper mapper) { this.mapper = mapper; }
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, "Authentication is required to access this resource");
        problem.setTitle("Unauthorized");
        problem.setType(URI.create("https://agentgate.local/problems/unauthorized"));
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        mapper.writeValue(response.getOutputStream(), problem);
    }
}
