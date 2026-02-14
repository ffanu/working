using MongoDB.Driver;
using InventoryAPI.Models;

namespace InventoryAPI.Services
{
    public class CustomerService
    {
        private readonly IMongoCollection<Customer> _customers;

        public CustomerService(DatabaseService databaseService)
        {
            _customers = databaseService.Customers;
        }

        public async Task<List<Customer>> GetAllAsync()
        {
            return await _customers.Find(_ => true).ToListAsync();
        }

        public async Task<(List<Customer> data, int total)> GetPagedAsync(string? search, string? sortBy, string? sortDir, int page, int pageSize)
        {
            var filter = Builders<Customer>.Filter.Empty;

            // Apply search filter if provided
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchFilter = Builders<Customer>.Filter.Or(
                    Builders<Customer>.Filter.Regex(c => c.Name, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Customer>.Filter.Regex(c => c.Email, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Customer>.Filter.Regex(c => c.Phone, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Customer>.Filter.Regex(c => c.Address, new MongoDB.Bson.BsonRegularExpression(search, "i"))
                );
                filter = searchFilter;
            }

            // Get total count
            var total = await _customers.CountDocumentsAsync(filter);

            // Apply sorting
            var sort = sortBy?.ToLower() switch
            {
                "name" => sortDir?.ToLower() == "desc" 
                    ? Builders<Customer>.Sort.Descending(c => c.Name)
                    : Builders<Customer>.Sort.Ascending(c => c.Name),
                "email" => sortDir?.ToLower() == "desc"
                    ? Builders<Customer>.Sort.Descending(c => c.Email)
                    : Builders<Customer>.Sort.Ascending(c => c.Email),
                "phone" => sortDir?.ToLower() == "desc"
                    ? Builders<Customer>.Sort.Descending(c => c.Phone)
                    : Builders<Customer>.Sort.Ascending(c => c.Phone),
                _ => sortDir?.ToLower() == "desc"
                    ? Builders<Customer>.Sort.Descending(c => c.CreatedAt)
                    : Builders<Customer>.Sort.Ascending(c => c.CreatedAt)
            };

            // Apply pagination
            var data = await _customers.Find(filter)
                .Sort(sort)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync();

            return (data, (int)total);
        }

        public async Task<Customer?> GetByIdAsync(string id)
        {
            return await _customers.Find(c => c.Id == id).FirstOrDefaultAsync();
        }

        public async Task<Customer> CreateAsync(Customer customer)
        {
            customer.CreatedAt = DateTime.UtcNow;
            customer.UpdatedAt = DateTime.UtcNow;
            await _customers.InsertOneAsync(customer);
            return customer;
        }

        public async Task<bool> UpdateAsync(string id, Customer customer)
        {
            customer.Id = id;
            customer.UpdatedAt = DateTime.UtcNow;
            var result = await _customers.ReplaceOneAsync(c => c.Id == id, customer);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _customers.DeleteOneAsync(c => c.Id == id);
            return result.DeletedCount > 0;
        }

        public async Task<List<Customer>> SearchAsync(string searchTerm)
        {
            var filter = Builders<Customer>.Filter.Or(
                Builders<Customer>.Filter.Regex(c => c.Name, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
                Builders<Customer>.Filter.Regex(c => c.Email, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i")),
                Builders<Customer>.Filter.Regex(c => c.Phone, new MongoDB.Bson.BsonRegularExpression(searchTerm, "i"))
            );
            return await _customers.Find(filter).ToListAsync();
        }
    }
} 