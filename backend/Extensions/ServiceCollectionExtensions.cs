using InventoryApp.Repositories;
using InventoryApp.Repositories.Interfaces;
using InventoryApp.Services;
using InventoryApp.Services.Interfaces;

namespace InventoryApp.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddInstallmentServices(this IServiceCollection services)
        {
            // Register Repository
            services.AddScoped<IInstallmentPlanRepository, InstallmentPlanRepository>();
            
            // Register Service
            services.AddScoped<IInstallmentPlanService, InstallmentPlanService>();
            
            return services;
        }
    }
}


