using MongoDB.Driver;
using InventoryAPI.Models;
using InventoryAPI.Services;

namespace InventoryAPI.Scripts
{
    public class SeedWarehouses
    {
        private readonly IMongoCollection<Warehouse> _warehouses;

        public SeedWarehouses(DatabaseService databaseService)
        {
            _warehouses = databaseService.Warehouses;
        }

        public async Task SeedAsync()
        {
            // Clear existing warehouses
            await _warehouses.DeleteManyAsync(_ => true);

            var warehouses = new List<Warehouse>
            {
                new Warehouse
                {
                    Name = "Main Distribution Center",
                    Description = "Primary warehouse for all product categories",
                    Address = "123 Industrial Blvd",
                    City = "New York",
                    State = "NY",
                    PostalCode = "10001",
                    Country = "USA",
                    ContactPerson = "John Smith",
                    ContactPhone = "+1 (555) 123-4567",
                    ContactEmail = "john.smith@company.com",
                    Type = "Distribution Center",
                    Status = "Active",
                    IsDefault = true,
                    OperatingHours = "24/7",
                    HasRefrigeration = false,
                    HasFreezer = false,
                    HasHazardousStorage = false,
                    HasSecuritySystem = true,
                    TotalCapacity = 10000,
                    UsedCapacity = 6500,
                    MaxProducts = 5000
                },
                new Warehouse
                {
                    Name = "Electronics Warehouse",
                    Description = "Specialized storage for electronics and gadgets",
                    Address = "456 Tech Park Drive",
                    City = "San Francisco",
                    State = "CA",
                    PostalCode = "94105",
                    Country = "USA",
                    ContactPerson = "Sarah Johnson",
                    ContactPhone = "+1 (555) 987-6543",
                    ContactEmail = "sarah.johnson@company.com",
                    Type = "Specialized",
                    Status = "Active",
                    IsDefault = false,
                    OperatingHours = "8AM-6PM",
                    HasRefrigeration = false,
                    HasFreezer = false,
                    HasHazardousStorage = false,
                    HasSecuritySystem = true,
                    TotalCapacity = 5000,
                    UsedCapacity = 3200,
                    MaxProducts = 2500
                },
                new Warehouse
                {
                    Name = "Cold Storage Facility",
                    Description = "Refrigerated storage for perishable goods",
                    Address = "789 Cold Chain Lane",
                    City = "Chicago",
                    State = "IL",
                    PostalCode = "60601",
                    Country = "USA",
                    ContactPerson = "Mike Wilson",
                    ContactPhone = "+1 (555) 456-7890",
                    ContactEmail = "mike.wilson@company.com",
                    Type = "Cold Storage",
                    Status = "Active",
                    IsDefault = false,
                    OperatingHours = "6AM-10PM",
                    HasRefrigeration = true,
                    HasFreezer = true,
                    HasHazardousStorage = false,
                    HasSecuritySystem = true,
                    TotalCapacity = 3000,
                    UsedCapacity = 1800,
                    MaxProducts = 1500
                },
                new Warehouse
                {
                    Name = "Regional Store #1",
                    Description = "Local retail store with limited storage",
                    Address = "321 Main Street",
                    City = "Austin",
                    State = "TX",
                    PostalCode = "73301",
                    Country = "USA",
                    ContactPerson = "Lisa Brown",
                    ContactPhone = "+1 (555) 234-5678",
                    ContactEmail = "lisa.brown@company.com",
                    Type = "Retail Store",
                    Status = "Active",
                    IsDefault = false,
                    OperatingHours = "9AM-9PM",
                    HasRefrigeration = true,
                    HasFreezer = false,
                    HasHazardousStorage = false,
                    HasSecuritySystem = false,
                    TotalCapacity = 1000,
                    UsedCapacity = 750,
                    MaxProducts = 500
                }
            };

            foreach (var warehouse in warehouses)
            {
                warehouse.CreatedAt = DateTime.UtcNow;
                warehouse.UpdatedAt = DateTime.UtcNow;
                warehouse.CreatedBy = "System";
                warehouse.IsActive = true;
            }

            await _warehouses.InsertManyAsync(warehouses);
            Console.WriteLine($"Seeded {warehouses.Count} warehouses successfully!");
        }
    }
}
