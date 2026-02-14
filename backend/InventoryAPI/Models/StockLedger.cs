using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace InventoryAPI.Models
{
    public class StockLedger
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string ProductId { get; set; } = string.Empty;

        [Required]
        public string ProductName { get; set; } = string.Empty;

        [Required]
        public string ProductSKU { get; set; } = string.Empty;

        public DateTime Date { get; set; }

        public int OpeningStock { get; set; }
        public int StockIn { get; set; }
        public int StockOut { get; set; }
        public int ClosingStock { get; set; }

        public decimal OpeningValue { get; set; }
        public decimal StockInValue { get; set; }
        public decimal StockOutValue { get; set; }
        public decimal ClosingValue { get; set; }

        public decimal AverageCost { get; set; }

        [StringLength(100)]
        public string Location { get; set; } = "Main Warehouse";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property (not stored in MongoDB)
        [BsonIgnore]
        public Product? Product { get; set; }
    }
} 