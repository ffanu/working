using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Models
{
    public class AuditLog
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [StringLength(100)]
        public string UserName { get; set; } = string.Empty;

        [StringLength(100)]
        public string UserEmail { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Action { get; set; } = string.Empty; // create, read, update, delete, login, logout

        [Required]
        [StringLength(100)]
        public string EntityType { get; set; } = string.Empty; // Product, Sale, Purchase, etc.

        public string? EntityId { get; set; } = string.Empty; // ID of the affected entity

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [StringLength(50)]
        public string Severity { get; set; } = string.Empty; // low, medium, high, critical

        [StringLength(100)]
        public string IpAddress { get; set; } = string.Empty;

        [StringLength(500)]
        public string UserAgent { get; set; } = string.Empty;

        [StringLength(100)]
        public string SessionId { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [StringLength(500)]
        public string? OldValues { get; set; } = string.Empty; // JSON of previous values

        [StringLength(500)]
        public string? NewValues { get; set; } = string.Empty; // JSON of new values

        [StringLength(500)]
        public string? AdditionalData { get; set; } = string.Empty; // Any extra context

        public bool IsActive { get; set; } = true;
    }

    public class SecurityEvent
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        [StringLength(50)]
        public string EventType { get; set; } = string.Empty; // login_failed, suspicious_activity, data_breach

        [Required]
        [StringLength(50)]
        public string Severity { get; set; } = string.Empty; // low, medium, high, critical

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        public string? UserId { get; set; } = string.Empty;

        [StringLength(100)]
        public string? UserName { get; set; } = string.Empty;

        [StringLength(100)]
        public string IpAddress { get; set; } = string.Empty;

        [StringLength(500)]
        public string UserAgent { get; set; } = string.Empty;

        [StringLength(500)]
        public string? AdditionalData { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [StringLength(50)]
        public string Status { get; set; } = "open"; // open, investigating, resolved, false_positive

        public string? AssignedTo { get; set; } = string.Empty; // Security team member

        public DateTime? ResolvedAt { get; set; } = null;

        [StringLength(500)]
        public string? ResolutionNotes { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
    }

    public class ComplianceRecord
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        [StringLength(100)]
        public string ComplianceType { get; set; } = string.Empty; // GDPR, FDA, ISO, SOX

        [Required]
        [StringLength(100)]
        public string Requirement { get; set; } = string.Empty; // Specific compliance requirement

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [StringLength(50)]
        public string Status { get; set; } = string.Empty; // compliant, non-compliant, pending

        public DateTime DueDate { get; set; } = DateTime.UtcNow;

        public DateTime? CompletedDate { get; set; } = null;

        public string? ResponsiblePerson { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Evidence { get; set; } = string.Empty; // Documentation, audit trails

        [StringLength(500)]
        public string? Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;
    }
}


