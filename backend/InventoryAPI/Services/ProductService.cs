using MongoDB.Driver;
using InventoryAPI.Models;

namespace InventoryAPI.Services
{
    public class ProductService
    {
        private readonly IMongoCollection<Product> _products;

        public ProductService(DatabaseService databaseService)
        {
            _products = databaseService.Products;
        }

        public async Task<List<Product>> GetAllAsync()
        {
            return await _products.Find(p => p.IsActive).ToListAsync();
        }

        public async Task<Product?> GetByIdAsync(string id)
        {
            return await _products.Find(p => p.Id == id && p.IsActive).FirstOrDefaultAsync();
        }

        public async Task<Product> CreateAsync(Product product)
        {
            product.CreatedAt = DateTime.UtcNow;
            product.UpdatedAt = DateTime.UtcNow;
            await _products.InsertOneAsync(product);
            return product;
        }

        public async Task<bool> UpdateAsync(string id, Product product)
        {
            product.UpdatedAt = DateTime.UtcNow;
            var result = await _products.ReplaceOneAsync(p => p.Id == id, product);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var update = Builders<Product>.Update.Set(p => p.IsActive, false);
            var result = await _products.UpdateOneAsync(p => p.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<List<Product>> SearchAsync(string searchTerm)
        {
            var filter = Builders<Product>.Filter.And(
                Builders<Product>.Filter.Eq(p => p.IsActive, true),
                Builders<Product>.Filter.Or(
                    Builders<Product>.Filter.Regex(p => p.Name, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
                    Builders<Product>.Filter.Regex(p => p.SKU, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
                    Builders<Product>.Filter.Regex(p => p.Category, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i"))
                )
            );
            return await _products.Find(filter).ToListAsync();
        }

        public async Task<bool> UpdateStockAsync(string id, int quantity)
        {
            var update = Builders<Product>.Update
                .Inc(p => p.Quantity, quantity)
                .Set(p => p.UpdatedAt, DateTime.UtcNow);
            var result = await _products.UpdateOneAsync(p => p.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<(List<Product> Data, long Total)> GetPagedAsync(string? search, string? sortBy, string? sortDir, int page, int pageSize)
        {
            var filter = Builders<Product>.Filter.Eq(p => p.IsActive, true);
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchFilter = Builders<Product>.Filter.Or(
                    Builders<Product>.Filter.Regex(p => p.Name, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Product>.Filter.Regex(p => p.SKU, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Product>.Filter.Regex(p => p.Category, new MongoDB.Bson.BsonRegularExpression(search, "i"))
                );
                filter = Builders<Product>.Filter.And(filter, searchFilter);
            }

            var sortBuilder = Builders<Product>.Sort;
            var sort = sortBy?.ToLower() switch
            {
                "name" => sortDir == "desc" ? sortBuilder.Descending(p => p.Name) : sortBuilder.Ascending(p => p.Name),
                "price" => sortDir == "desc" ? sortBuilder.Descending(p => p.Price) : sortBuilder.Ascending(p => p.Price),
                "category" => sortDir == "desc" ? sortBuilder.Descending(p => p.Category) : sortBuilder.Ascending(p => p.Category),
                _ => sortDir == "desc" ? sortBuilder.Descending(p => p.CreatedAt) : sortBuilder.Ascending(p => p.CreatedAt),
            };

            var total = await _products.CountDocumentsAsync(filter);
            var data = await _products.Find(filter)
                .Sort(sort)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync();
            return (data, total);
        }
    }
} 