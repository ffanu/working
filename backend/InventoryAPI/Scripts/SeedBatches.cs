using MongoDB.Driver;
using InventoryAPI.Models;
using InventoryAPI.Services;

namespace InventoryAPI.Scripts
{
    public class SeedBatches
    {
        private readonly IMongoCollection<Batch> _batches;
        private readonly IMongoCollection<Product> _products;

        public SeedBatches(DatabaseService databaseService)
        {
            _batches = databaseService.Batches;
            _products = databaseService.Products;
        }

        public async Task SeedAsync()
        {
            // Clear existing batches
            await _batches.DeleteManyAsync(_ => true);

            // Get some products to create batches for
            var products = await _products.Find(_ => true).Limit(10).ToListAsync();
            
            if (!products.Any())
            {
                Console.WriteLine("No products found. Please seed products first.");
                return;
            }

            var batches = new List<Batch>();
            var random = new Random();

            foreach (var product in products)
            {
                // Create 2-3 batches per product
                var batchCount = random.Next(2, 4);
                
                for (int i = 0; i < batchCount; i++)
                {
                    var manufactureDate = DateTime.UtcNow.AddDays(-random.Next(30, 365));
                    var expiryDate = manufactureDate.AddDays(random.Next(180, 730)); // 6 months to 2 years
                    
                    var batch = new Batch
                    {
                        ProductId = product.Id!,
                        ProductName = product.Name,
                        ProductSKU = product.SKU,
                        BatchNumber = $"BATCH-{product.SKU}-{DateTime.Now:yyyyMMdd}-{i + 1:D3}",
                        LotNumber = $"LOT-{product.SKU}-{DateTime.Now:yyyyMMdd}",
                        ManufactureDate = manufactureDate,
                        ExpiryDate = expiryDate,
                        InitialQuantity = random.Next(50, 500),
                        CurrentQuantity = random.Next(10, 200),
                        UnitCost = Math.Round(product.CostPrice * (0.8m + (decimal)(random.NextDouble() * 0.4)), 2), // Vary cost by ±20%
                        TotalCost = 0, // Will be calculated
                        Supplier = $"Supplier {random.Next(1, 6)}",
                        SupplierInvoice = $"INV-{DateTime.Now:yyyyMMdd}-{random.Next(1000, 9999)}",
                        Location = "Main Distribution Center",
                        Status = "Active",
                        Notes = $"Batch {i + 1} for {product.Name}",
                        CreatedBy = "System"
                    };

                    batch.TotalCost = batch.UnitCost * batch.InitialQuantity;
                    batches.Add(batch);
                }
            }

            foreach (var batch in batches)
            {
                batch.CreatedAt = DateTime.UtcNow;
                batch.UpdatedAt = DateTime.UtcNow;
            }

            await _batches.InsertManyAsync(batches);
            Console.WriteLine($"Seeded {batches.Count} batches successfully!");
        }
    }
}
