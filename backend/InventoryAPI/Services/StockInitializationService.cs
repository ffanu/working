 using MongoDB.Driver;
using InventoryAPI.Models;

namespace InventoryAPI.Services
{
    public class StockInitializationService
    {
        private readonly IMongoCollection<WarehouseStock> _warehouseStocks;
        private readonly IMongoCollection<Product> _products;
        private readonly IMongoCollection<Warehouse> _warehouses;
        private readonly IMongoCollection<Shop> _shops;

        public StockInitializationService(DatabaseService databaseService)
        {
            _warehouseStocks = databaseService.WarehouseStocks;
            _products = databaseService.Products;
            _warehouses = databaseService.Warehouses;
            _shops = databaseService.Shops;
        }

        /// <summary>
        /// Initialize warehouse stock for all products in all warehouses
        /// </summary>
        public async Task InitializeWarehouseStocksAsync()
        {
            var products = await _products.Find(_ => true).ToListAsync();
            var warehouses = await _warehouses.Find(_ => true).ToListAsync();

            foreach (var product in products)
            {
                foreach (var warehouse in warehouses)
                {
                    // Check if stock record already exists
                    var existingStock = await _warehouseStocks
                        .Find(ws => ws.ProductId == product.Id && ws.WarehouseId == warehouse.Id)
                        .FirstOrDefaultAsync();

                    if (existingStock == null)
                    {
                        // Create initial stock record
                        var warehouseStock = new WarehouseStock
                        {
                            ProductId = product.Id!,
                            ProductName = product.Name,
                            ProductSKU = product.SKU,
                            WarehouseId = warehouse.Id!,
                            WarehouseName = warehouse.Name,
                            AvailableQuantity = 0, // Start with 0, will be updated via purchases/transfers
                            ReservedQuantity = 0,
                            AverageCost = product.CostPrice,
                            Location = warehouse.Address ?? "Main Location",
                            CreatedBy = "System",
                            CreatedAt = DateTime.UtcNow,
                            LastUpdated = DateTime.UtcNow
                        };

                        await _warehouseStocks.InsertOneAsync(warehouseStock);
                        Console.WriteLine($"Created warehouse stock for {product.Name} in {warehouse.Name}");
                    }
                }
            }
        }

        /// <summary>
        /// Initialize shop stock for all products in all shops
        /// </summary>
        public async Task InitializeShopStocksAsync()
        {
            var products = await _products.Find(_ => true).ToListAsync();
            var shops = await _shops.Find(_ => true).ToListAsync();

            foreach (var product in products)
            {
                foreach (var shop in shops)
                {
                    // Check if stock record already exists
                    var existingStock = await _warehouseStocks
                        .Find(ws => ws.ProductId == product.Id && ws.WarehouseId == shop.Id)
                        .FirstOrDefaultAsync();

                    if (existingStock == null)
                    {
                        // Create initial shop stock record
                        var shopStock = new WarehouseStock
                        {
                            ProductId = product.Id!,
                            ProductName = product.Name,
                            ProductSKU = product.SKU,
                            WarehouseId = shop.Id!, // Using shop ID as warehouse ID for simplicity
                            WarehouseName = shop.Name,
                            AvailableQuantity = 0, // Start with 0, will be updated via transfers/sales
                            ReservedQuantity = 0,
                            AverageCost = product.CostPrice,
                            Location = shop.Address ?? "Shop Location",
                            CreatedBy = "System",
                            CreatedAt = DateTime.UtcNow,
                            LastUpdated = DateTime.UtcNow
                        };

                        await _warehouseStocks.InsertOneAsync(shopStock);
                        Console.WriteLine($"Created shop stock for {product.Name} in {shop.Name}");
                    }
                }
            }
        }

        /// <summary>
        /// Update stock when a purchase is received
        /// </summary>
        public async Task UpdateStockOnPurchaseAsync(string productId, string warehouseId, int quantity, decimal unitCost)
        {
            var stock = await _warehouseStocks
                .Find(ws => ws.ProductId == productId && ws.WarehouseId == warehouseId)
                .FirstOrDefaultAsync();

            if (stock != null)
            {
                // Update average cost using weighted average
                var totalCost = (stock.AvailableQuantity * stock.AverageCost) + (quantity * unitCost);
                var totalQuantity = stock.AvailableQuantity + quantity;
                stock.AverageCost = totalQuantity > 0 ? totalCost / totalQuantity : unitCost;

                // Update quantities
                stock.AvailableQuantity += quantity;
                stock.LastUpdated = DateTime.UtcNow;

                await _warehouseStocks.ReplaceOneAsync(ws => ws.Id == stock.Id, stock);
                Console.WriteLine($"Updated warehouse stock: {productId} in {warehouseId} +{quantity}");
            }
        }

