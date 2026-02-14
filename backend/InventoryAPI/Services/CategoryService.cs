using MongoDB.Driver;
using InventoryAPI.Models;

namespace InventoryAPI.Services
{
    public class CategoryService
    {
        private readonly IMongoCollection<Category> _categories;
        private readonly IMongoCollection<Product> _products;

        public CategoryService(DatabaseService databaseService)
        {
            _categories = databaseService.Categories;
            _products = databaseService.Products;
        }

        public async Task<List<Category>> GetAllAsync()
        {
            return await _categories.Find(c => c.IsActive).SortBy(c => c.SortOrder).ThenBy(c => c.Name).ToListAsync();
        }

        public async Task<Category?> GetByIdAsync(string id)
        {
            return await _categories.Find(c => c.Id == id && c.IsActive).FirstOrDefaultAsync();
        }

        public async Task<Category?> GetByCodeAsync(string code)
        {
            return await _categories.Find(c => c.Code == code && c.IsActive).FirstOrDefaultAsync();
        }

        public async Task<List<Category>> GetRootCategoriesAsync()
        {
            return await _categories.Find(c => c.IsActive && c.Level == 1).SortBy(c => c.SortOrder).ThenBy(c => c.Name).ToListAsync();
        }

        public async Task<List<Category>> GetSubCategoriesAsync(string parentId)
        {
            return await _categories.Find(c => c.IsActive && c.ParentCategoryId == parentId).SortBy(c => c.SortOrder).ThenBy(c => c.Name).ToListAsync();
        }

        public async Task<Category> CreateAsync(Category category)
        {
            // Validate unique code
            if (!string.IsNullOrEmpty(category.Code))
            {
                var existing = await GetByCodeAsync(category.Code);
                if (existing != null)
                {
                    throw new InvalidOperationException($"Category with code '{category.Code}' already exists.");
                }
            }

            // Set hierarchy level
            if (!string.IsNullOrEmpty(category.ParentCategoryId))
            {
                var parent = await GetByIdAsync(category.ParentCategoryId);
                if (parent != null)
                {
                    category.Level = parent.Level + 1;
                    category.ParentCategoryName = parent.Name;
                }
            }
            else
            {
                category.Level = 1;
            }

            // Set default values
            if (string.IsNullOrEmpty(category.Code))
            {
                category.Code = GenerateCategoryCode(category.Name);
            }

            category.CreatedAt = DateTime.UtcNow;
            category.UpdatedAt = DateTime.UtcNow;

            await _categories.InsertOneAsync(category);
            return category;
        }

