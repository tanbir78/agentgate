# AgentGate implementation guide — Stages 4 and 5

This guide explains the new code by file and logical line groups. It is written so a CSE 444 student can explain the design in a live defence.

## 1. Build and configuration

### `backend/pom.xml`

- The `spring-boot-starter-parent` fixes the project to Spring Boot 4.1.2 and supplies dependency management for the Spring ecosystem.
- `java.version=21` makes Java 21 the compiler/runtime baseline.
- `spring-ai-bom=2.0.2` manages the Spring AI MCP starter versions. Spring AI 2.0.x is the Spring Boot 4 line.
- `springdoc.version=3.2.0` is selected for Spring Boot 4.1.x; springdoc 3.0.x is the Boot 4.0.x line.
- `spring-ai-starter-mcp-server-webmvc` enables the HTTP MCP server. The application selects Streamable HTTP rather than legacy SSE.
- `spring-ai-starter-mcp-client` brings the Spring AI/MCP client stack. The downstream MCP adapter uses the official MCP Java SDK API over Streamable HTTP.
- `jackson-dataformat-yaml` is used through the Jackson 3 `tools.jackson` group for OpenAPI YAML parsing.
- `spring-boot-starter-flyway` and `flyway-database-postgresql` make Flyway own the schema lifecycle; Hibernate is set to `validate`, not `create`.
- `archunit-junit5`, Testcontainers and Spring Security Test support architecture and security testing.

### `AgentGateProperties.java`

- `@ConfigurationProperties(prefix="agentgate")` binds environment-backed settings into one typed record.
- `@Validated` activates Bean Validation during application startup.
- `@NotBlank` and `@Size(min=32)` reject missing or weak application secrets.
- Access-token TTL, policy refresh interval and approval timeout are numeric configuration values rather than hardcoded values in business services.

### `application.yml`

- Database and Redis hosts are configurable through environment variables.
- `ddl-auto: validate` prevents Hibernate from silently creating or mutating the schema.
- Flyway runs versioned SQL migrations before JPA validates the schema.
- Spring AI configures a synchronous Streamable-HTTP MCP server.
- Actuator exposes health, readiness, metrics and Prometheus endpoints.
- JSON structured logging and tracing sampling are enabled for observability.

## 1.1 Persistence ports and adapters

- `AgentStore`, `ToolStore`, and `ToolServerStore` are application-facing interfaces. Services depend on these interfaces, not directly on Spring Data JPA repositories.
- `AgentRepository`, `ToolRepository`, and `ToolServerRepository` are Spring Data JPA repositories in the infrastructure layer.
- `AgentStoreAdapter`, `ToolStoreAdapter`, and `ToolServerStoreAdapter` implement the application ports by delegating to Spring Data.
- `ArchitectureTest.application_does_not_depend_on_infrastructure` enforces this direction. The infrastructure layer may depend on application ports; the reverse dependency is forbidden.

## 2. Agent identity and credentials

### `identity/domain/Agent.java`

- `@Entity` maps the domain object to the `agents` table.
- UUID identity avoids exposing sequential database identifiers.
- `clientId` is unique and is the OAuth2 client identifier.
- `clientSecretHash` stores only a BCrypt hash; the original secret is never persisted.
- `Clearance` is stored as a string enum (`LOW`, `MEDIUM`, `HIGH`).
- `active` allows immediate agent deactivation. Tool execution rechecks this state rather than trusting a still-valid JWT alone.
- `@Version` enables optimistic locking for concurrent profile updates.
- `@PrePersist` and `@PreUpdate` maintain timestamps.

### `identity/application/AgentService.java`

- The service creates a random 36-byte secret using `SecureRandom`.
- Base64 URL encoding makes the secret safe to transmit in JSON and HTTP Basic credentials.
- `PasswordEncoderFactories.createDelegatingPasswordEncoder` stores a `{bcrypt}`-prefixed BCrypt hash so Spring Security can identify the hash algorithm when validating OAuth client credentials.
- The raw secret is returned once in `CreatedAgentResponse`; list and update responses never contain it.
- `authenticate` checks both the agent's active status and BCrypt secret match.
- `requireActiveByClientId` is used during every gateway invocation so a deactivated agent cannot continue using a previously issued token.
- `Pageable` ensures the admin list API is paginated.

### `identity/infrastructure/AgentRegisteredClientRepository.java`

