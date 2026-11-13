# Repository Structure
```
agentgate/
  README.md  docker-compose.yml  .env.example  .gitignore
  .github/workflows/ci.yml
  backend/
    pom.xml  Dockerfile  mvnw*
    src/main/java/com/agentgate/
      AgentGateApplication.java
      common/        error (RFC 9457), config props, tracing, events, pagination
      identity/      {domain,application,infrastructure,presentation}  agents, credentials, JWT, delegation
      registry/      tools, servers, OpenAPI import, transports (REST/MCP adapters)
      gateway/       pipeline (Chain), executor (Proxy/Decorator), MCP server endpoint
      policy/        model, evaluator strategies, versions, snapshot cache, playground
      approval/      state machine, commands, expiry job
      guard/         Guard SPI, input guards, output guards
      limiter/       Redis limiter, quotas, violations
      audit/         hash chain, writer, verifier, export, anchors
      admin/         kill switch, settings, dashboard stats
      health/        probes, circuit breakers
      notification/  web + webhook observers
    src/main/resources/ application.yml, application-{dev,test,prod}.yml, db/migration/V1..
    src/test/java/com/agentgate/  ArchitectureTest + per-module tests
  frontend/  src/{api,components,pages,hooks,lib,routes}, Dockerfile, nginx.conf
  tests/{security,performance,audit,availability,adoption}/
  scripts/  run-*.sh  verify-audit.sh  verify-deps.sh
  docs/{architecture,adr,design-patterns,database,api,testing,security,defence,process,requirements}/
```
Layering inside a module: `presentation -> application -> domain <- infrastructure`.
