# ADR-001: Modular Monolith
- Status: Proposed (awaiting approval)
- Context: One governance chokepoint, 8 GB laptop target, one-command start, a student team. Governance needs transactional consistency between decision, approval and audit.
- Decision: Single Spring Boot deployable with 12 modules; boundaries enforced by ArchUnit (and Spring Modulith if compatible with the Boot 4 BOM).
- Alternatives rejected: Microservices (network hops hurt QA2, distributed transactions for audit, heavy for 8 GB); plain layered monolith (boundaries erode, C6 fails).
- Consequences: (+) simple deploy, in-process calls, ACID audit; (-) single scaling unit; discipline needed, hence architecture tests.
