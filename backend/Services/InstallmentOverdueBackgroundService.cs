using InventoryApp.Services.Interfaces;

namespace InventoryApp.Services
{
    public class InstallmentOverdueBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<InstallmentOverdueBackgroundService> _logger;
        private readonly TimeSpan _period = TimeSpan.FromHours(24); // Run daily

        public InstallmentOverdueBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<InstallmentOverdueBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("Starting overdue status update task");

                    using var scope = _serviceProvider.CreateScope();
                    var installmentService = scope.ServiceProvider.GetRequiredService<IInstallmentPlanService>();
                    
                    await installmentService.UpdateOverdueStatusAsync();
                    
                    _logger.LogInformation("Overdue status update task completed successfully");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred during overdue status update task");
                }

                await Task.Delay(_period, stoppingToken);
            }
        }
    }
}


