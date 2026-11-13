# AgentGate 🛡️
### Governance Gateway for AI Agents' Tool Calls

AgentGate is a centralized governance gateway for AI-agent tool execution. It is being developed for **CSE 444 — Software Architecture and Design Patterns** using Java 21, Spring Boot 4.1.x, Spring AI MCP, PostgreSQL, Redis, and React (frontend planned).

> **Implementation status:** Architecture and initial backend scaffold are preserved. Stage 4 (identity/security) and Stage 5 (tool registry/MCP transport) are now partially implemented. The policy engine is deliberately default-deny until Stage 7; therefore agent MCP calls cannot execute tools yet. This is a safe incomplete state, not a completed product.

## Implemented in this repository

- Admin-protected agent registration, listing, update, and deactivation.
- OAuth 2.0 `client_credentials` token endpoint with HTTP Basic client authentication.
- Short-lived RS256 JWTs, BCrypt-hashed client secrets, active-agent recheck on tool calls. Configure the public token issuer with `AGENTGATE_ISSUER` (HTTPS outside local development).
- HMAC-verified optional end-user delegation identity.
- Admin-protected REST/MCP tool CRUD and downstream MCP server registration.
- OpenAPI 3 JSON/YAML import for REST operations.
- JSON-schema subset validation for required fields, primitive types, and `additionalProperties: false`.
- REST downstream adapter and official MCP Java SDK Streamable-HTTP adapter.
- Spring AI MCP Streamable-HTTP server exposing AgentGate discovery/invocation facade.
- Default-deny policy port so tools remain hidden and calls remain denied until FR3 is implemented.
- Flyway V1 migration, validated typed configuration, RFC 9457 API/security errors, pagination, unit tests, Docker Compose and Maven Wrapper bootstrap scripts.

## Requirements still pending

The implementation is not complete. The policy engine (FR3), approval workflow (FR4), full guard/redaction pipeline (FR5), distributed quotas (FR6), hash-chained audit system (FR7), kill switch (FR8), policy playground (FR9), downstream health/circuit breakers (FR10), React dashboard, quality-attribute evidence, full integration tests, and final defence artifacts remain to be implemented and verified.

## Prerequisites

- Java 21.
- Docker Engine + Docker Compose plugin.
- Internet access on first Maven Wrapper/Docker build to download Maven and dependencies.

## Local setup

1. Copy `.env.example` to `.env`.
2. Generate a persistent RSA key pair for JWT signing (run once, keep the same pair for future restarts):

   ```bash
   openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out jwt-private.pem
   openssl pkey -in jwt-private.pem -pubout -out jwt-public.pem
   # Linux:
   base64 -w0 jwt-private.pem   # paste into JWT_PRIVATE_KEY_BASE64
   base64 -w0 jwt-public.pem    # paste into JWT_PUBLIC_KEY_BASE64

   # Windows PowerShell:
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("jwt-private.pem"))
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("jwt-public.pem"))
   ```

   Replace every `replace-with-...` value in `.env` with a unique strong secret. Keep the audit and delegation secrets independent and at least 32 characters long. Keep the RSA private key secret and never commit `.env` or the PEM files.
3. Build and run backend tests:

   - Linux/macOS: `cd backend && ./mvnw -B verify`
   - Windows PowerShell: `cd backend; .\mvnw.cmd -B verify`

   Return to the repository root after the build.

4. Start the infrastructure and backend:

   ```bash
   docker compose up --build
   ```

5. Health and API docs:
   - Readiness: `http://localhost:8080/actuator/health/readiness`
   - OpenAPI: `http://localhost:8080/v3/api-docs`
   - Swagger UI: `http://localhost:8080/swagger-ui.html`
   - MCP Streamable HTTP endpoint: `http://localhost:8080/mcp`

The build and Docker startup have **not been executed in the current editing environment** because Maven/Docker are unavailable and outbound DNS is blocked. Run the commands above on your machine and attach the output if anything fails.

