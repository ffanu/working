using MongoDB.Driver;
using InventoryAPI.Models;
using InventoryAPI.Services;

namespace InventoryAPI.Scripts
{
    public class SeedWarehouseStocks
    {
        private readonly DatabaseService _databaseService;
        private readonly ProductService _productService;
        private readonly WarehouseService _warehouseService;
        private readonly WarehouseStockService _warehouseStockService;

        public SeedWarehouseStocks(
            DatabaseService databaseService, 
            ProductService productService, 
            WarehouseService warehouseService,
            WarehouseStockService warehouseStockService)
        {
            _databaseService = databaseService;
            _productService = productService;
            _warehouseService = warehouseService;
            _warehouseStockService = warehouseStockService;
        }

        public async Task SeedAsync()
        {
            try
            {
                Console.WriteLine("🌱 Seeding warehouse stocks...");

                // Get all products and warehouses
                var products = await _productService.GetAllAsync();
                var warehouses = await _warehouseService.GetActiveAsync();

                if (!products.Any() || !warehouses.Any())
                {
                    Console.WriteLine("❌ No products or warehouses found. Please seed them first.");
                    return;
                }

                var random = new Random();
                var warehouseStocks = new List<WarehouseStock>();

                // Create warehouse stock entries for each product in each warehouse
                foreach (var product in products)
                {
                    foreach (var warehouse in warehouses)
                    {
                        // Randomly decide if this product exists in this warehouse (80% chance)
                        if (random.NextDouble() < 0.8)
                        {
                            var availableQuantity = random.Next(0, 100); // 0-99 items
                            var reservedQuantity = random.Next(0, Math.Max(0, availableQuantity / 4)); // 0-25% reserved
                            var averageCost = product.Price * (decimal)(0.6 + random.NextDouble() * 0.4); // 60-100% of selling price

                            var warehouseStock = new WarehouseStock
                            {
                                ProductId = product.Id!,
                                ProductName = product.Name,
                                ProductSKU = product.SKU,
                                WarehouseId = warehouse.Id!,
                                WarehouseName = warehouse.Name,
                                AvailableQuantity = availableQuantity,
                                ReservedQuantity = reservedQuantity,
                                AverageCost = averageCost,
                                Location = $"Aisle {random.Next(1, 20)}-{random.Next(1, 10)}",
                                CreatedBy = "System",
                                CreatedAt = DateTime.UtcNow,
                                LastUpdated = DateTime.UtcNow
                            };

                            warehouseStocks.Add(warehouseStock);
                        }
                    }
                }

                // Insert warehouse stocks in batches
                const int batchSize = 100;
                for (int i = 0; i < warehouseStocks.Count; i += batchSize)
                {
                    var batch = warehouseStocks.Skip(i).Take(batchSize);
                    await _databaseService.WarehouseStocks.InsertManyAsync(batch);
                    Console.WriteLine($"📦 Inserted batch {i / batchSize + 1} of warehouse stocks");
                }

                Console.WriteLine($"✅ Successfully seeded {warehouseStocks.Count} warehouse stock entries");
                Console.WriteLine($"   - Products: {products.Count}");
                Console.WriteLine($"   - Warehouses: {warehouses.Count}");
                Console.WriteLine($"   - Average stocks per product: {warehouseStocks.Count / (double)products.Count:F1}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error seeding warehouse stocks: {ex.Message}");
                throw;
            }
        }

        public async Task ClearAllAsync()
        {
            try
            {
                Console.WriteLine("🗑️ Clearing all warehouse stocks...");
                await _databaseService.WarehouseStocks.DeleteManyAsync(_ => true);
                Console.WriteLine("✅ All warehouse stocks cleared");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error clearing warehouse stocks: {ex.Message}");
                throw;
            }
        }
    }
}
