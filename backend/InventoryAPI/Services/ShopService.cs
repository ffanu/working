using MongoDB.Driver;
using InventoryAPI.Models;

namespace InventoryAPI.Services
{
    public class ShopService
    {
        private readonly IMongoCollection<Shop> _shops;

        public ShopService(DatabaseService databaseService)
        {
            _shops = databaseService.Shops;
        }

        public async Task<List<Shop>> GetAllAsync()
        {
            return await _shops.Find(shop => shop.IsActive).ToListAsync();
        }

        public async Task<Shop?> GetByIdAsync(string id)
        {
            return await _shops.Find(shop => shop.Id == id && shop.IsActive).FirstOrDefaultAsync();
        }

        public async Task<Shop?> GetByCodeAsync(string code)
        {
            return await _shops.Find(shop => shop.Code == code && shop.IsActive).FirstOrDefaultAsync();
        }

        public async Task<Shop> CreateAsync(Shop shop)
        {
            await _shops.InsertOneAsync(shop);
            return shop;
        }

        public async Task<Shop?> UpdateAsync(string id, Shop shop)
        {
            shop.UpdatedAt = DateTime.UtcNow;
            var result = await _shops.ReplaceOneAsync(s => s.Id == id, shop);
            return result.IsAcknowledged ? shop : null;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _shops.DeleteOneAsync(shop => shop.Id == id);
            return result.IsAcknowledged && result.DeletedCount > 0;
        }

        public async Task<List<Shop>> GetActiveShopsAsync()
        {
            return await _shops.Find(shop => shop.IsActive).ToListAsync();
        }

        public async Task<Shop?> GetMainBranchAsync()
        {
            return await _shops.Find(shop => shop.IsMainBranch && shop.IsActive).FirstOrDefaultAsync();
        }
    }
}
