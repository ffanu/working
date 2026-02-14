using InventoryApp.Models;
using InventoryApp.DTOs;
using InventoryApp.Services.Interfaces;
using InventoryApp.Repositories.Interfaces;

namespace InventoryApp.Services
{
    public class InstallmentPlanService : IInstallmentPlanService
    {
        private readonly IInstallmentPlanRepository _installmentPlanRepository;
        private readonly ILogger<InstallmentPlanService> _logger;

        public InstallmentPlanService(
            IInstallmentPlanRepository installmentPlanRepository,
            ILogger<InstallmentPlanService> logger)
        {
            _installmentPlanRepository = installmentPlanRepository;
            _logger = logger;
        }

        public async Task<InstallmentPlan> CreatePlanAsync(string saleId, string customerId, string productId,
            decimal totalPrice, decimal downPayment, int months, double interestRate, DateTime startDate)
        {
            try
            {
                // Validate input
                if (downPayment > totalPrice)
                {
                    throw new ArgumentException("Down payment cannot be greater than total price");
                }

                if (months <= 0)
                {
                    throw new ArgumentException("Number of months must be greater than 0");
                }

                if (interestRate < 0)
                {
                    throw new ArgumentException("Interest rate cannot be negative");
                }

                // Calculate principal amount (amount to be financed)
                var principalAmount = totalPrice - downPayment;

                // Calculate installment amount
                var installmentAmount = await CalculateInstallmentAmountAsync(principalAmount, interestRate, months);

                // Generate payment schedule
                var payments = await GeneratePaymentScheduleAsync(principalAmount, interestRate, months, startDate);

                // Calculate end date
                var endDate = startDate.AddMonths(months);

                // Create installment plan
                var plan = new InstallmentPlan
                {
                    SaleId = saleId,
                    CustomerId = customerId,
                    ProductId = productId,
                    TotalPrice = totalPrice,
                    DownPayment = downPayment,
                    NumberOfInstallments = months,
                    InstallmentAmount = installmentAmount,
                    InterestRate = interestRate,
                    StartDate = startDate,
                    EndDate = endDate,
                    Status = "Active",
                    Payments = payments,
                    TotalPaid = downPayment, // Down payment is considered as first payment
                    RemainingBalance = principalAmount + (principalAmount * (decimal)interestRate / 100)
                };

                var createdPlan = await _installmentPlanRepository.CreatePlanAsync(plan);
                
                _logger.LogInformation($"Installment plan created successfully with ID: {createdPlan.Id}");
                
                return createdPlan;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating installment plan for sale {saleId}");
                throw;
            }
        }

        public async Task<InstallmentPlan?> GetPlanByIdAsync(string id)
        {
            try
            {
                return await _installmentPlanRepository.GetPlanByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving installment plan with ID: {id}");
                throw;
            }
        }