- Implements Spring Authorization Server's `RegisteredClientRepository` contract using the persisted Agent table.
- Each active Agent becomes a registered OAuth2 client with `client_secret_basic` and the `client_credentials` grant.
- The BCrypt hash is passed to Spring Security's configured BCrypt `PasswordEncoder`; the raw secret is never stored.
- The client receives the `tools:invoke` scope and a configurable access-token lifetime.
- `save` is intentionally unsupported because clients are created through AgentGate's agent-management API.

### `identity/infrastructure/AgentTokenCustomizer.java`

- Spring Authorization Server calls this customizer while building a JWT access token.
- The customizer looks up the agent by OAuth client ID and checks that it is still active.
- It adds `agent_id` and `clearance` claims for downstream policy and redaction decisions.

### `identity/infrastructure/IdentitySecurityConfiguration.java`

- The first filter chain is dedicated to Spring Authorization Server protocol endpoints.
- The second chain secures application APIs and the MCP endpoint.
- `JWKSource` provides an RSA signing key to Spring Authorization Server; `JwtEncoder` signs tokens and `JwtDecoder` validates them.
- The RSA key pair is loaded from base64-encoded PEM environment variables so the signing key survives container restarts.
- The issuer is `https://agentgate.local`; the decoder validates issuer, signature and standard time claims.
- This is a focused embedded authorization server configuration for agent clients, not a full identity-provider product.

### `identity/infrastructure/IdentitySecurityConfiguration.java`

- BCrypt strength 12 is used for stored client secrets and the local admin password.
- A dedicated filter chain isolates `/oauth2/token`; this prevents the admin HTTP Basic filter from mistaking agent credentials for admin credentials.
- The MCP chain is stateless and accepts bearer JWTs with `SCOPE_tools:invoke`.
- The admin API chain requires HTTP Basic with `ROLE_ADMIN` plus a double-submit CSRF cookie/header pair.
- A separate default chain secures non-API routes; health and OpenAPI documentation are explicitly public.
- Agent and tool administration endpoints require `ROLE_ADMIN`.
- MCP requires `SCOPE_tools:invoke`.
- Health and OpenAPI documentation routes are explicitly public; other routes require authentication.

### `identity/application/DelegationIdentityResolver.java`

- An end-user identity is optional; if supplied, both the ID and signature are mandatory.
- The trusted broker signs `agentClientId:endUserId` with HMAC-SHA256.
- `MessageDigest.isEqual` performs constant-time signature comparison.
- An invalid or incomplete delegation is rejected with HTTP 401.
- This prevents an agent from choosing an arbitrary customer ID and claiming it as verified context.

## 3. Tool registry

### `registry/domain/ToolDefinition.java`

- The entity persists a tool's name, description, transport, risk, owning team, endpoint, HTTP method and JSON input schema.
- `ToolTransport` separates REST and MCP tools.
- `RiskLevel` separates LOW, MEDIUM and HIGH tools.
- JSON schema is persisted in PostgreSQL `JSONB` through Hibernate's JSON JDBC type.
- `active` and `healthStatus` are lifecycle fields used by later kill-switch and health modules.
- Optimistic locking protects concurrent updates.

### `registry/application/ToolService.java`

- `create` rejects duplicate names and invalid endpoint URLs.
- Schema text is parsed before persistence; malformed JSON cannot enter the registry.
- REST methods are restricted to GET, POST, PUT, PATCH and DELETE.
- `list` supports Spring Data pagination.
- `update` changes tool configuration without exposing the entity to the controller.
- `deactivate` is a soft-disable operation; it preserves audit-relevant historical data.
- `saveImported` gives OpenAPI imports a reusable persistence path.

### `registry/application/ToolSchemaValidator.java`

- The schema parser accepts a JSON object only.
- `required` checks mandatory keys.
- `properties.*.type` checks common primitive/container types.
- `additionalProperties=false` rejects unknown argument names.
- This is intentionally a small JSON Schema subset. Full draft-version support is still pending and must not be represented as complete JSON Schema validation.

### `registry/application/OpenApiImporter.java`

- The importer accepts an uploaded OpenAPI 3.x JSON or YAML file.
- It reads the first server URL and iterates each path operation.
- It imports GET, POST, PUT, PATCH and DELETE operations.
- `operationId` becomes the preferred tool name; a normalized method/path name is used when absent.
- A JSON request-body schema is stored when present; otherwise an empty object schema is used.
- Imported tools start as LOW risk so an administrator must explicitly review and change the risk level before production exposure.
- The importer currently supports a constrained OpenAPI 3 import path; `$ref` resolution, parameter/path templating and advanced content types remain future work.