        /// <summary>
        /// Transfer stock from warehouse to shop
        /// </summary>
        public async Task TransferStockAsync(string productId, string fromWarehouseId, string toShopId, int quantity)
        {
            // Reduce warehouse stock
            var warehouseStock = await _warehouseStocks
                .Find(ws => ws.ProductId == productId && ws.WarehouseId == fromWarehouseId)
                .FirstOrDefaultAsync();

            if (warehouseStock != null && warehouseStock.AvailableQuantity >= quantity)
            {
                warehouseStock.AvailableQuantity -= quantity;
                warehouseStock.LastUpdated = DateTime.UtcNow;
                await _warehouseStocks.ReplaceOneAsync(ws => ws.Id == warehouseStock.Id, warehouseStock);

                // Increase shop stock
                var shopStock = await _warehouseStocks
                    .Find(ws => ws.ProductId == productId && ws.WarehouseId == toShopId)
                    .FirstOrDefaultAsync();

                if (shopStock != null)
                {
                    // Update existing shop stock
                    shopStock.AvailableQuantity += quantity;
                    shopStock.AverageCost = warehouseStock.AverageCost; // Transfer at same cost
                    shopStock.LastUpdated = DateTime.UtcNow;
                    await _warehouseStocks.ReplaceOneAsync(ws => ws.Id == shopStock.Id, shopStock);

                    Console.WriteLine($"Transferred {quantity} units of {productId} from {fromWarehouseId} to {toShopId}");
                }
                else
                {
                    // Create new shop stock entry
                    var newShopStock = new WarehouseStock
                    {
                        ProductId = productId,
                        ProductName = warehouseStock.ProductName,
                        ProductSKU = warehouseStock.ProductSKU,
                        WarehouseId = toShopId,
                        WarehouseName = await GetLocationNameAsync(toShopId),
                        AvailableQuantity = quantity,
                        ReservedQuantity = 0,
                        AverageCost = warehouseStock.AverageCost,
                        Location = "Default Location",
                        LastUpdated = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = "System"
                    };
                    await _warehouseStocks.InsertOneAsync(newShopStock);

                    Console.WriteLine($"Created new stock entry and transferred {quantity} units of {productId} from {fromWarehouseId} to {toShopId}");
                }
            }
        }

        /// <summary>
        /// Update stock when a sale is made
        /// </summary>
        public async Task UpdateStockOnSaleAsync(string productId, string shopId, int quantity)
        {
            var stock = await _warehouseStocks
                .Find(ws => ws.ProductId == productId && ws.WarehouseId == shopId)
                .FirstOrDefaultAsync();

            if (stock != null && stock.AvailableQuantity >= quantity)
            {
                stock.AvailableQuantity -= quantity;
                stock.LastUpdated = DateTime.UtcNow;
                await _warehouseStocks.ReplaceOneAsync(ws => ws.Id == stock.Id, stock);
                Console.WriteLine($"Updated shop stock: {productId} in {shopId} -{quantity}");
            }
        }

        /// <summary>
        /// Get stock summary for a specific location
        /// </summary>
        public async Task<object> GetStockSummaryAsync(string locationId, bool isWarehouse = true)
        {
            var stocks = await _warehouseStocks
                .Find(ws => ws.WarehouseId == locationId)
                .ToListAsync();

            var totalProducts = stocks.Count;
            var totalQuantity = stocks.Sum(s => s.AvailableQuantity);
            var totalValue = stocks.Sum(s => s.AvailableQuantity * s.AverageCost);
            var lowStockItems = stocks.Count(s => s.AvailableQuantity <= 5);
            var outOfStockItems = stocks.Count(s => s.AvailableQuantity == 0);

            return new
            {
                locationId,
                locationType = isWarehouse ? "Warehouse" : "Shop",
                totalProducts,
                totalQuantity,
                totalValue,
                lowStockItems,
                outOfStockItems,
                stocks = stocks.OrderBy(s => s.ProductName).ToList()
            };
        }

        /// <summary>
        /// Get location name by ID (checks both warehouses and shops)
        /// </summary>
        private async Task<string> GetLocationNameAsync(string locationId)
        {
            // Try to find in warehouses first
            var warehouse = await _warehouses
                .Find(w => w.Id == locationId)
                .FirstOrDefaultAsync();
            
            if (warehouse != null)
                return warehouse.Name;
            
            // Try to find in shops
            var shop = await _shops
                .Find(s => s.Id == locationId)
                .FirstOrDefaultAsync();
            
            if (shop != null)
                return shop.Name;
            
            return "Unknown Location";
        }
    }
}