        public async Task<List<InstallmentPlan>> GetPlansByCustomerIdAsync(string customerId)
        {
            try
            {
                return await _installmentPlanRepository.GetPlansByCustomerIdAsync(customerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving installment plans for customer: {customerId}");
                throw;
            }
        }

        public async Task<List<InstallmentPlan>> GetAllPlansAsync()
        {
            try
            {
                return await _installmentPlanRepository.GetAllPlansAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all installment plans");
                throw;
            }
        }

        public async Task<InstallmentPlan> RecordPaymentAsync(string planId, int installmentIndex, decimal amount, DateTime? paymentDate = null)
        {
            try
            {
                var plan = await _installmentPlanRepository.GetPlanByIdAsync(planId);
                if (plan == null)
                {
                    throw new ArgumentException($"Installment plan with ID {planId} not found");
                }

                if (plan.Status != "Active")
                {
                    throw new InvalidOperationException($"Cannot record payment for plan with status: {plan.Status}");
                }

                if (installmentIndex < 0 || installmentIndex >= plan.Payments.Count)
                {
                    throw new ArgumentException($"Invalid installment index: {installmentIndex}");
                }

                var installment = plan.Payments[installmentIndex];
                
                if (installment.Status == "Paid")
                {
                    throw new InvalidOperationException($"Installment {installmentIndex + 1} is already paid");
                }

                if (amount <= 0)
                {
                    throw new ArgumentException("Payment amount must be greater than 0");
                }

                // Record the payment
                installment.AmountPaid += amount;
                installment.PaymentDate = paymentDate ?? DateTime.UtcNow;
                installment.UpdatedAt = DateTime.UtcNow;

                // Check if installment is fully paid
                if (installment.AmountPaid >= installment.AmountDue)
                {
                    installment.Status = "Paid";
                    installment.AmountPaid = installment.AmountDue; // Cap at amount due
                }

                // Update plan totals
                plan.TotalPaid += amount;
                plan.RemainingBalance = Math.Max(0, plan.RemainingBalance - amount);

                // Check if all installments are paid
                if (plan.IsCompleted)
                {
                    plan.Status = "Completed";
                    _logger.LogInformation($"Installment plan {planId} completed");
                }

                plan.UpdatedAt = DateTime.UtcNow;

                await _installmentPlanRepository.UpdatePlanAsync(plan);
                
                _logger.LogInformation($"Payment of {amount:C} recorded for installment {installmentIndex + 1} of plan {planId}");
                
                return plan;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error recording payment for plan {planId}, installment {installmentIndex}");
                throw;
            }
        }

        public async Task<bool> UpdatePlanStatusAsync(string planId, string status)
        {
            try
            {
                var plan = await _installmentPlanRepository.GetPlanByIdAsync(planId);
                if (plan == null)
                {
                    return false;
                }

                plan.Status = status;
                plan.UpdatedAt = DateTime.UtcNow;

                return await _installmentPlanRepository.UpdatePlanAsync(plan);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating plan status for ID: {planId}");
                throw;
            }
        }

        public async Task<List<InstallmentPlan>> GetOverduePlansAsync()
        {
            try
            {
                return await _installmentPlanRepository.GetOverduePlansAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving overdue plans");
                throw;
            }
        }

        public async Task UpdateOverdueStatusAsync()
        {
            try
            {
                var activePlans = await _installmentPlanRepository.GetPlansByStatusAsync("Active");
                var currentDate = DateTime.UtcNow;

                foreach (var plan in activePlans)
                {
                    bool planUpdated = false;

                    foreach (var payment in plan.Payments)
                    {
                        if (payment.Status == "Pending" && payment.DueDate < currentDate)
                        {
                            payment.Status = "Overdue";
                            payment.UpdatedAt = DateTime.UtcNow;
                            planUpdated = true;
                        }
                    }

                    if (planUpdated)
                    {
                        plan.UpdatedAt = DateTime.UtcNow;
                        await _installmentPlanRepository.UpdatePlanAsync(plan);
                    }
                }

                _logger.LogInformation("Overdue status update completed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating overdue status");
                throw;
            }
        }

        public async Task<decimal> CalculateInstallmentAmountAsync(decimal principalAmount, double interestRate, int numberOfMonths)
        {
            try
            {
                if (interestRate == 0)
                {
                    return principalAmount / numberOfMonths;
                }

                // Calculate monthly interest rate
                var monthlyRate = (decimal)(interestRate / 100 / 12);

                // Calculate installment using compound interest formula
                var numerator = principalAmount * monthlyRate * (decimal)Math.Pow((double)(1 + monthlyRate), numberOfMonths);
                var denominator = (decimal)Math.Pow((double)(1 + monthlyRate), numberOfMonths) - 1;

                return Math.Round(numerator / denominator, 2);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating installment amount");
                throw;
            }
        }

        public async Task<List<InstallmentPayment>> GeneratePaymentScheduleAsync(decimal principalAmount, double interestRate, 
            int numberOfMonths, DateTime startDate)
        {
            try
            {
                var payments = new List<InstallmentPayment>();
                var installmentAmount = await CalculateInstallmentAmountAsync(principalAmount, interestRate, numberOfMonths);

                for (int i = 0; i < numberOfMonths; i++)
                {
                    var dueDate = startDate.AddMonths(i + 1);
                    
                    var payment = new InstallmentPayment
                    {
                        DueDate = dueDate,
                        AmountDue = installmentAmount,
                        AmountPaid = 0,
                        PaymentDate = null,
                        Status = "Pending"
                    };

                    payments.Add(payment);
                }

                return payments;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating payment schedule");
                throw;
            }
        }

        public async Task<bool> ValidatePaymentAsync(string planId, int installmentIndex, decimal amount)
        {
            try
            {
                var plan = await _installmentPlanRepository.GetPlanByIdAsync(planId);
                if (plan == null)
                {
                    return false;
                }

                if (installmentIndex < 0 || installmentIndex >= plan.Payments.Count)
                {
                    return false;
                }

                var installment = plan.Payments[installmentIndex];
                
                if (installment.Status == "Paid")
                {
                    return false;
                }

                if (amount <= 0 || amount > installment.AmountDue - installment.AmountPaid)
                {
                    return false;
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error validating payment for plan {planId}");
                return false;
            }
        }

        public async Task<InstallmentPlan> CompleteInstallmentPlanAsync(string planId)
        {
            try
            {
                var plan = await _installmentPlanRepository.GetPlanByIdAsync(planId);
                if (plan == null)
                {
                    throw new ArgumentException($"Installment plan with ID {planId} not found");
                }

                // Mark all remaining payments as paid
                foreach (var payment in plan.Payments.Where(p => p.Status != "Paid"))
                {
                    payment.Status = "Paid";
                    payment.AmountPaid = payment.AmountDue;
                    payment.PaymentDate = DateTime.UtcNow;
                    payment.UpdatedAt = DateTime.UtcNow;
                }

                plan.Status = "Completed";
                plan.TotalPaid = plan.TotalPrice;
                plan.RemainingBalance = 0;
                plan.UpdatedAt = DateTime.UtcNow;

                await _installmentPlanRepository.UpdatePlanAsync(plan);
                
                _logger.LogInformation($"Installment plan {planId} marked as completed");
                
                return plan;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error completing installment plan {planId}");
                throw;
            }
        }
    }
}


