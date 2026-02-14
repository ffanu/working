using MongoDB.Driver;
using InventoryAPI.Models;

namespace InventoryAPI.Services
{
    public class WarehouseService
    {
        private readonly IMongoCollection<Warehouse> _warehouses;

        public WarehouseService(DatabaseService databaseService)
        {
            _warehouses = databaseService.Warehouses;
        }

        public async Task<List<Warehouse>> GetAllAsync()
        {
            return await _warehouses.Find(w => w.IsActive).ToListAsync();
        }

        public async Task<Warehouse?> GetByIdAsync(string id)
        {
            return await _warehouses.Find(w => w.Id == id && w.IsActive).FirstOrDefaultAsync();
        }

        public async Task<Warehouse?> GetDefaultAsync()
        {
            return await _warehouses.Find(w => w.IsDefault && w.IsActive).FirstOrDefaultAsync();
        }

        public async Task<List<Warehouse>> GetActiveAsync()
        {
            return await _warehouses.Find(w => w.Status == "Active" && w.IsActive).ToListAsync();
        }

        public async Task<List<Warehouse>> GetByShopIdAsync(string shopId)
        {
            return await _warehouses.Find(w => w.ShopId == shopId && w.IsActive).ToListAsync();
        }

        public async Task<List<Warehouse>> GetActiveByShopIdAsync(string shopId)
        {
            return await _warehouses.Find(w => w.ShopId == shopId && w.Status == "Active" && w.IsActive).ToListAsync();
        }

        public async Task<Warehouse> CreateAsync(Warehouse warehouse)
        {
            warehouse.CreatedAt = DateTime.UtcNow;
            warehouse.UpdatedAt = DateTime.UtcNow;
            
            // If this is the first warehouse, make it default
            var existingCount = await _warehouses.CountDocumentsAsync(w => w.IsActive);
            if (existingCount == 0)
            {
                warehouse.IsDefault = true;
            }
            
            // If setting as default, unset other defaults
            if (warehouse.IsDefault)
            {
                var update = Builders<Warehouse>.Update.Set(w => w.IsDefault, false);
                await _warehouses.UpdateManyAsync(w => w.IsActive, update);
            }

            await _warehouses.InsertOneAsync(warehouse);
            return warehouse;
        }

        public async Task<bool> UpdateAsync(string id, Warehouse warehouse)
        {
            warehouse.UpdatedAt = DateTime.UtcNow;
            
            // If setting as default, unset other defaults
            if (warehouse.IsDefault)
            {
                var update = Builders<Warehouse>.Update.Set(w => w.IsDefault, false);
                await _warehouses.UpdateManyAsync(w => w.Id != id && w.IsActive, update);
            }

            var result = await _warehouses.ReplaceOneAsync(w => w.Id == id, warehouse);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var update = Builders<Warehouse>.Update.Set(w => w.IsActive, false);
            var result = await _warehouses.UpdateOneAsync(w => w.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> SetDefaultAsync(string id)
        {
            // Unset all other defaults
            var updateAll = Builders<Warehouse>.Update.Set(w => w.IsDefault, false);
            await _warehouses.UpdateManyAsync(w => w.IsActive, updateAll);
            
            // Set this one as default
            var update = Builders<Warehouse>.Update.Set(w => w.IsDefault, true);
            var result = await _warehouses.UpdateOneAsync(w => w.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<List<Warehouse>> SearchAsync(string searchTerm)
        {
            var filter = Builders<Warehouse>.Filter.Or(
                Builders<Warehouse>.Filter.Regex(w => w.Name, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
                Builders<Warehouse>.Filter.Regex(w => w.Address, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
                Builders<Warehouse>.Filter.Regex(w => w.City, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
                Builders<Warehouse>.Filter.Regex(w => w.ContactPerson, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i"))
            );

            return await _warehouses.Find(filter).ToListAsync();
        }

        public async Task<object> GetPagedAsync(string? search = null, string? sortBy = null, string? sortDir = "asc", int page = 1, int pageSize = 20)
        {
            var filter = Builders<Warehouse>.Filter.Eq(w => w.IsActive, true);

            if (!string.IsNullOrEmpty(search))
            {
                filter = Builders<Warehouse>.Filter.And(
                    filter,
                    Builders<Warehouse>.Filter.Or(
                        Builders<Warehouse>.Filter.Regex(w => w.Name, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                        Builders<Warehouse>.Filter.Regex(w => w.Address, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                        Builders<Warehouse>.Filter.Regex(w => w.City, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                        Builders<Warehouse>.Filter.Regex(w => w.ContactPerson, new MongoDB.Bson.BsonRegularExpression(search, "i"))
                    )
                );
            }

            var sort = sortBy switch
            {
                "name" => sortDir == "desc" ? Builders<Warehouse>.Sort.Descending(w => w.Name) : Builders<Warehouse>.Sort.Ascending(w => w.Name),
                "city" => sortDir == "desc" ? Builders<Warehouse>.Sort.Descending(w => w.City) : Builders<Warehouse>.Sort.Ascending(w => w.City),
                "status" => sortDir == "desc" ? Builders<Warehouse>.Sort.Descending(w => w.Status) : Builders<Warehouse>.Sort.Ascending(w => w.Status),
                _ => Builders<Warehouse>.Sort.Descending(w => w.CreatedAt)
            };

            var total = await _warehouses.CountDocumentsAsync(filter);
            var warehouses = await _warehouses.Find(filter)
                .Sort(sort)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync();

            return new { data = warehouses, total };
        }

        // Method for seeding - hard delete all warehouses
        public async Task HardDeleteAllAsync()
        {
            await _warehouses.DeleteManyAsync(_ => true);
        }
    }
}
