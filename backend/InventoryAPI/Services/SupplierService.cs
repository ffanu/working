using MongoDB.Driver;
using InventoryAPI.Models;

namespace InventoryAPI.Services
{
    public class SupplierService
    {
        private readonly IMongoCollection<Supplier> _suppliers;

        public SupplierService(DatabaseService databaseService)
        {
            _suppliers = databaseService.Suppliers;
        }

        public async Task<List<Supplier>> GetAllAsync()
        {
            return await _suppliers.Find(_ => true).ToListAsync();
        }

        public async Task<(List<Supplier> data, int total)> GetPagedAsync(string? search, string? sortBy, string? sortDir, int page, int pageSize)
        {
            var filter = Builders<Supplier>.Filter.Empty;

            // Apply search filter if provided
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchFilter = Builders<Supplier>.Filter.Or(
                    Builders<Supplier>.Filter.Regex(s => s.Name, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Supplier>.Filter.Regex(s => s.ContactPerson, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Supplier>.Filter.Regex(s => s.Email, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Supplier>.Filter.Regex(s => s.Phone, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Supplier>.Filter.Regex(s => s.Address, new MongoDB.Bson.BsonRegularExpression(search, "i"))
                );
                filter = searchFilter;
            }

            // Get total count
            var total = await _suppliers.CountDocumentsAsync(filter);

            // Apply sorting
            var sort = sortBy?.ToLower() switch
            {
                "name" => sortDir?.ToLower() == "desc" 
                    ? Builders<Supplier>.Sort.Descending(s => s.Name)
                    : Builders<Supplier>.Sort.Ascending(s => s.Name),
                "contactperson" => sortDir?.ToLower() == "desc"
                    ? Builders<Supplier>.Sort.Descending(s => s.ContactPerson)
                    : Builders<Supplier>.Sort.Ascending(s => s.ContactPerson),
                "email" => sortDir?.ToLower() == "desc"
                    ? Builders<Supplier>.Sort.Descending(s => s.Email)
                    : Builders<Supplier>.Sort.Ascending(s => s.Email),
                "phone" => sortDir?.ToLower() == "desc"
                    ? Builders<Supplier>.Sort.Descending(s => s.Phone)
                    : Builders<Supplier>.Sort.Ascending(s => s.Phone),
                _ => sortDir?.ToLower() == "desc"
                    ? Builders<Supplier>.Sort.Descending(s => s.CreatedAt)
                    : Builders<Supplier>.Sort.Ascending(s => s.CreatedAt)
            };

            // Apply pagination
            var data = await _suppliers.Find(filter)
                .Sort(sort)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync();

            return (data, (int)total);
        }

        public async Task<Supplier?> GetByIdAsync(string id)
        {
            return await _suppliers.Find(s => s.Id == id).FirstOrDefaultAsync();
        }

        public async Task<Supplier> CreateAsync(Supplier supplier)
        {
            supplier.CreatedAt = DateTime.UtcNow;
            supplier.UpdatedAt = DateTime.UtcNow;
            await _suppliers.InsertOneAsync(supplier);
            return supplier;
        }

        public async Task<bool> UpdateAsync(string id, Supplier supplier)
        {
            supplier.Id = id;
            supplier.UpdatedAt = DateTime.UtcNow;
            var result = await _suppliers.ReplaceOneAsync(s => s.Id == id, supplier);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _suppliers.DeleteOneAsync(s => s.Id == id);
            return result.DeletedCount > 0;
        }

        public async Task<List<Supplier>> SearchAsync(string searchTerm)
        {
            var filter = Builders<Supplier>.Filter.Or(
                Builders<Supplier>.Filter.Regex(s => s.Name, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
                Builders<Supplier>.Filter.Regex(s => s.ContactPerson, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
                Builders<Supplier>.Filter.Regex(s => s.Email, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i"))
            );
            return await _suppliers.Find(filter).ToListAsync();
        }
    }
} 