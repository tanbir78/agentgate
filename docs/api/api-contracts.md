# API contracts — current implementation slice

All `/api/v1/**` routes require admin HTTP Basic credentials. State-changing admin requests also require the `XSRF-TOKEN` cookie and `X-XSRF-TOKEN` header; obtain the token from `GET /api/v1/csrf`. MCP calls use a bearer token issued by Spring Authorization Server.

| Method | Path | Auth | Request | Result |
|---|---|---|---|---|
| GET | `/api/v1/csrf` | Admin | none | CSRF token and header name |
| POST | `/api/v1/agents` | Admin + CSRF | `{name, clearance}` | Agent + one-time `clientSecret` |
| GET | `/api/v1/agents?page=0&size=20` | Admin | Pageable query | Page of agents (no secret) |
| PUT | `/api/v1/agents/{id}` | Admin + CSRF | `{name, clearance, active}` | Updated agent |
| DELETE | `/api/v1/agents/{id}` | Admin + CSRF | none | 204; soft deactivation |
| POST | `/oauth2/token` | OAuth2 client Basic | `grant_type=client_credentials` | Spring Authorization Server access token |
| POST | `/api/v1/tool-servers` | Admin + CSRF | `{name, transportType, baseUrl}` | Registered server |
| GET | `/api/v1/tool-servers?page=0&size=20` | Admin | Pageable query | Page of server records |
| DELETE | `/api/v1/tool-servers/{id}` | Admin + CSRF | none | 204; soft deactivation |
| POST | `/api/v1/tools` | Admin + CSRF | Tool metadata + JSON schema string | Registered tool |
| GET | `/api/v1/tools?page=0&size=20&activeOnly=false` | Admin | Pageable query | Page of tools |
| PUT | `/api/v1/tools/{id}` | Admin + CSRF | Editable tool metadata | Updated tool |
| DELETE | `/api/v1/tools/{id}` | Admin + CSRF | none | 204; soft deactivation |
| POST | `/api/v1/tools/import/openapi?ownerTeam=...` | Admin + CSRF | multipart `file` (OpenAPI 3 JSON/YAML) | Imported REST tools |
| POST | `/mcp` | Agent bearer JWT | MCP Streamable HTTP JSON-RPC | AgentGate MCP facade |

`POST /oauth2/token` is implemented by Spring Authorization Server, not a custom controller. Tool execution remains default-deny until FR3's policy evaluator replaces the bootstrap policy provider.

## Example tool registration

```json
{
  "name": "customer_lookup",
  "description": "Look up a customer record",
  "transportType": "REST",
  "riskLevel": "LOW",
  "ownerTeam": "support",
  "endpointUrl": "https://api.example.test/customers",
  "httpMethod": "GET",
  "inputSchema": "{\"type\":\"object\",\"required\":[\"customerId\"],\"properties\":{\"customerId\":{\"type\":\"string\"}},\"additionalProperties\":false}"
}
```

The current input schema validator implements a subset of JSON Schema only. Full schema draft compliance and `$ref` resolution are pending.
