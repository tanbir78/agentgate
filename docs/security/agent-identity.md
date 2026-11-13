# Agent identity and authentication

## OAuth2 flow

AgentGate uses Spring Authorization Server's `client_credentials` grant with `client_secret_basic` authentication.

1. An administrator creates an agent through `POST /api/v1/agents`.
2. AgentGate generates a random client ID and one-time client secret.
3. The service stores only the BCrypt hash of the secret.
4. The agent requests `POST /oauth2/token` with HTTP Basic client credentials and `grant_type=client_credentials`.
5. Spring Authorization Server resolves the client through `AgentRegisteredClientRepository`.
6. `AgentTokenCustomizer` adds `agent_id` and `clearance` claims to the JWT.
7. The JWT is signed with the configured RSA key pair and includes the `tools:invoke` scope.
8. MCP requests use `Authorization: Bearer <token>`.

## Key management

Generate an RSA 2048-bit key pair once. Store base64-encoded PEM contents in `JWT_PRIVATE_KEY_BASE64` and `JWT_PUBLIC_KEY_BASE64`. The key pair must remain stable across restarts; replacing it invalidates previously issued JWTs. Rotate deliberately and protect the private key as a secret. Do not commit key material.

## Agent deactivation

The registered-client repository refuses inactive agents when issuing new tokens. `ToolExecutionService` also rechecks the agent's active flag on every invocation, so disabling an agent prevents it from continuing to use an already issued JWT for tool calls.

## End-user delegation

A trusted upstream identity broker signs `agentClientId:endUserId` with HMAC-SHA256 using `DELEGATION_SIGNING_SECRET`. MCP invocation accepts both the end-user ID and its signature. AgentGate verifies the signature with constant-time comparison. Supplying an unsigned user ID is rejected.

## Admin account

The local admin user is configured by `ADMIN_USERNAME` and `ADMIN_PASSWORD` and stored in an in-memory Spring Security user store with BCrypt encoding. This is a local course-project bootstrap account, not a complete human identity-management service.

## Admin API CSRF protection

Admin APIs use HTTP Basic authentication plus a double-submit CSRF cookie/header pair. Call `GET /api/v1/csrf` to obtain the `XSRF-TOKEN` cookie and the token value, then send the cookie and `X-XSRF-TOKEN` header on state-changing `/api/v1/**` requests. MCP requests use bearer JWT authentication and are isolated in a separate stateless filter chain.
