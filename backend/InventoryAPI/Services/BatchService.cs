using MongoDB.Driver;
using InventoryAPI.Models;

namespace InventoryAPI.Services
{
    public class BatchService
    {
        private readonly IMongoCollection<Batch> _batches;
        private readonly IMongoCollection<Product> _products;

        public BatchService(DatabaseService databaseService)
        {
            _batches = databaseService.Batches;
            _products = databaseService.Products;
        }

        public async Task<List<Batch>> GetAllAsync()
        {
            return await _batches.Find(b => true).ToListAsync();
        }

        public async Task<Batch?> GetByIdAsync(string id)
        {
            return await _batches.Find(b => b.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<Batch>> GetByProductIdAsync(string productId)
        {
            return await _batches.Find(b => b.ProductId == productId).ToListAsync();
        }

        public async Task<List<Batch>> GetExpiringSoonAsync(int daysThreshold = 30)
        {
            var thresholdDate = DateTime.UtcNow.AddDays(daysThreshold);
            return await _batches.Find(b => 
                b.ExpiryDate.HasValue && 
                b.ExpiryDate <= thresholdDate && 
                b.CurrentQuantity > 0).ToListAsync();
        }

        public async Task<List<Batch>> GetExpiredAsync()
        {
            return await _batches.Find(b => 
                b.ExpiryDate.HasValue && 
                b.ExpiryDate < DateTime.UtcNow && 
                b.CurrentQuantity > 0).ToListAsync();
        }

        public async Task<List<Batch>> GetLowStockAsync(int threshold = 5)
        {
            return await _batches.Find(b => b.CurrentQuantity <= threshold).ToListAsync();
        }

        public async Task<Batch> CreateAsync(Batch batch)
        {
            batch.CreatedAt = DateTime.UtcNow;
            batch.UpdatedAt = DateTime.UtcNow;
            
            // Get product details
            var product = await _products.Find(p => p.Id == batch.ProductId).FirstOrDefaultAsync();
            if (product != null)
            {
                batch.ProductName = product.Name;
                batch.ProductSKU = product.SKU;
            }

            await _batches.InsertOneAsync(batch);
            return batch;
        }

        public async Task<bool> UpdateAsync(string id, Batch batch)
        {
            batch.UpdatedAt = DateTime.UtcNow;
            var result = await _batches.ReplaceOneAsync(b => b.Id == id, batch);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _batches.DeleteOneAsync(b => b.Id == id);
            return result.DeletedCount > 0;
        }

        public async Task<bool> UpdateQuantityAsync(string id, int quantityChange)
        {
            var batch = await GetByIdAsync(id);
            if (batch == null) return false;

            batch.CurrentQuantity = Math.Max(0, batch.CurrentQuantity + quantityChange);
            batch.UpdatedAt = DateTime.UtcNow;

            var update = Builders<Batch>.Update
                .Set(b => b.CurrentQuantity, batch.CurrentQuantity)
                .Set(b => b.UpdatedAt, batch.UpdatedAt);

            var result = await _batches.UpdateOneAsync(b => b.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<List<Batch>> SearchAsync(string searchTerm)
        {
            var filter = Builders<Batch>.Filter.Or(
                Builders<Batch>.Filter.Regex(b => b.BatchNumber, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
                Builders<Batch>.Filter.Regex(b => b.LotNumber, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
                Builders<Batch>.Filter.Regex(b => b.ProductName, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
                Builders<Batch>.Filter.Regex(b => b.Supplier, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i"))
            );

            return await _batches.Find(filter).ToListAsync();
        }

        public async Task<object> GetPagedAsync(string? search = null, string? sortBy = null, string? sortDir = "asc", int page = 1, int pageSize = 20)
        {
            var filter = Builders<Batch>.Filter.Empty;

            if (!string.IsNullOrEmpty(search))
            {
                filter = Builders<Batch>.Filter.Or(
                    Builders<Batch>.Filter.Regex(b => b.BatchNumber, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Batch>.Filter.Regex(b => b.LotNumber, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Batch>.Filter.Regex(b => b.ProductName, new MongoDB.Bson.BsonRegularExpression(search, "i"))
                );
            }

            var sort = sortBy switch
            {
                "batchNumber" => sortDir == "desc" ? Builders<Batch>.Sort.Descending(b => b.BatchNumber) : Builders<Batch>.Sort.Ascending(b => b.BatchNumber),
                "expiryDate" => sortDir == "desc" ? Builders<Batch>.Sort.Descending(b => b.ExpiryDate) : Builders<Batch>.Sort.Ascending(b => b.ExpiryDate),
                "currentQuantity" => sortDir == "desc" ? Builders<Batch>.Sort.Descending(b => b.CurrentQuantity) : Builders<Batch>.Sort.Ascending(b => b.CurrentQuantity),
                _ => Builders<Batch>.Sort.Descending(b => b.CreatedAt)
            };

            var total = await _batches.CountDocumentsAsync(filter);
            var batches = await _batches.Find(filter)
                .Sort(sort)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync();

            return new { data = batches, total };
        }
    }
}


