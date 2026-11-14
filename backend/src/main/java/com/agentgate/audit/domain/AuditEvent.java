package com.agentgate.audit.domain;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="audit_events")
public class AuditEvent {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(name="occurred_at",nullable=false,updatable=false) private Instant occurredAt;
 @Column(name="actor_id",length=255) private String actorId;
 @Column(name="agent_id") private UUID agentId;
 @Column(name="tool_id") private UUID toolId;
 @Column(nullable=false,length=40) private String decision;
 @Column(name="rule_id",length=100) private String ruleId;
 @Column(length=1000) private String explanation;
 protected AuditEvent() {}
 public AuditEvent(String actorId, UUID agentId, UUID toolId, String decision, String ruleId, String explanation) {
  this.actorId=actorId; this.agentId=agentId; this.toolId=toolId; this.decision=decision; this.ruleId=ruleId; this.explanation=explanation;
 }
 @PrePersist void beforeInsert(){ occurredAt=Instant.now(); }
 public UUID getId(){return id;} public Instant getOccurredAt(){return occurredAt;}
 public String getActorId(){return actorId;} public UUID getAgentId(){return agentId;}
 public UUID getToolId(){return toolId;} public String getDecision(){return decision;}
 public String getRuleId(){return ruleId;} public String getExplanation(){return explanation;}
}