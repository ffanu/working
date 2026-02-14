using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Models
{
    public class DeliveryOrder
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string SalesOrderId { get; set; } = string.Empty;

        [StringLength(100)]
        public string DeliveryNumber { get; set; } = string.Empty;

        [Required]
        public string CustomerId { get; set; } = string.Empty;

        [StringLength(100)]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        public string WarehouseId { get; set; } = string.Empty;

        [StringLength(100)]
        public string WarehouseName { get; set; } = string.Empty;

        [Required]
        public string DeliveryAddress { get; set; } = string.Empty;

        [StringLength(100)]
        public string City { get; set; } = string.Empty;

        [StringLength(100)]
        public string State { get; set; } = string.Empty;

        [StringLength(20)]
        public string PostalCode { get; set; } = string.Empty;

        [StringLength(100)]
        public string Country { get; set; } = string.Empty;

        [StringLength(20)]
        public string Phone { get; set; } = string.Empty;

        public DateTime ScheduledDeliveryDate { get; set; } = DateTime.UtcNow;

        public DateTime? ActualDeliveryDate { get; set; } = null;

        [StringLength(50)]
        public string Status { get; set; } = "pending"; // pending, picked, packed, shipped, in-transit, delivered, failed

        [StringLength(100)]
        public string? CarrierId { get; set; } = string.Empty;

        [StringLength(100)]
        public string? CarrierName { get; set; } = string.Empty;

        [StringLength(100)]
        public string? TrackingNumber { get; set; } = string.Empty;

        [StringLength(100)]
        public string? RouteId { get; set; } = string.Empty;

        public List<DeliveryItem> Items { get; set; } = new List<DeliveryItem>();

        [StringLength(500)]
        public string Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;
    }

    public class DeliveryItem
    {
        [Required]
        public string ProductId { get; set; } = string.Empty;

        [StringLength(100)]
        public string ProductName { get; set; } = string.Empty;

        [StringLength(100)]
        public string ProductSKU { get; set; } = string.Empty;

        public int OrderedQuantity { get; set; } = 0;

        public int PickedQuantity { get; set; } = 0;

        public int PackedQuantity { get; set; } = 0;

        public int ShippedQuantity { get; set; } = 0;

        public int DeliveredQuantity { get; set; } = 0;

        [StringLength(100)]
        public string? BatchNumber { get; set; } = string.Empty;

        [StringLength(100)]
        public string? BinLocation { get; set; } = string.Empty;

        [StringLength(50)]
        public string Status { get; set; } = "pending"; // pending, picked, packed, shipped, delivered

        public DateTime? PickedAt { get; set; } = null;

        public string? PickedBy { get; set; } = string.Empty;

        public DateTime? PackedAt { get; set; } = null;

        public string? PackedBy { get; set; } = string.Empty;

        public DateTime? ShippedAt { get; set; } = null;

        public string? ShippedBy { get; set; } = string.Empty;

        public DateTime? DeliveredAt { get; set; } = null;

        public string? DeliveredBy { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Notes { get; set; } = string.Empty;
    }

    public class Shipment
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        [StringLength(100)]
        public string ShipmentNumber { get; set; } = string.Empty;

        [Required]
        public string CarrierId { get; set; } = string.Empty;

        [StringLength(100)]
        public string CarrierName { get; set; } = string.Empty;

        [StringLength(100)]
        public string TrackingNumber { get; set; } = string.Empty;

        [StringLength(50)]
        public string ShipmentType { get; set; } = string.Empty; // ground, air, sea, express

        public DateTime ShipmentDate { get; set; } = DateTime.UtcNow;

        public DateTime? EstimatedDeliveryDate { get; set; } = null;

        public DateTime? ActualDeliveryDate { get; set; } = null;

        [StringLength(50)]
        public string Status { get; set; } = "created"; // created, picked-up, in-transit, delivered, failed

        public List<string> DeliveryOrderIds { get; set; } = new List<string>();

        public List<ShipmentItem> Items { get; set; } = new List<ShipmentItem>();

        [StringLength(500)]
        public string Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;
    }

    public class ShipmentItem
    {
        [Required]
        public string ProductId { get; set; } = string.Empty;

        [StringLength(100)]
        public string ProductName { get; set; } = string.Empty;

        [StringLength(100)]
        public string ProductSKU { get; set; } = string.Empty;

        public int Quantity { get; set; } = 0;

        public decimal Weight { get; set; } = 0;

        public decimal Volume { get; set; } = 0;

        [StringLength(100)]
        public string? BatchNumber { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Notes { get; set; } = string.Empty;
    }

    public class Carrier
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [StringLength(100)]
        public string Code { get; set; } = string.Empty;

        [StringLength(500)]
        public string Address { get; set; } = string.Empty;

        [StringLength(100)]
        public string City { get; set; } = string.Empty;

        [StringLength(100)]
        public string State { get; set; } = string.Empty;

        [StringLength(20)]
        public string PostalCode { get; set; } = string.Empty;

        [StringLength(100)]
        public string Country { get; set; } = string.Empty;

        [StringLength(20)]
        public string Phone { get; set; } = string.Empty;

        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [StringLength(100)]
        public string Website { get; set; } = string.Empty;

        [StringLength(50)]
        public string Status { get; set; } = "active"; // active, inactive, suspended

        public List<string> SupportedServices { get; set; } = new List<string>(); // ground, air, sea, express

        public List<string> SupportedRegions { get; set; } = new List<string>(); // countries/regions served

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;
    }

    public class Route
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        [StringLength(100)]
        public string RouteName { get; set; } = string.Empty;

        [Required]
        public string WarehouseId { get; set; } = string.Empty;

        [StringLength(100)]
        public string WarehouseName { get; set; } = string.Empty;

        public List<RouteStop> Stops { get; set; } = new List<RouteStop>();

        public decimal TotalDistance { get; set; } = 0; // in kilometers

        public int EstimatedDuration { get; set; } = 0; // in minutes

        public decimal FuelCost { get; set; } = 0;

        public decimal LaborCost { get; set; } = 0;

        public decimal TotalCost { get; set; } = 0;

        [StringLength(50)]
        public string Status { get; set; } = "planned"; // planned, active, completed, cancelled

        public DateTime PlannedDate { get; set; } = DateTime.UtcNow;

        public DateTime? StartedAt { get; set; } = null;

        public DateTime? CompletedAt { get; set; } = null;

        public string? AssignedDriver { get; set; } = string.Empty;

        public string? AssignedVehicle { get; set; } = string.Empty;

        [StringLength(500)]
        public string Notes { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;
    }

    public class RouteStop
    {
        [Required]
        public string CustomerId { get; set; } = string.Empty;

        [StringLength(100)]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        [StringLength(100)]
        public string City { get; set; } = string.Empty;

        [StringLength(100)]
        public string State { get; set; } = string.Empty;

        [StringLength(20)]
        public string PostalCode { get; set; } = string.Empty;

        public decimal Latitude { get; set; } = 0;

        public decimal Longitude { get; set; } = 0;

        public int Sequence { get; set; } = 0; // Order in the route

        public DateTime? EstimatedArrival { get; set; } = null;

        public DateTime? ActualArrival { get; set; } = null;

        public DateTime? EstimatedDeparture { get; set; } = null;

        public DateTime? ActualDeparture { get; set; } = null;

        [StringLength(50)]
        public string Status { get; set; } = "pending"; // pending, visited, completed, failed

        [StringLength(500)]
        public string? Notes { get; set; } = string.Empty;
    }
}


