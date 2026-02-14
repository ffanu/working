using InventoryAPI.Models;
using InventoryAPI.Services;

namespace InventoryAPI.Scripts
{
    public class SeedShops
    {
        private readonly ShopService _shopService;
        private readonly WarehouseService _warehouseService;

        public SeedShops(ShopService shopService, WarehouseService warehouseService)
        {
            _shopService = shopService;
            _warehouseService = warehouseService;
        }

        public async Task SeedAsync()
        {
            // Clear existing shops first
            await ClearAllAsync();

            // Create shops
            var shops = new List<Shop>
            {
                new Shop
                {
                    Name = "Banani Branch",
                    Description = "Main branch in Banani area",
                    Code = "BAN",
                    Address = "123 Banani Road, Banani",
                    City = "Dhaka",
                    State = "Dhaka",
                    PostalCode = "1213",
                    Country = "Bangladesh",
                    Phone = "+880-2-1234567",
                    Email = "banani@inventory.com",
                    ManagerName = "Ahmed Rahman",
                    ManagerPhone = "+880-1712345678",
                    ManagerEmail = "ahmed@inventory.com",
                    TimeZone = "Asia/Dhaka",
                    Currency = "BDT",
                    Language = "en",
                    BusinessHours = new Dictionary<string, string>
                    {
                        { "Monday", "9:00 AM - 9:00 PM" },
                        { "Tuesday", "9:00 AM - 9:00 PM" },
                        { "Wednesday", "9:00 AM - 9:00 PM" },
                        { "Thursday", "9:00 AM - 9:00 PM" },
                        { "Friday", "9:00 AM - 9:00 PM" },
                        { "Saturday", "9:00 AM - 9:00 PM" },
                        { "Sunday", "10:00 AM - 8:00 PM" }
                    },
                    IsActive = true,
                    IsMainBranch = true,
                    CreditLimit = 1000000,
                    TaxRate = 15.0m,
                    AllowNegativeStock = false,
                    RequireWarehouseSelection = true,
                    CreatedBy = "System",
                    UpdatedBy = "System"
                },
                new Shop
                {
                    Name = "Dhanmondi Branch",
                    Description = "Branch in Dhanmondi area",
                    Code = "DHN",
                    Address = "456 Dhanmondi Road, Dhanmondi",
                    City = "Dhaka",
                    State = "Dhaka",
                    PostalCode = "1205",
                    Country = "Bangladesh",
                    Phone = "+880-2-2345678",
                    Email = "dhanmondi@inventory.com",
                    ManagerName = "Fatima Khan",
                    ManagerPhone = "+880-1723456789",
                    ManagerEmail = "fatima@inventory.com",
                    TimeZone = "Asia/Dhaka",
                    Currency = "BDT",
                    Language = "en",
                    BusinessHours = new Dictionary<string, string>
                    {
                        { "Monday", "9:00 AM - 9:00 PM" },
                        { "Tuesday", "9:00 AM - 9:00 PM" },
                        { "Wednesday", "9:00 AM - 9:00 PM" },
                        { "Thursday", "9:00 AM - 9:00 PM" },
                        { "Friday", "9:00 AM - 9:00 PM" },
                        { "Saturday", "9:00 AM - 9:00 PM" },
                        { "Sunday", "10:00 AM - 8:00 PM" }
                    },
                    IsActive = true,
                    IsMainBranch = false,
                    CreditLimit = 500000,
                    TaxRate = 15.0m,
                    AllowNegativeStock = false,
                    RequireWarehouseSelection = true,
                    CreatedBy = "System",
                    UpdatedBy = "System"
                },
                new Shop
                {
                    Name = "Gulshan Branch",
                    Description = "Branch in Gulshan area",
                    Code = "GUL",
                    Address = "789 Gulshan Avenue, Gulshan",
                    City = "Dhaka",
                    State = "Dhaka",
                    PostalCode = "1212",
                    Country = "Bangladesh",
                    Phone = "+880-2-3456789",
                    Email = "gulshan@inventory.com",
                    ManagerName = "Karim Uddin",
                    ManagerPhone = "+880-1734567890",
                    ManagerEmail = "karim@inventory.com",
                    TimeZone = "Asia/Dhaka",
                    Currency = "BDT",
                    Language = "en",
                    BusinessHours = new Dictionary<string, string>
                    {
                        { "Monday", "9:00 AM - 9:00 PM" },
                        { "Tuesday", "9:00 AM - 9:00 PM" },
                        { "Wednesday", "9:00 AM - 9:00 PM" },
                        { "Thursday", "9:00 AM - 9:00 PM" },
                        { "Friday", "9:00 AM - 9:00 PM" },
                        { "Saturday", "9:00 AM - 9:00 PM" },
                        { "Sunday", "10:00 AM - 8:00 PM" }
                    },
                    IsActive = true,
                    IsMainBranch = false,
                    CreditLimit = 750000,
                    TaxRate = 15.0m,
                    AllowNegativeStock = false,
                    RequireWarehouseSelection = true,
                    CreatedBy = "System",
                    UpdatedBy = "System"
                }
            };

            // Create shops
            var createdShops = new List<Shop>();
            foreach (var shop in shops)
            {
                var createdShop = await _shopService.CreateAsync(shop);
                createdShops.Add(createdShop);
            }

            // Create warehouses for each shop
            foreach (var shop in createdShops)
            {
                var warehouses = new List<Warehouse>
                {
                    new Warehouse
                    {
                        ShopId = shop.Id!,
                        ShopName = shop.Name,
                        Name = "Main Storage",
                        Description = $"Main storage warehouse for {shop.Name}",
                        Address = shop.Address,
                        City = shop.City,
                        State = shop.State,
                        PostalCode = shop.PostalCode,
                        Country = shop.Country,
                        TotalCapacity = 1000,
                        UsedCapacity = 0,
                        Status = "Active",
                        IsDefault = true,
                        IsActive = true,
                        CreatedBy = "System"
                    },
                    new Warehouse
                    {
                        ShopId = shop.Id!,
                        ShopName = shop.Name,
                        Name = "Front Store Stock",
                        Description = $"Front store stock for {shop.Name}",
                        Address = shop.Address,
                        City = shop.City,
                        State = shop.State,
                        PostalCode = shop.PostalCode,
                        Country = shop.Country,
                        TotalCapacity = 500,
                        UsedCapacity = 0,
                        Status = "Active",
                        IsDefault = false,
                        IsActive = true,
                        CreatedBy = "System"
                    }
                };

                // Add seasonal storage for Dhanmondi branch
                if (shop.Code == "DHN")
                {
                    warehouses.Add(new Warehouse
                    {
                        ShopId = shop.Id!,
                        ShopName = shop.Name,
                        Name = "Seasonal Storage",
                        Description = $"Seasonal storage for {shop.Name}",
                        Address = shop.Address,
                        City = shop.City,
                        State = shop.State,
                        PostalCode = shop.PostalCode,
                        Country = shop.Country,
                        TotalCapacity = 300,
                        UsedCapacity = 0,
                        Status = "Active",
                        IsDefault = false,
                        IsActive = true,
                        CreatedBy = "System"
                    });
                }

                // Create warehouses
                foreach (var warehouse in warehouses)
                {
                    await _warehouseService.CreateAsync(warehouse);
                }
            }
        }

        public async Task ClearAllAsync()
        {
            // This would clear all shops and their warehouses
            // Implementation depends on your specific requirements
        }
    }
}