### `registry/infrastructure/RestToolAdapter.java`

- Implements the `ToolExecutor` port for REST transport.
- The adapter selects the configured HTTP method.
- GET and DELETE arguments are sent as query parameters.
- POST, PUT and PATCH arguments are sent as JSON request bodies.
- The adapter returns the downstream JSON response as a Jackson 3 `JsonNode`.
- Production timeouts, circuit breakers, SSRF network policy and output redaction are still pending later stages.

### `registry/infrastructure/McpToolAdapter.java`

- Implements the same `ToolExecutor` port for MCP transport.
- Creates an official MCP Java SDK Streamable-HTTP transport for the registered endpoint.
- `initialize()` negotiates the protocol version and capabilities.
- `CallToolRequest` sends the registered downstream tool name and argument map.
- `closeGracefully()` closes the per-call MCP session in a `finally` block.
- The client request timeout is currently ten seconds; configurable per-tool timeout and circuit breaker integration are later FR10 work.

### `registry/application/ToolServerService.java` and `ToolServerController.java`

- These files register, list and deactivate downstream server records.
- The list API uses `Pageable`.
- Server URLs are checked for HTTP(S) scheme and host.
- Tool records currently keep their own endpoint URL; server-to-tool foreign-key association and server-level connection credential management are not yet implemented.

## 4. Gateway and MCP server

### `gateway/application/PolicyDecisionProvider.java`

- This is the policy boundary between the gateway and the future FR3 policy module.
- `evaluate` receives the authenticated agent, verified delegated user, tool and arguments.
- `canDiscover` controls whether an agent can see a tool in MCP discovery.
- The gateway depends on this interface rather than depending directly on a concrete policy engine.

### `DefaultDenyPolicyDecisionProvider.java`

- This temporary adapter returns DENY for every tool call.
- It also hides every tool from agent discovery.
- This is intentional: FR3 is not yet implemented, so there must be no accidental route around the required default-deny policy.
- Stage 7 replaces this bean with the versioned policy evaluator; do not change this default to ALLOW as a shortcut.

### `gateway/application/ToolExecutionService.java`

- Rechecks the agent's active status.
- Validates any optional end-user delegation signature.
- Loads the registered tool and rejects inactive tools.
- Validates arguments against the registered input schema.
- Checks policy-based discovery before schema validation to avoid exposing schemas for tools the agent cannot discover.
- Requests a policy decision before selecting a downstream adapter.
- Calls a REST or MCP adapter only when the policy decision is ALLOW.
- Returns the decision, rule ID, explanation and downstream result.

### `gateway/application/AgentGateMcpTools.java`

- `@McpTool` exposes two MCP tools: `agentgate_list_tools` and `agentgate_call_tool`.
- The Spring Security resource-server filter protects the `/mcp` transport endpoint.
- The authenticated JWT subject is used as the agent client ID.
- The call tool accepts optional end-user ID and signature fields; the signature is verified in the gateway.
- The MCP facade does not invoke a downstream tool directly; all calls pass through `ToolExecutionService`.

## 5. API errors and security

- `ApiExceptionHandler` converts request validation and status exceptions into RFC 9457 `ProblemDetail` responses.
- `ProblemDetailsAuthenticationEntryPoint` returns `application/problem+json` for unauthenticated requests.
- `ProblemDetailsAccessDeniedHandler` returns `application/problem+json` for forbidden requests.
- The admin bootstrap account is configured from environment variables and is held in memory; it is not a full user-management system.

## 6. Important implementation limitations

The following are not complete and must be implemented before final submission:

1. Full FR3 policy authoring, versioning, cache refresh and dry-run.
2. Approval state machine and notifications (FR4).
3. Full JSON Schema validation, sensitive output redaction and truncation (FR5).
4. Redis rate limits, quotas and write blast-radius caps (FR6).
5. Audit hash chain, external checkpoints, search and export (FR7).
6. Kill switch (FR8), policy playground (FR9), health checks/circuit breakers (FR10).
7. React admin dashboard and end-to-end integration.
8. Integration/Testcontainers tests, quality attribute scripts and measured evidence.
9. Actual Maven/Docker execution. The current environment has Java but no Maven/Docker binaries and outbound DNS is unavailable, so compilation and container startup cannot be truthfully reported as passed.
