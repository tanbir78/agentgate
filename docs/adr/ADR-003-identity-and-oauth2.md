# ADR-003: Spring Authorization Server for agent client credentials

- Status: Accepted (implementation in progress)
- Context: FR2 requires registered agents to authenticate with OAuth2 client credentials. A full identity-provider product is out of scope, but the token protocol and cryptographic implementation should not be hand-written.
- Options:
  - A. Spring Authorization Server embedded in the AgentGate process, with AgentGate's JPA agent registry as `RegisteredClientRepository`.
  - B. Keycloak as a separate container.
  - C. A custom token endpoint and manually assembled JWTs.
- Decision: Option A. Use Spring Boot's `spring-boot-starter-oauth2-authorization-server`. Configure only `client_credentials` and `client_secret_basic`, persist agent client secrets as BCrypt hashes, issue short-lived RS256 JWT access tokens, and add `agent_id` and `clearance` claims through `OAuth2TokenCustomizer`.
- Key management: RSA private/public PEM values are supplied as base64 environment variables. The same key pair must be retained across restarts and rotated deliberately. Private key material must never be committed.
- Immediate revocation: The registered-client repository filters inactive agents, and the gateway rechecks agent active status on every tool call. Existing JWTs therefore cannot continue to invoke tools after an agent is disabled.
- Rejected: B adds substantial local memory/operational cost for this course laptop target. C duplicates sensitive OAuth protocol and cryptographic code that Spring Authorization Server already provides.
- Consequences: (+) standards-based client-credentials flow, framework-managed client authentication and token issuance; (+) no paid IdP; (-) AgentGate still owns the local agent registry, admin bootstrap user, signing-key rotation and delegation trust relationship.
- Evidence: Dependency/API selection follows the official Spring Security Authorization Server starter and configuration guide. Runtime interoperability tests remain pending because Maven/Docker are unavailable in the current editing environment.
