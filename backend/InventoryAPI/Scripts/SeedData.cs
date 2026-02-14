using InventoryAPI.Models;
using InventoryAPI.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InventoryAPI.Scripts
{
    public class SeedData
    {
        private readonly ProductService _productService;
        private readonly CustomerService _customerService;
        private readonly SupplierService _supplierService;
        private readonly PurchaseService _purchaseService;
        private readonly SaleService _saleService;

        public SeedData(
            ProductService productService,
            CustomerService customerService,
            SupplierService supplierService,
            PurchaseService purchaseService,
            SaleService saleService)
        {
            _productService = productService;
            _customerService = customerService;
            _supplierService = supplierService;
            _purchaseService = purchaseService;
            _saleService = saleService;
        }

        public async Task SeedAllData()
        {
            Console.WriteLine("Starting enhanced data seeding...");

            // Seed suppliers first
            var suppliers = await SeedSuppliers();
            Console.WriteLine($"Created {suppliers.Count} suppliers");

            // Seed customers
            var customers = await SeedCustomers();
            Console.WriteLine($"Created {customers.Count} customers");

            // Seed products with realistic inventory levels
            var products = await SeedProducts(suppliers);
            Console.WriteLine($"Created {products.Count} products");

            // Seed purchases with realistic patterns
            var purchases = await SeedPurchases(suppliers, products);
            Console.WriteLine($"Created {purchases.Count} purchases");

            // Seed sales with realistic business patterns
            var sales = await SeedSales(customers, products);
            Console.WriteLine($"Created {sales.Count} sales");

            Console.WriteLine("Enhanced data seeding completed successfully!");
        }

        private async Task<List<Supplier>> SeedSuppliers()
        {
            var suppliers = new List<Supplier>();
            var supplierNames = new[]
            {
                "TechCorp Industries", "Global Electronics", "Premium Supplies Co", "Quality Parts Ltd", "Innovation Tech",
                "Digital Solutions Inc", "Smart Devices Corp", "Future Tech Systems", "Advanced Components", "Elite Electronics",
                "ProTech Solutions", "Mega Supplies", "TechWorld Inc", "Digital Dynamics", "Smart Solutions",
                "Innovation Labs", "Tech Masters", "Digital Experts", "Smart Systems", "Future Solutions",
                "Advanced Tech", "Elite Systems", "Pro Solutions", "Mega Tech", "Tech Dynamics",
                "Digital Masters", "Smart Experts", "Innovation Systems", "Tech Solutions", "Digital Labs",
                "Smart Masters", "Future Experts", "Advanced Systems", "Elite Solutions", "Pro Tech",
                "Mega Dynamics", "Tech Masters", "Digital Systems", "Smart Solutions", "Innovation Tech",
                "Future Dynamics", "Advanced Masters", "Elite Experts", "Pro Systems", "Mega Solutions",
                "Tech Labs", "Digital Tech", "Smart Dynamics", "Innovation Masters", "Future Systems", "Advanced Solutions"
            };

            for (int i = 0; i < supplierNames.Length; i++)
            {
                var supplier = new Supplier
                {
                    Name = supplierNames[i],
                    Email = $"contact@{supplierNames[i].ToLower().Replace(" ", "").Replace(".", "").Replace(",", "")}.com",
                    Phone = $"+1-555-{1000 + i:D4}",
                    Address = $"{100 + i} Business St, Suite {i + 1}, Tech City, TC {10000 + i}",
                    Status = i % 10 == 0 ? "Inactive" : "Active",
                    CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 365)),
                    UpdatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 30)),
                    IsActive = i % 10 != 0
                };

                var createdSupplier = await _supplierService.CreateAsync(supplier);
                suppliers.Add(createdSupplier);
            }

            return suppliers;
        }

        private async Task<List<Customer>> SeedCustomers()
        {
            var customers = new List<Customer>();
            var customerNames = new[]
            {
                "John Smith", "Sarah Johnson", "Michael Brown", "Emily Davis", "David Wilson",
                "Lisa Anderson", "Robert Taylor", "Jennifer Martinez", "William Garcia", "Amanda Rodriguez",
                "James Lopez", "Michelle White", "Christopher Lee", "Jessica Hall", "Daniel Allen",
                "Ashley Young", "Matthew King", "Nicole Wright", "Joshua Green", "Stephanie Baker",
                "Andrew Adams", "Rachel Nelson", "Kevin Carter", "Lauren Mitchell", "Brian Perez",
                "Amber Roberts", "Steven Turner", "Megan Phillips", "Jason Campbell", "Heather Parker",
                "Ryan Evans", "Samantha Edwards", "Jacob Collins", "Brittany Stewart", "Nathan Morris",
                "Vanessa Rogers", "Tyler Reed", "Crystal Cook", "Brandon Morgan", "Erica Bell",
                "Adam Murphy", "Katherine Bailey", "Sean Rivera", "Victoria Cooper", "Travis Richardson",
                "Monica Cox", "Derek Howard", "Tiffany Ward", "Corey Torres", "Natalie Peterson"
            };

            for (int i = 0; i < customerNames.Length; i++)
            {
                var customer = new Customer
                {
                    Name = customerNames[i],
                    Email = $"{customerNames[i].ToLower().Replace(" ", ".")}@email.com",
                    Phone = $"+1-555-{2000 + i:D4}",
                    Address = $"{200 + i} Customer Ave, Apt {i + 1}, Customer City, CC {20000 + i}",
                    Status = i % 15 == 0 ? "Inactive" : "Active",
                    CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 365)),
                    UpdatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 30)),
                    IsActive = i % 15 != 0
                };

                var createdCustomer = await _customerService.CreateAsync(customer);
                customers.Add(createdCustomer);
            }

            return customers;
        }

        private async Task<List<Product>> SeedProducts(List<Supplier> suppliers)
        {
            var products = new List<Product>();
            var productNames = new[]
            {
                "Laptop Pro X1", "Wireless Mouse", "USB-C Cable", "Bluetooth Headphones", "External Hard Drive",
                "Gaming Keyboard", "Webcam HD", "Power Bank", "Wireless Charger", "Laptop Stand",
                "Monitor 24\"", "Mechanical Keyboard", "Gaming Mouse", "USB Hub", "SD Card 128GB",
                "Wireless Earbuds", "Laptop Bag", "Screen Protector", "Cable Organizer", "Desk Lamp",
                "Wireless Router", "Network Switch", "Ethernet Cable", "WiFi Extender", "VPN Router",
                "Security Camera", "Smart Doorbell", "Motion Sensor", "Alarm System", "Keypad Lock",
                "Smart Bulb", "Smart Plug", "Smart Thermostat", "Smart Speaker", "Smart Watch",
                "Fitness Tracker", "Bluetooth Speaker", "Portable Speaker", "Sound Bar", "Subwoofer",
                "Microphone", "Audio Interface", "Studio Headphones", "Guitar Cable", "Drum Sticks",
                "Guitar Strings", "Piano Keyboard", "Synthesizer", "DJ Controller", "Karaoke Machine"
            };

            var categories = new[] { "Electronics", "Computers", "Accessories", "Gaming", "Audio", "Smart Home", "Networking", "Security", "Music" };

            for (int i = 0; i < productNames.Length; i++)
            {
                var basePrice = Random.Shared.Next(20, 2000);
                var costPrice = (int)(basePrice * (0.4 + Random.Shared.NextDouble() * 0.3)); // 40-70% of retail price
                var currentStock = Random.Shared.Next(0, 150);
                var minStockLevel = Random.Shared.Next(5, 25);
                var reorderPoint = minStockLevel + Random.Shared.Next(10, 40);

                var product = new Product
                {
                    Name = productNames[i],
                    Description = $"High-quality {productNames[i].ToLower()} for professional use",
                    SKU = $"SKU-{1000 + i:D4}",
                    Category = categories[i % categories.Length],
                    Price = basePrice,
                    CostPrice = costPrice,
                    Quantity = currentStock,
                    Unit = "pcs",
                    Supplier = suppliers[i % suppliers.Count].Name,
                    MinStockLevel = minStockLevel,
                    ReorderPoint = reorderPoint,
                    LastRestocked = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 90)),
                    CreatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 365)),
                    UpdatedAt = DateTime.UtcNow.AddDays(-Random.Shared.Next(1, 30)),
                    IsActive = true
                };

                var createdProduct = await _productService.CreateAsync(product);
                products.Add(createdProduct);
            }

            return products;
        }

        private async Task<List<Purchase>> SeedPurchases(List<Supplier> suppliers, List<Product> products)
        {
            var purchases = new List<Purchase>();
            var paymentMethods = new[] { "Bank Transfer", "Credit Card", "Check", "Cash" };
            var statuses = new[] { "completed", "pending", "cancelled" };

            // Create purchases over the last 12 months with realistic patterns
            for (int i = 0; i < 200; i++) // Increased from 50 to 200
            {
                var supplier = suppliers[Random.Shared.Next(suppliers.Count)];
                var numItems = Random.Shared.Next(1, 8); // Increased variety
                var items = new List<PurchaseItem>();

                for (int j = 0; j < numItems; j++)
                {
                    var product = products[Random.Shared.Next(products.Count)];
                    var quantity = Random.Shared.Next(5, 100); // More realistic quantities
                    var unitPrice = product.CostPrice + Random.Shared.Next(-10, 20);

                    items.Add(new PurchaseItem
                    {
                        ProductId = product.Id,
                        ProductName = product.Name,
                        Quantity = quantity,
                        UnitCost = unitPrice,
                        TotalCost = quantity * unitPrice
                    });
                }

                // Create realistic date distribution (more recent purchases)
                var daysAgo = Random.Shared.Next(0, 365);
                var purchaseDate = DateTime.UtcNow.AddDays(-daysAgo);

                var purchase = new Purchase
                {
                    SupplierId = supplier.Id,
                    SupplierName = supplier.Name,
                    Items = items,
                    TotalAmount = items.Sum(item => item.TotalCost),
                    PurchaseDate = purchaseDate,
                    Status = statuses[Random.Shared.Next(statuses.Length)],
                    PaymentMethod = paymentMethods[Random.Shared.Next(paymentMethods.Length)],
                    Notes = Random.Shared.Next(0, 3) == 0 ? $"Purchase note #{i + 1}" : "",
                    DeliveryTime = Random.Shared.Next(1, 14), // 1-14 days delivery
                    QualityRating = 3.5 + Random.Shared.NextDouble() * 1.5, // 3.5-5.0 rating
                    OnTimeDelivery = Random.Shared.Next(0, 10) > 2, // 80% on-time delivery
                    CreatedAt = purchaseDate,
                    UpdatedAt = purchaseDate.AddDays(Random.Shared.Next(0, 30)),
                    IsActive = true
                };

                var createdPurchase = await _purchaseService.CreateAsync(purchase);
                purchases.Add(createdPurchase);
            }

            return purchases;
        }

        private async Task<List<Sale>> SeedSales(List<Customer> customers, List<Product> products)
        {
            var sales = new List<Sale>();
            var paymentMethods = new[] { "Cash", "Credit Card", "Debit Card", "Bank Transfer", "Check" };
            var statuses = new[] { "completed", "pending", "cancelled" };

            // Create sales over the last 12 months with realistic business patterns
            for (int i = 0; i < 500; i++) // Increased from 50 to 500 for better analytics
            {
                var customer = customers[Random.Shared.Next(customers.Count)];
                var numItems = Random.Shared.Next(1, 6); // More realistic order sizes
                var items = new List<SaleItem>();

                for (int j = 0; j < numItems; j++)
                {
                    var product = products[Random.Shared.Next(products.Count)];
                    var quantity = Random.Shared.Next(1, 15);
                    var unitPrice = product.Price + Random.Shared.Next(-20, 30);

                    items.Add(new SaleItem
                    {
                        ProductId = product.Id,
                        ProductName = product.Name,
                        Quantity = quantity,
                        UnitPrice = unitPrice,
                        TotalPrice = quantity * unitPrice,
                        CostPrice = product.CostPrice // Add cost price for profit calculations
                    });
                }

                // Create realistic date distribution with seasonal patterns
                var daysAgo = Random.Shared.Next(0, 365);
                var saleDate = DateTime.UtcNow.AddDays(-daysAgo);
                
                // Add seasonal variations (more sales in certain months)
                var month = saleDate.Month;
                var seasonalMultiplier = 1.0;
                if (month == 11 || month == 12) seasonalMultiplier = 1.5; // Holiday season
                else if (month == 6 || month == 7) seasonalMultiplier = 1.3; // Summer
                else if (month == 1 || month == 2) seasonalMultiplier = 0.8; // Post-holiday slump

                var sale = new Sale
                {
                    CustomerId = customer.Id,
                    CustomerName = customer.Name,
                    Items = items,
                    TotalAmount = items.Sum(item => item.TotalPrice) * (decimal)seasonalMultiplier,
                    SaleDate = saleDate,
                    Status = statuses[Random.Shared.Next(statuses.Length)],
                    PaymentMethod = paymentMethods[Random.Shared.Next(paymentMethods.Length)],
                    Notes = Random.Shared.Next(0, 3) == 0 ? $"Sale note #{i + 1}" : "",
                    CreatedAt = saleDate,
                    UpdatedAt = saleDate.AddDays(Random.Shared.Next(0, 30)),
                    IsActive = true
                };

                var createdSale = await _saleService.CreateAsync(sale);
                sales.Add(createdSale);
            }

            return sales;
        }
    }
} 