## Bootstrap an agent (admin only)

Create an agent using the configured admin HTTP Basic account. First obtain the CSRF token and cookie, then send both on state-changing admin requests:

```bash
CSRF_TOKEN=$(curl -s -u "$ADMIN_USERNAME:$ADMIN_PASSWORD" -c cookies.txt \
  http://localhost:8080/api/v1/csrf | jq -r .token)

curl -b cookies.txt -u "$ADMIN_USERNAME:$ADMIN_PASSWORD" \
  -H "X-XSRF-TOKEN: $CSRF_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Support Agent","clearance":"LOW"}' \
  http://localhost:8080/api/v1/agents
```

The same cookie/header pair is required for admin POST, PUT and DELETE requests. The OAuth2 token endpoint uses the standard OAuth client-authentication flow and does not use this admin CSRF token.

The response contains `clientId` and `clientSecret`. Save the secret securely; it is returned once and only its BCrypt hash is stored. Spring Authorization Server validates the `client_secret_basic` credentials against this stored hash.

Request an OAuth2 access token:

```bash
curl -u '<clientId>:<clientSecret>' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=client_credentials' \
  http://localhost:8080/oauth2/token
```

Use the returned token as `Authorization: Bearer <access_token>` for the MCP endpoint. At this stage, the default policy provider denies calls and discovery returns no tools until the policy engine is delivered.

## Main API endpoints (admin)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/agents` | Register agent; returns one-time client secret |
| GET | `/api/v1/agents` | Paginated agent list |
| PUT | `/api/v1/agents/{id}` | Update agent profile/active status |
| DELETE | `/api/v1/agents/{id}` | Deactivate agent |
| POST | `/api/v1/tool-servers` | Register a downstream MCP/REST server |
| GET | `/api/v1/tool-servers` | Paginated downstream server list |
| DELETE | `/api/v1/tool-servers/{id}` | Deactivate downstream server registration |
| POST | `/api/v1/tools` | Register REST or MCP tool |
| GET | `/api/v1/tools` | Paginated tool list |
| PUT | `/api/v1/tools/{id}` | Update tool metadata/configuration |
| DELETE | `/api/v1/tools/{id}` | Deactivate tool |
| POST | `/api/v1/tools/import/openapi` | Import REST operations from OpenAPI 3 JSON/YAML |

## Project layout

```text
backend/
  src/main/java/com/agentgate/
    identity/       agent registration, credentials, token issue, delegation, security
    registry/       tools, tool servers, OpenAPI importer, REST/MCP adapters
    gateway/        MCP facade, execution pipeline, default-deny policy port
    common/         validated config and RFC 9457 error handlers
  src/main/resources/db/migration/  Flyway migrations
  src/test/java/    unit and architecture tests
docs/
  adr/ architecture/ requirements/ testing/ implementation-guide-stage4-5.md
```

## Security notes

- Use HTTPS outside localhost; never expose the HTTP MCP endpoint without its bearer-token security boundary.
- Replace example secrets and never commit `.env`.
- The admin account is a local bootstrap account configured with environment variables; this is not a full identity-provider product.
- Delegated user identity must be signed by a trusted upstream broker using `DELEGATION_SIGNING_SECRET`. Never accept a raw `X-End-User-Id` header as proof of identity.
- The MCP server only exposes tools after the policy module grants discovery. The default provider intentionally denies all tool calls.
- Tool endpoint registration is admin-only. Apply network egress controls in deployment to mitigate SSRF risks.
- The JSON schema validator currently implements a documented subset, not the complete JSON Schema specification.

## Development commands

```bash
cd backend
./mvnw -B test
./mvnw -B verify
```

```bash
# from repository root
docker compose up --build
docker compose down
```

## Architecture and evidence

See `docs/adr/`, `docs/architecture/`, `docs/requirements/traceability-matrix.md`, and `docs/implementation-guide-stage4-5.md`. Do not treat an unexecuted test or benchmark as evidence of success.
