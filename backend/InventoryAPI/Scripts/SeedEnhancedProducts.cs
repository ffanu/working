using MongoDB.Driver;
using InventoryAPI.Models;
using InventoryAPI.Services;

namespace InventoryAPI.Scripts
{
    public class SeedEnhancedProducts
    {
        private readonly IMongoCollection<Product> _products;

        public SeedEnhancedProducts(DatabaseService databaseService)
        {
            _products = databaseService.Products;
        }

        public async Task SeedAsync()
        {
            // Clear existing products
            await _products.DeleteManyAsync(_ => true);

            var products = new List<Product>
            {
                // Electronics
                new Product
                {
                    Name = "MacBook Pro 16-inch",
                    Description = "Latest MacBook Pro with M2 Pro chip, 16GB RAM, 512GB SSD",
                    Price = 2499.99m,
                    CostPrice = 1899.99m,
                    Quantity = 45,
                    Category = "Electronics",
                    SKU = "MBP-16-M2-001",
                    Supplier = "Apple Inc.",
                    Unit = "pcs",
                    IsActive = true,
                    MinStockLevel = 10,
                    ReorderPoint = 20,
                    Barcode = "1234567890123",
                    QRCode = "https://qr.company.com/MBP-16-M2-001",
                    Location = "Electronics Warehouse",
                    Brand = "Apple",
                    Model = "MacBook Pro 16-inch M2",
                    Weight = 2.1m,
                    Dimensions = "14.0\" x 9.8\" x 0.66\"",
                    RequiresSerialNumber = true,
                    RequiresBatchTracking = false,
                    ShelfLifeDays = null,
                    StorageConditions = "Room Temperature",
                    WholesalePrice = 2199.99m,
                    RetailPrice = 2499.99m,
                    SupplierSKU = "APP-MBP16-M2-001",
                    LeadTimeDays = 14,
                    MinimumOrderQuantity = 5,
                    Tags = new List<string> { "Laptop", "Apple", "M2", "Professional" },
                    ImageUrls = new List<string> { "https://images.company.com/mbp16-m2-1.jpg" },
                    MainImageUrl = "https://images.company.com/mbp16-m2-1.jpg"
                },
                new Product
                {
                    Name = "iPhone 15 Pro",
                    Description = "Latest iPhone with A17 Pro chip, 128GB storage",
                    Price = 999.99m,
                    CostPrice = 749.99m,
                    Quantity = 120,
                    Category = "Electronics",
                    SKU = "IPH-15-PRO-001",
                    Supplier = "Apple Inc.",
                    Unit = "pcs",
                    IsActive = true,
                    MinStockLevel = 25,
                    ReorderPoint = 50,
                    Barcode = "1234567890124",
                    QRCode = "https://qr.company.com/IPH-15-PRO-001",
                    Location = "Electronics Warehouse",
                    Brand = "Apple",
                    Model = "iPhone 15 Pro",
                    Weight = 0.187m,
                    Dimensions = "5.81\" x 2.82\" x 0.32\"",
                    RequiresSerialNumber = true,
                    RequiresBatchTracking = false,
                    ShelfLifeDays = null,
                    StorageConditions = "Room Temperature",
                    WholesalePrice = 899.99m,
                    RetailPrice = 999.99m,
                    SupplierSKU = "APP-IPH15-PRO-001",
                    LeadTimeDays = 7,
                    MinimumOrderQuantity = 10,
                    Tags = new List<string> { "Smartphone", "Apple", "5G", "Camera" },
                    ImageUrls = new List<string> { "https://images.company.com/iph15-pro-1.jpg" },
                    MainImageUrl = "https://images.company.com/iph15-pro-1.jpg"
                },
                new Product
                {
                    Name = "Samsung 4K Smart TV 65\"",
                    Description = "65-inch 4K Ultra HD Smart TV with HDR",
                    Price = 899.99m,
                    CostPrice = 649.99m,
                    Quantity = 30,
                    Category = "Electronics",
                    SKU = "TV-SAM-4K-65-001",
                    Supplier = "Samsung Electronics",
                    Unit = "pcs",
                    IsActive = true,
                    MinStockLevel = 8,
                    ReorderPoint = 15,
                    Barcode = "1234567890125",
                    QRCode = "https://qr.company.com/TV-SAM-4K-65-001",
                    Location = "Electronics Warehouse",
                    Brand = "Samsung",
                    Model = "UN65TU7000",
                    Weight = 22.0m,
                    Dimensions = "57.1\" x 32.6\" x 2.4\"",
                    RequiresSerialNumber = true,
                    RequiresBatchTracking = false,
                    ShelfLifeDays = null,
                    StorageConditions = "Room Temperature",
                    WholesalePrice = 799.99m,
                    RetailPrice = 899.99m,
                    SupplierSKU = "SAM-UN65TU7000-001",
                    LeadTimeDays = 21,
                    MinimumOrderQuantity = 3,
                    Tags = new List<string> { "TV", "4K", "Smart TV", "Samsung" },
                    ImageUrls = new List<string> { "https://images.company.com/sam-tv-4k-1.jpg" },
                    MainImageUrl = "https://images.company.com/sam-tv-4k-1.jpg"
                },

                // Food & Beverages
                new Product
                {
                    Name = "Organic Bananas",
                    Description = "Fresh organic bananas, perfect for smoothies and snacks",
                    Price = 2.99m,
                    CostPrice = 1.49m,
                    Quantity = 200,
                    Category = "Food & Beverages",
                    SKU = "FOOD-BAN-ORG-001",
                    Supplier = "Fresh Farms Co.",
                    Unit = "bunch",
                    IsActive = true,
                    MinStockLevel = 50,
                    ReorderPoint = 100,
                    Barcode = "1234567890126",
                    QRCode = "https://qr.company.com/FOOD-BAN-ORG-001",
                    Location = "Cold Storage Facility",
                    Brand = "Fresh Farms",
                    Model = "Organic",
                    Weight = 0.5m,
                    Dimensions = "8\" x 4\" x 2\"",
                    RequiresSerialNumber = false,
                    RequiresBatchTracking = true,
                    ShelfLifeDays = 7,
                    StorageConditions = "Refrigerated",
                    WholesalePrice = 2.49m,
                    RetailPrice = 2.99m,
                    SupplierSKU = "FF-BAN-ORG-001",
                    LeadTimeDays = 2,
                    MinimumOrderQuantity = 20,
                    Tags = new List<string> { "Organic", "Fruits", "Fresh", "Healthy" },
                    ImageUrls = new List<string> { "https://images.company.com/bananas-1.jpg" },
                    MainImageUrl = "https://images.company.com/bananas-1.jpg"
                },
                new Product
                {
                    Name = "Greek Yogurt",
                    Description = "Creamy Greek yogurt with live cultures, 32oz container",
                    Price = 4.99m,
                    CostPrice = 2.99m,
                    Quantity = 150,
                    Category = "Food & Beverages",
                    SKU = "FOOD-YOG-GRK-001",
                    Supplier = "Dairy Delights Inc.",
                    Unit = "container",
                    IsActive = true,
                    MinStockLevel = 30,
                    ReorderPoint = 60,
                    Barcode = "1234567890127",
                    QRCode = "https://qr.company.com/FOOD-YOG-GRK-001",
                    Location = "Cold Storage Facility",
                    Brand = "Dairy Delights",
                    Model = "Greek Style",
                    Weight = 2.0m,
                    Dimensions = "4\" x 4\" x 3\"",
                    RequiresSerialNumber = false,
                    RequiresBatchTracking = true,
                    ShelfLifeDays = 21,
                    StorageConditions = "Refrigerated",
                    WholesalePrice = 4.49m,
                    RetailPrice = 4.99m,
                    SupplierSKU = "DD-YOG-GRK-001",
                    LeadTimeDays = 3,
                    MinimumOrderQuantity = 15,
                    Tags = new List<string> { "Dairy", "Greek", "Protein", "Healthy" },
                    ImageUrls = new List<string> { "https://images.company.com/yogurt-1.jpg" },
                    MainImageUrl = "https://images.company.com/yogurt-1.jpg"
                },

                // Office Supplies
                new Product
                {
                    Name = "Premium Notebook",
                    Description = "Hardcover notebook with 200 lined pages, A5 size",
                    Price = 12.99m,
                    CostPrice = 6.99m,
                    Quantity = 300,
                    Category = "Office Supplies",
                    SKU = "OFF-NTB-PRM-001",
                    Supplier = "Paper Products Ltd.",
                    Unit = "pcs",
                    IsActive = true,
                    MinStockLevel = 75,
                    ReorderPoint = 150,
                    Barcode = "1234567890128",
                    QRCode = "https://qr.company.com/OFF-NTB-PRM-001",
                    Location = "Main Distribution Center",
                    Brand = "Paper Pro",
                    Model = "Premium A5",
                    Weight = 0.3m,
                    Dimensions = "8.3\" x 5.8\" x 0.8\"",
                    RequiresSerialNumber = false,
                    RequiresBatchTracking = false,
                    ShelfLifeDays = null,
                    StorageConditions = "Room Temperature",
                    WholesalePrice = 10.99m,
                    RetailPrice = 12.99m,
                    SupplierSKU = "PP-NTB-PRM-001",
                    LeadTimeDays = 7,
                    MinimumOrderQuantity = 25,
                    Tags = new List<string> { "Notebook", "Premium", "A5", "Lined" },
                    ImageUrls = new List<string> { "https://images.company.com/notebook-1.jpg" },
                    MainImageUrl = "https://images.company.com/notebook-1.jpg"
                },
                new Product
                {
                    Name = "Wireless Mouse",
                    Description = "Ergonomic wireless mouse with 6-month battery life",
                    Price = 29.99m,
                    CostPrice = 18.99m,
                    Quantity = 200,
                    Category = "Office Supplies",
                    SKU = "OFF-MOU-WRL-001",
                    Supplier = "Tech Accessories Co.",
                    Unit = "pcs",
                    IsActive = true,
                    MinStockLevel = 50,
                    ReorderPoint = 100,
                    Barcode = "1234567890129",
                    QRCode = "https://qr.company.com/OFF-MOU-WRL-001",
                    Location = "Electronics Warehouse",
                    Brand = "Tech Pro",
                    Model = "Wireless Ergo",
                    Weight = 0.15m,
                    Dimensions = "4.5\" x 2.8\" x 1.5\"",
                    RequiresSerialNumber = false,
                    RequiresBatchTracking = false,
                    ShelfLifeDays = null,
                    StorageConditions = "Room Temperature",
                    WholesalePrice = 24.99m,
                    RetailPrice = 29.99m,
                    SupplierSKU = "TAC-MOU-WRL-001",
                    LeadTimeDays = 14,
                    MinimumOrderQuantity = 20,
                    Tags = new List<string> { "Mouse", "Wireless", "Ergonomic", "Office" },
                    ImageUrls = new List<string> { "https://images.company.com/mouse-1.jpg" },
                    MainImageUrl = "https://images.company.com/mouse-1.jpg"
                }
            };

            foreach (var product in products)
            {
                product.CreatedAt = DateTime.UtcNow;
                product.UpdatedAt = DateTime.UtcNow;
            }

            await _products.InsertManyAsync(products);
            Console.WriteLine($"Seeded {products.Count} enhanced products successfully!");
        }
    }
}
