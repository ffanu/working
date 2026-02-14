using InventoryAPI.Services;
using InventoryAPI.Scripts;
using InventoryAPI.Middleware;
using InventoryAPI.Authentication;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddOpenApi();

// Add Authorization
builder.Services.AddAuthorization();

// Add Authentication with custom JWT handler
builder.Services.AddAuthentication("Bearer")
    .AddScheme<JwtAuthenticationOptions, JwtAuthenticationHandler>("Bearer", options => { });

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add MongoDB services
builder.Services.AddSingleton<DatabaseService>();

// Add Authentication services
builder.Services.AddSingleton<JwtService>();
builder.Services.AddScoped<UserService>();

// Add existing services
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<SupplierService>();
builder.Services.AddScoped<CustomerService>();
builder.Services.AddScoped<PurchaseService>();
builder.Services.AddScoped<SaleService>();
builder.Services.AddScoped<CustomerLedgerService>();
builder.Services.AddScoped<SupplierLedgerService>();
builder.Services.AddScoped<SeedData>();
builder.Services.AddScoped<SeedWarehouseStocks>();

// Add new enhanced services
builder.Services.AddScoped<BatchService>();
builder.Services.AddScoped<WarehouseService>();
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<WarehouseStockService>();
builder.Services.AddScoped<ShopService>();

// Add new POS services
builder.Services.AddScoped<RefundService>();
builder.Services.AddScoped<CashRegisterService>();

// Add new inventory management services
builder.Services.AddScoped<StockInitializationService>();
builder.Services.AddScoped<TransferOrderService>();

// Add new seed services
builder.Services.AddScoped<SeedWarehouses>();
builder.Services.AddScoped<SeedBatches>();
builder.Services.AddScoped<SeedEnhancedProducts>();
builder.Services.AddScoped<SeedShops>();
builder.Services.AddScoped<ClearAllData>();

// Add installment services
builder.Services.AddScoped<InventoryAPI.Repositories.Interfaces.IInstallmentPlanRepository, InventoryAPI.Repositories.InstallmentPlanRepository>();
builder.Services.AddScoped<InventoryAPI.Services.Interfaces.IInstallmentPlanService, InventoryAPI.Services.InstallmentPlanService>();

// Add installment modification services
builder.Services.AddScoped<InventoryAPI.Repositories.Interfaces.IInstallmentModificationRepository, InventoryAPI.Repositories.InstallmentModificationRepository>();
builder.Services.AddScoped<InventoryAPI.Services.Interfaces.IInstallmentModificationService, InventoryAPI.Services.InstallmentModificationService>();
// Temporarily disabled: builder.Services.AddHostedService<InventoryAPI.Services.InstallmentOverdueBackgroundService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

// Add authentication and authorization middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Create default admin user on startup
using (var scope = app.Services.CreateScope())
{
    var userService = scope.ServiceProvider.GetRequiredService<UserService>();
    await userService.CreateDefaultAdminUserAsync();
}

app.Run();