        public async Task<bool> UpdateAsync(string id, Category category)
        {
            var existing = await GetByIdAsync(id);
            if (existing == null)
                return false;

            // Validate unique code if changed
            if (category.Code != existing.Code && !string.IsNullOrEmpty(category.Code))
            {
                var duplicate = await GetByCodeAsync(category.Code);
                if (duplicate != null)
                {
                    throw new InvalidOperationException($"Category with code '{category.Code}' already exists.");
                }
            }

            // Update hierarchy if parent changed
            if (category.ParentCategoryId != existing.ParentCategoryId)
            {
                if (!string.IsNullOrEmpty(category.ParentCategoryId))
                {
                    var parent = await GetByIdAsync(category.ParentCategoryId);
                    if (parent != null)
                    {
                        category.Level = parent.Level + 1;
                        category.ParentCategoryName = parent.Name;
                    }
                }
                else
                {
                    category.Level = 1;
                    category.ParentCategoryName = null;
                }
            }

            category.UpdatedAt = DateTime.UtcNow;
            category.Id = id; // Ensure ID is preserved

            var result = await _categories.ReplaceOneAsync(c => c.Id == id, category);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            // Check if category has products
            var productCount = await _products.CountDocumentsAsync(p => p.Category == id);
            if (productCount > 0)
            {
                throw new InvalidOperationException($"Cannot delete category. It has {productCount} associated products.");
            }

            // Check if category has subcategories
            var subCategoryCount = await _categories.CountDocumentsAsync(c => c.ParentCategoryId == id && c.IsActive);
            if (subCategoryCount > 0)
            {
                throw new InvalidOperationException($"Cannot delete category. It has {subCategoryCount} subcategories.");
            }

            var update = Builders<Category>.Update.Set(c => c.IsActive, false);
            var result = await _categories.UpdateOneAsync(c => c.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> SetDefaultAsync(string id)
        {
            // Remove default from all other categories
            var updateAll = Builders<Category>.Update.Set(c => c.IsDefault, false);
            await _categories.UpdateManyAsync(c => c.IsActive, updateAll);

            // Set this category as default
            var update = Builders<Category>.Update.Set(c => c.IsDefault, true);
            var result = await _categories.UpdateOneAsync(c => c.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<Category?> GetDefaultAsync()
        {
            return await _categories.Find(c => c.IsActive && c.IsDefault).FirstOrDefaultAsync();
        }

        public async Task<object> GetPagedAsync(string? search = null, string? sortBy = null, string? sortDir = "asc", int page = 1, int pageSize = 20)
        {
            var filter = Builders<Category>.Filter.Eq(c => c.IsActive, true);

            if (!string.IsNullOrEmpty(search))
            {
                var searchFilter = Builders<Category>.Filter.Or(
                    Builders<Category>.Filter.Regex(c => c.Name, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Category>.Filter.Regex(c => c.Code, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                    Builders<Category>.Filter.Regex(c => c.Description, new MongoDB.Bson.BsonRegularExpression(search, "i"))
                );
                filter = Builders<Category>.Filter.And(filter, searchFilter);
            }

            var sort = Builders<Category>.Sort.Ascending(c => c.SortOrder).Ascending(c => c.Name);
            if (!string.IsNullOrEmpty(sortBy))
            {
                sort = sortDir.ToLower() == "desc" 
                    ? Builders<Category>.Sort.Descending(sortBy)
                    : Builders<Category>.Sort.Ascending(sortBy);
            }

            var total = await _categories.CountDocumentsAsync(filter);
            var categories = await _categories.Find(filter)
                .Sort(sort)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync();

            return new { data = categories, total };
        }

        public async Task<List<Category>> GetHierarchicalAsync()
        {
            var allCategories = await GetAllAsync();
            var rootCategories = allCategories.Where(c => c.Level == 1).ToList();

            foreach (var root in rootCategories)
            {
                root.SubCategories = BuildHierarchy(allCategories, root.Id);
            }

            return rootCategories;
        }

        private List<Category> BuildHierarchy(List<Category> allCategories, string parentId)
        {
            var children = allCategories.Where(c => c.ParentCategoryId == parentId).ToList();
            foreach (var child in children)
            {
                child.SubCategories = BuildHierarchy(allCategories, child.Id);
            }
            return children;
        }

        public async Task<Dictionary<string, object>> GetCategoryStatsAsync(string categoryId)
        {
            var category = await GetByIdAsync(categoryId);
            if (category == null)
                return new Dictionary<string, object>();

            var productCount = await _products.CountDocumentsAsync(p => p.Category == categoryId);
            var totalValue = await _products.Aggregate()
                .Match(p => p.Category == categoryId)
                .Group(p => p.Category, g => new { TotalValue = g.Sum(p => p.Price * p.Quantity) })
                .FirstOrDefaultAsync();

            var stats = new Dictionary<string, object>
            {
                ["productCount"] = productCount,
                ["totalValue"] = totalValue?.TotalValue ?? 0,
                ["averagePrice"] = productCount > 0 ? (totalValue?.TotalValue ?? 0) / productCount : 0
            };

            return stats;
        }

        private string GenerateCategoryCode(string name)
        {
            if (string.IsNullOrEmpty(name))
                return "CAT";

            var words = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (words.Length == 1)
            {
                return words[0].Length >= 3 
                    ? words[0].Substring(0, 3).ToUpper() 
                    : words[0].ToUpper();
            }

            var code = string.Join("", words.Select(w => w.Length > 0 ? w[0].ToString().ToUpper() : ""));
            return code.Length >= 2 ? code : name.Substring(0, Math.Min(3, name.Length)).ToUpper();
        }

        // Method for seeding - hard delete all categories
        public async Task HardDeleteAllAsync()
        {
            await _categories.DeleteManyAsync(_ => true);
        }
    }
}


