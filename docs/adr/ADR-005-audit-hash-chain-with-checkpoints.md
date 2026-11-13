# ADR-005: Hash-chained audit with external signed checkpoints
- Status: Proposed
- Context: FR7 requires integrity evidence and forbids overclaiming "tamper-proof".
- Decision: Each record stores `prev_hash` and `hash = SHA-256(prev_hash || canonical_json(record))`. Appends are serialised per chain with a Postgres advisory lock inside the same transaction as the decision. Every N records or T minutes a checkpoint (sequence, hash, HMAC-signed with a key held outside the DB) is written to a file/volume outside Postgres. `verify-audit.sh` recomputes the chain and compares against checkpoints.
- Limits (stated honestly): a DBA who can rewrite the whole table AND the checkpoint store can forge history; truncation of the tail after the last checkpoint is undetectable until the next checkpoint; hash chain gives tamper-evidence, not prevention. Stronger anchoring (WORM storage, transparency log, email/third-party timestamp) is documented as future work.
- Alternatives rejected: plain table (no integrity), blockchain (overkill), DB triggers only (privileged user can drop them).
- Consequences: write path serialised, so latency must be measured under QA2.
