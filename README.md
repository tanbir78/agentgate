# AgentGate - Governance Gateway for AI Agents' Tool Calls
CSE 444 project. Status: **Stages 1-3 scaffold. No feature implemented yet.** See docs/requirements/traceability-matrix.md.

## Quick start (target; not yet verified)
```
cp .env.example .env      # set secrets
cd backend && mvn -N wrapper:wrapper   # generate Maven wrapper once (needs network)
cd .. && docker compose up --build
```
## First checks to run on your machine
1. `scripts/verify-deps.sh` (resolves every dependency; fix versions if it fails)
2. `cd backend && ./mvnw verify` (ArchitectureTest should pass)
