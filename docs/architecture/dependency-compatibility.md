# Dependency compatibility decisions

Selected baseline (must still be confirmed by Maven dependency resolution and a full build):

| Component | Selected version | Reason |
|---|---:|---|
| Java | 21 | LTS baseline permitted by C1 |
| Spring Boot | 4.1.2 | Stable Spring Boot 4.1 patch release |
| Spring AI | 2.0.2 | Latest stable Spring AI 2.0.x at project setup; Spring AI 2.0.x supports Boot 4.0.x and 4.1.x |
| springdoc-openapi | 3.2.0 | Built for Spring Boot 4.1.2; compatibility table maps Boot 4.1.x to springdoc 3.1.x–3.2.x |
| Spring Authorization Server | Spring Boot-managed | Use the Spring Boot-managed `spring-boot-starter-oauth2-authorization-server` |
| Resilience4j | 2.3.0 | Explicit library version; runtime integration remains pending FR10 |
| ArchUnit | 1.4.1 | Explicit architecture-test version |
| Maven | 3.9.9 via wrapper | Reproducible local/CI build bootstrap |

Official compatibility references:

- Spring Boot 4.1.2 release: https://spring.io/blog/2026/10/23/spring-boot-4-1-2-available-now/
- Spring AI 2.0.x / Spring Boot 4.0.x and 4.1.x compatibility: https://docs.spring.io/spring-ai/reference/getting-started.html
- Spring AI 2.0.2 release: https://spring.io/blog/2026/10/23/spring-ai-2-1-0-RC1-available-now/
- springdoc 3.2.0 / Boot 4.1.x compatibility: https://springdoc.org/
- Spring Security Authorization Server starter and configuration: https://docs.spring.io/spring-security/reference/servlet/oauth2/authorization-server/getting-started.html
- Spring AI MCP annotations and starters: https://docs.spring.io/spring-ai/reference/api/mcp/mcp-annotations-overview.html
- MCP Java SDK Streamable HTTP client API: https://javadoc.io/static/io.modelcontextprotocol.sdk/mcp-core/2.0.0/io/modelcontextprotocol/client/transport/HttpClientStreamableHttpTransport.html

Important verification gap: the editing environment did not have Maven or outbound DNS, so the dependency graph has not been resolved and `mvnw verify` has not been executed. The versions above are selected from official compatibility documentation, not claimed as a successful local build.
