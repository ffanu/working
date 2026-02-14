using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace InventoryApp.Models
{
    public class InstallmentPlanProduct
    {
        [BsonElement("productId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string ProductId { get; set; } = string.Empty;
        
        [BsonElement("name")]
        public string Name { get; set; } = string.Empty;
        
        [BsonElement("price")]
        public decimal Price { get; set; }
        
        [BsonElement("quantity")]
        public int Quantity { get; set; }
        
        [BsonElement("category")]
        public string Category { get; set; } = string.Empty;
        
        [BsonElement("description")]
        public string Description { get; set; } = string.Empty;
        
        // Computed property
        [BsonIgnore]
        public decimal TotalPrice => Price * Quantity;
    }
}


