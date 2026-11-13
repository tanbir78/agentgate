# AI Usage Log (C11, honest record)
| Date | Tool | What AI produced | What I verified / changed |
|------|------|------------------|---------------------------|
| 2026-11-13 | Claude | Stage 1-3 docs and scaffold (RTM, risks, C4, ADRs, pom, Compose, ArchUnit test) | PENDING: student review; nothing compiled yet (sandbox had no Maven/network) |

## 2026-11-13 — implementation continuation (ChatGPT-assisted)

- Tool used: ChatGPT code editing and repository review against the uploaded `agentgate.zip`.
- Scope: corrected the scaffold and implemented the first working-code slice for agent identity, registered clients, tool registry, OpenAPI import, REST/MCP adapters, and a fail-closed MCP facade.
- Key prompt: continue the existing repository, preserve ADRs and Git history, implement missing Stage 4 and Stage 5 code, and explain code line by line.
- Actual incomplete/incorrect AI-generated outputs found during review:
  1. The original POM used `${spring-boot.version}` as the Spring Boot parent version. Maven parent resolution requires a concrete parent version before project properties are available. It was replaced with the explicit Spring Boot 4.1.2 parent.
  2. The original Dockerfile invoked `./mvnw`, but no wrapper script existed. A wrapper bootstrap script and wrapper properties were added; its first-run download still requires internet access.
  3. The first implementation draft used a hand-written OAuth token endpoint. Review against ADR-003 showed that this contradicted the decision to avoid hand-rolling OAuth protocol code. It was replaced with Spring Authorization Server and a JPA-backed `RegisteredClientRepository`.
  4. Spring Boot 4 uses Jackson 3 packages (`tools.jackson`) by default. Initial generated code used Jackson 2 imports; these were migrated to Jackson 3 APIs and the YAML dataformat dependency was switched to the Jackson 3 group.
- How discovered: inspected the original POM/Dockerfile, compared code with the existing ADR, and checked official Spring Boot 4, Spring Security Authorization Server, Spring AI MCP, and springdoc documentation.
- Fixes: explicit compatible framework line, wrapper bootstrap, Spring Authorization Server, RSA PEM key configuration, Jackson 3 imports, and a default-deny policy boundary.
- Verification limitation: Java is present, but Maven and Docker are not installed in the editing environment and outbound DNS is blocked. Therefore no Maven build, JUnit run, Docker startup, or integration test is claimed as passed. Run these on a network-enabled development machine and record the raw output.
