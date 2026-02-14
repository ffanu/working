using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Models
{
    public class DemandForecast
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string ProductId { get; set; } = string.Empty;

        [StringLength(100)]
        public string ProductName { get; set; } = string.Empty;

        [StringLength(100)]
        public string ProductSKU { get; set; } = string.Empty;

        [Required]
        public string WarehouseId { get; set; } = string.Empty;

        [StringLength(100)]
        public string WarehouseName { get; set; } = string.Empty;

        public DateTime ForecastDate { get; set; } = DateTime.UtcNow;

        public int ForecastPeriod { get; set; } = 30; // Days

        public decimal PredictedDemand { get; set; } = 0;

        public decimal ConfidenceLevel { get; set; } = 0.8m; // 0-1 scale

        public decimal SeasonalFactor { get; set; } = 1.0m;

        public decimal TrendFactor { get; set; } = 1.0m;

        [StringLength(50)]
        public string Algorithm { get; set; } = string.Empty; // Moving Average, Exponential Smoothing, ML

        public List<ForecastDataPoint> HistoricalData { get; set; } = new List<ForecastDataPoint>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;
    }

    public class ForecastDataPoint
    {
        public DateTime Date { get; set; }

        public decimal ActualDemand { get; set; } = 0;

        public decimal PredictedDemand { get; set; } = 0;

        public decimal Error { get; set; } = 0; // Actual - Predicted
    }

    public class BusinessIntelligence
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        [StringLength(100)]
        public string MetricName { get; set; } = string.Empty;

        [StringLength(50)]
        public string MetricType { get; set; } = string.Empty; // KPI, SLA, Performance

        public string EntityId { get; set; } = string.Empty; // Product, Warehouse, Supplier, etc.

        [StringLength(100)]
        public string EntityType { get; set; } = string.Empty;

        public decimal CurrentValue { get; set; } = 0;

        public decimal TargetValue { get; set; } = 0;

        public decimal PreviousValue { get; set; } = 0;

        public decimal ChangePercentage { get; set; } = 0;

        [StringLength(50)]
        public string Trend { get; set; } = string.Empty; // increasing, decreasing, stable

        [StringLength(50)]
        public string Status { get; set; } = string.Empty; // on-track, at-risk, critical

        public DateTime MeasurementDate { get; set; } = DateTime.UtcNow;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;
    }

    public class StockAging
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string ProductId { get; set; } = string.Empty;

        [StringLength(100)]
        public string ProductName { get; set; } = string.Empty;

        [StringLength(100)]
        public string ProductSKU { get; set; } = string.Empty;

        [Required]
        public string WarehouseId { get; set; } = string.Empty;

        [StringLength(100)]
        public string WarehouseName { get; set; } = string.Empty;

        public int CurrentStock { get; set; } = 0;

        public int DaysInStock { get; set; } = 0; // How long stock has been sitting

        public decimal StockValue { get; set; } = 0;

        public decimal UnitCost { get; set; } = 0;

        [StringLength(50)]
        public string AgingCategory { get; set; } = string.Empty; // fresh, aging, old, dead

        public DateTime? LastMovementDate { get; set; } = null;

        public DateTime? ExpiryDate { get; set; } = null;

        public int? DaysUntilExpiry { get; set; } = null;

        [StringLength(500)]
        public string? Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;
    }
}


