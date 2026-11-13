# ADR-003: Embedded OAuth2 authorization server for local identity (DECISION GATE)
- Status: Proposed - needs your approval
- Context: FR2 needs OAuth2 client credentials with no paid IdP. Admin UI also needs login.
- Options: (A) Spring Authorization Server embedded; (B) Keycloak container; (C) self-signed JWTs by hand.
- Decision (recommended): A. Agents get JWTs via `client_credentials`; secrets stored with BCrypt; agent record holds clearance/active flag and is re-checked on every call (deactivation is immediate even if a JWT is still valid). Admin users: form login -> JWT with ADMIN/APPROVER roles.
- Rejected: B (about 500 MB+ RAM, extra service); C (rolling our own crypto/token flows is a security risk).
- Consequences: (+) light, one service, standard flows; (-) we own key rotation and user store; signing keys must come from env/secret, not committed.
