using InventoryAPI.Models;
using InventoryAPI.DTOs;
using InventoryAPI.Services.Interfaces;
using InventoryAPI.Repositories.Interfaces;
using Microsoft.Extensions.Logging;

namespace InventoryAPI.Services
{
    public class InstallmentModificationService : IInstallmentModificationService
    {
        private readonly IInstallmentModificationRepository _modificationRepository;
        private readonly IInstallmentPlanRepository _installmentPlanRepository;
        private readonly ProductService _productService;
        private readonly ILogger<InstallmentModificationService> _logger;

        public InstallmentModificationService(
            IInstallmentModificationRepository modificationRepository,
            IInstallmentPlanRepository installmentPlanRepository,
            ProductService productService,
            ILogger<InstallmentModificationService> logger)
        {
            _modificationRepository = modificationRepository;
            _installmentPlanRepository = installmentPlanRepository;
            _productService = productService;
            _logger = logger;
        }

        public async Task<ModificationPreviewDto> PreviewModificationAsync(ModifyInstallmentPlanDto request)
        {
            try
            {
                _logger.LogInformation($"Previewing modification for plan {request.InstallmentPlanId}");

                var currentPlan = await _installmentPlanRepository.GetPlanByIdAsync(request.InstallmentPlanId);
                if (currentPlan == null)
                {
                    throw new ArgumentException("Installment plan not found");
                }

                // Calculate current state
                var currentState = CalculateCurrentState(currentPlan);
                
                // Calculate new plan based on modification type
                var newPlanDetails = await CalculateNewPlanAsync(currentPlan, request, currentState);

                // Create preview response
                var preview = new ModificationPreviewDto
                {
                    InstallmentPlanId = request.InstallmentPlanId,
                    ModificationType = request.ModificationType,

                    // Current Plan
                    CurrentMonthlyEMI = currentPlan.InstallmentAmount,
                    CurrentRemainingBalance = currentState.RemainingBalance,
                    CurrentRemainingInstallments = currentState.RemainingInstallments,
                    CurrentEndDate = currentPlan.EndDate,
                    CurrentTotalPayable = currentState.RemainingBalance + currentPlan.TotalPaid,

                    // New Plan
                    NewMonthlyEMI = newPlanDetails.NewEMI,
                    NewRemainingBalance = newPlanDetails.NewTotalAmount,
                    NewRemainingInstallments = newPlanDetails.NewInstallmentCount,
                    NewEndDate = newPlanDetails.NewEndDate,
                    NewTotalPayable = newPlanDetails.NewTotalPayable,

                    // Impact Analysis
                    EMIDifference = newPlanDetails.NewEMI - currentPlan.InstallmentAmount,
                    TotalPayableDifference = newPlanDetails.NewTotalPayable - (currentState.RemainingBalance + currentPlan.TotalPaid),
                    TimeDifferenceMonths = newPlanDetails.NewInstallmentCount - currentState.RemainingInstallments,

                    // Generate new payment schedule
                    NewPaymentSchedule = GenerateNewPaymentSchedule(
                        newPlanDetails.NewTotalAmount, 
                        newPlanDetails.NewEMI, 
                        newPlanDetails.NewInstallmentCount,
                        currentPlan.InterestRate,
                        currentState.NextDueDate)
                };

                // Add recommendation
                preview.IsFinanciallyBeneficial = preview.TotalPayableDifference <= 0;
                preview.RecommendationNote = GenerateRecommendation(preview);

                return preview;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error previewing modification for plan {request.InstallmentPlanId}");
                throw;
            }
        }

        public async Task<InstallmentPlanModification> RequestModificationAsync(ModifyInstallmentPlanDto request)
        {
            try
            {
                _logger.LogInformation($"Creating modification request for plan {request.InstallmentPlanId}");

                var currentPlan = await _installmentPlanRepository.GetPlanByIdAsync(request.InstallmentPlanId);
                if (currentPlan == null)
                {
                    throw new ArgumentException("Installment plan not found");
                }

                // Calculate current and new plan details
                var currentState = CalculateCurrentState(currentPlan);
                var newPlanDetails = await CalculateNewPlanAsync(currentPlan, request, currentState);

                // Create modification record
                var modification = new InstallmentPlanModification
                {
                    InstallmentPlanId = request.InstallmentPlanId,
                    ModificationType = request.ModificationType,
                    RequestedBy = request.RequestedBy,
                    Reason = request.Reason,
                    Status = "Pending",

                    // Store previous plan state
                    PreviousPlan = new InstallmentPlanSnapshot
                    {
                        TotalPrice = currentPlan.TotalPrice,
                        DownPayment = currentPlan.DownPayment,
                        NumberOfInstallments = currentPlan.NumberOfInstallments,
                        InstallmentAmount = currentPlan.InstallmentAmount,
                        InterestRate = currentPlan.InterestRate,
                        RemainingBalance = currentState.RemainingBalance,
                        PaidInstallments = currentState.PaidInstallments,
                        TotalPaid = currentPlan.TotalPaid,
                        Products = currentPlan.Products,
                        NextDueDate = currentState.NextDueDate
                    },

                    // Store new plan state
                    NewPlan = new InstallmentPlanSnapshot
                    {
                        TotalPrice = newPlanDetails.NewTotalAmount,
                        DownPayment = currentPlan.DownPayment + (request.AdditionalDownPayment ?? 0),
                        NumberOfInstallments = newPlanDetails.NewInstallmentCount,
                        InstallmentAmount = newPlanDetails.NewEMI,
                        InterestRate = request.NewInterestRate ?? currentPlan.InterestRate,
                        RemainingBalance = newPlanDetails.NewTotalAmount,
                        PaidInstallments = currentState.PaidInstallments,
                        TotalPaid = currentPlan.TotalPaid,
                        Products = newPlanDetails.NewProducts,
                        NextDueDate = currentState.NextDueDate
                    },

                    // Store modification details
                    ModificationDetails = new ModificationDetails
                    {
                        NewInstallmentCount = request.NewInstallmentCount,
                        NewInterestRate = request.NewInterestRate,
                        AdditionalDownPayment = request.AdditionalDownPayment,
                        AdditionalProducts = await ConvertToInstallmentPlanProducts(request.AdditionalProducts),
                        
                        FinancialImpact = new FinancialImpact
                        {
                            OldMonthlyEMI = currentPlan.InstallmentAmount,
                            NewMonthlyEMI = newPlanDetails.NewEMI,
                            EMIDifference = newPlanDetails.NewEMI - currentPlan.InstallmentAmount,
                            OldTotalPayable = currentState.RemainingBalance + currentPlan.TotalPaid,
                            NewTotalPayable = newPlanDetails.NewTotalPayable,
                            TotalPayableDifference = newPlanDetails.NewTotalPayable - (currentState.RemainingBalance + currentPlan.TotalPaid),
                            OldEndDate = currentPlan.EndDate,
                            NewEndDate = newPlanDetails.NewEndDate,
                            TimeDifferenceMonths = newPlanDetails.NewInstallmentCount - currentState.RemainingInstallments
                        }
                    }
                };

                return await _modificationRepository.CreateModificationAsync(modification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating modification request for plan {request.InstallmentPlanId}");
                throw;
            }
        }

        public async Task<InstallmentPlanModification> ApproveModificationAsync(ApproveModificationDto request)
        {
            try
            {
                var modification = await _modificationRepository.GetModificationByIdAsync(request.ModificationId);
                if (modification == null)
                {
                    throw new ArgumentException("Modification not found");
                }

                if (modification.Status != "Pending")
                {
                    throw new InvalidOperationException("Only pending modifications can be approved");
                }

                modification.Status = "Approved";
                modification.ApprovedBy = request.ApprovedBy;
                modification.AppliedDate = DateTime.UtcNow;

                return await _modificationRepository.UpdateModificationAsync(modification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error approving modification {request.ModificationId}");
                throw;
            }
        }

        public async Task<InstallmentPlanModification> RejectModificationAsync(RejectModificationDto request)
        {
            try
            {
                var modification = await _modificationRepository.GetModificationByIdAsync(request.ModificationId);
                if (modification == null)
                {
                    throw new ArgumentException("Modification not found");
                }

                if (modification.Status != "Pending")
                {
                    throw new InvalidOperationException("Only pending modifications can be rejected");
                }

                modification.Status = "Rejected";
                modification.ApprovedBy = request.RejectedBy;
                modification.RejectionReason = request.RejectionReason;

                return await _modificationRepository.UpdateModificationAsync(modification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error rejecting modification {request.ModificationId}");
                throw;
            }
        }

        public async Task<InstallmentPlan> ApplyModificationAsync(string modificationId)
        {
            try
            {
                var modification = await _modificationRepository.GetModificationByIdAsync(modificationId);
                if (modification == null)
                {
                    throw new ArgumentException("Modification not found");
                }

                if (modification.Status != "Approved")
                {
                    throw new InvalidOperationException("Only approved modifications can be applied");
                }

                var currentPlan = await _installmentPlanRepository.GetPlanByIdAsync(modification.InstallmentPlanId);
                if (currentPlan == null)
                {
                    throw new ArgumentException("Installment plan not found");
                }

                // Apply the modification to the plan
                var updatedPlan = await ApplyModificationToPlan(currentPlan, modification);

                // Update modification status
                modification.Status = "Applied";
                await _modificationRepository.UpdateModificationAsync(modification);

                _logger.LogInformation($"Successfully applied modification {modificationId} to plan {currentPlan.Id}");
                return updatedPlan;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error applying modification {modificationId}");
                throw;
            }
        }

        public async Task<List<InstallmentPlanModification>> GetModificationsByPlanIdAsync(string planId)
        {
            return await _modificationRepository.GetModificationsByPlanIdAsync(planId);
        }

        public async Task<List<InstallmentPlanModification>> GetPendingModificationsAsync()
        {
            return await _modificationRepository.GetPendingModificationsAsync();
        }

        public async Task<InstallmentPlanModification?> GetModificationByIdAsync(string id)
        {
            return await _modificationRepository.GetModificationByIdAsync(id);
        }

        public async Task<List<InstallmentPlanModification>> GetModificationsByCustomerAsync(string customerId)
        {
            return await _modificationRepository.GetModificationsByCustomerAsync(customerId);
        }

        // Private helper methods for EMI calculations

        private CurrentPlanState CalculateCurrentState(InstallmentPlan plan)
        {
            var paidInstallments = plan.Payments?.Count(p => p.Status == "Paid") ?? 0;
            var remainingInstallments = plan.NumberOfInstallments - paidInstallments;
            
            // Calculate remaining principal balance
            var remainingBalance = CalculateRemainingPrincipal(plan);
            
            // Find next due date
            var nextDueDate = plan.Payments?
                .Where(p => p.Status == "Pending")
                .OrderBy(p => p.DueDate)
                .FirstOrDefault()?.DueDate;

            return new CurrentPlanState
            {
                PaidInstallments = paidInstallments,
                RemainingInstallments = remainingInstallments,
                RemainingBalance = remainingBalance,
                NextDueDate = nextDueDate
            };
        }

        private decimal CalculateRemainingPrincipal(InstallmentPlan plan)
        {
            var monthlyRate = (decimal)(plan.InterestRate / 100 / 12);
            var totalInstallments = plan.NumberOfInstallments;
            var paidInstallments = plan.Payments?.Count(p => p.Status == "Paid") ?? 0;
            
            var principalAmount = plan.TotalPrice - plan.DownPayment;
            
            if (monthlyRate == 0)
            {
                // Simple installment without interest
                var principalPerInstallment = principalAmount / totalInstallments;
                return principalAmount - (principalPerInstallment * paidInstallments);
            }

            // EMI calculation for compound interest
            var emi = plan.InstallmentAmount;
            var remainingBalance = principalAmount;

            // Calculate remaining balance after paid installments
            for (int i = 0; i < paidInstallments; i++)
            {
                var interestForMonth = remainingBalance * monthlyRate;
                var principalForMonth = emi - interestForMonth;
                remainingBalance -= principalForMonth;
            }

            return Math.Max(0, remainingBalance);
        }

        private async Task<NewPlanCalculation> CalculateNewPlanAsync(
            InstallmentPlan currentPlan, 
            ModifyInstallmentPlanDto request, 
            CurrentPlanState currentState)
        {
            var newTotalAmount = currentState.RemainingBalance;
            var newProducts = new List<InstallmentPlanProduct>(currentPlan.Products);
            var newInterestRate = request.NewInterestRate ?? currentPlan.InterestRate;
            var newInstallmentCount = currentState.RemainingInstallments;

            // Apply modifications based on type
            switch (request.ModificationType)
            {
                case "ChangeInstallmentCount":
                    if (request.NewInstallmentCount.HasValue)
                    {
                        newInstallmentCount = request.NewInstallmentCount.Value;
                    }
                    break;

                case "ChangeInterestRate":
                    // Interest rate already set above
                    break;

                case "AddProducts":
                    var additionalProducts = await ConvertToInstallmentPlanProducts(request.AdditionalProducts);
                    newProducts.AddRange(additionalProducts);
                    newTotalAmount += additionalProducts.Sum(p => p.TotalPrice);
                    break;

                case "ChangeDownPayment":
                    if (request.AdditionalDownPayment.HasValue)
                    {
                        newTotalAmount -= request.AdditionalDownPayment.Value;
                    }
                    break;
            }

            // Calculate new EMI
            var newEMI = CalculateEMI(newTotalAmount, newInterestRate, newInstallmentCount);
            
            // Calculate new end date
            var newEndDate = currentState.NextDueDate?.AddMonths(newInstallmentCount - 1) ?? DateTime.UtcNow.AddMonths(newInstallmentCount);
            
            // Calculate new total payable
            var newTotalPayable = currentPlan.TotalPaid + (newEMI * newInstallmentCount);

            return new NewPlanCalculation
            {
                NewTotalAmount = newTotalAmount,
                NewEMI = newEMI,
                NewInstallmentCount = newInstallmentCount,
                NewEndDate = newEndDate,
                NewTotalPayable = newTotalPayable,
                NewProducts = newProducts
            };
        }

        private decimal CalculateEMI(decimal principal, double annualRate, int months)
        {
            if (annualRate == 0)
            {
                return Math.Round(principal / months, 2); // Simple division for 0% interest
            }

            // Flat Interest Method: Total Interest = Principal × Rate × Time
            var totalInterest = principal * (decimal)(annualRate / 100);
            var totalAmount = principal + totalInterest;
            
            // Equal installments
            return Math.Round(totalAmount / months, 2);
        }

        private List<InstallmentPaymentPreview> GenerateNewPaymentSchedule(
            decimal principal, 
            decimal emi, 
            int installments, 
            double annualRate, 
            DateTime? startDate)
        {
            var schedule = new List<InstallmentPaymentPreview>();
            var currentDate = startDate ?? DateTime.UtcNow.AddMonths(1);
            
            // Calculate flat interest distribution
            var totalInterest = principal * (decimal)(annualRate / 100);
            var interestPerInstallment = Math.Round(totalInterest / installments, 2);
            var principalPerInstallment = Math.Round(principal / installments, 2);
            
            var remainingBalance = principal;

            for (int i = 1; i <= installments; i++)
            {
                // For the last installment, adjust to ensure exact principal is covered
                var currentPrincipal = (i == installments) ? remainingBalance : principalPerInstallment;
                var currentInterest = (i == installments) ? (emi - currentPrincipal) : interestPerInstallment;
                
                remainingBalance -= currentPrincipal;

                schedule.Add(new InstallmentPaymentPreview
                {
                    InstallmentNumber = i,
                    DueDate = currentDate,
                    PrincipalAmount = Math.Round(currentPrincipal, 2),
                    InterestAmount = Math.Round(currentInterest, 2),
                    TotalAmount = emi,
                    RemainingBalance = Math.Max(0, Math.Round(remainingBalance, 2))
                });

                currentDate = currentDate.AddMonths(1);
            }

            return schedule;
        }

        private async Task<List<InstallmentPlanProduct>> ConvertToInstallmentPlanProducts(List<AddProductDto> productDtos)
        {
            var products = new List<InstallmentPlanProduct>();

            foreach (var dto in productDtos)
            {
                var product = await _productService.GetByIdAsync(dto.ProductId);
                if (product != null)
                {
                    products.Add(new InstallmentPlanProduct
                    {
                        ProductId = dto.ProductId,
                        Name = product.Name,
                        Price = dto.Price,
                        Quantity = dto.Quantity,
                        Category = product.Category ?? "Uncategorized",
                        Description = product.Description ?? "No description available",
                        // TotalPrice is computed automatically
                    });
                }
            }

            return products;
        }

        private async Task<InstallmentPlan> ApplyModificationToPlan(InstallmentPlan currentPlan, InstallmentPlanModification modification)
        {
            // Update plan with new values from modification
            currentPlan.TotalPrice = modification.NewPlan.TotalPrice;
            currentPlan.NumberOfInstallments = modification.NewPlan.NumberOfInstallments;
            currentPlan.InstallmentAmount = modification.NewPlan.InstallmentAmount;
            currentPlan.InterestRate = modification.NewPlan.InterestRate;
            currentPlan.EndDate = modification.ModificationDetails.FinancialImpact.NewEndDate ?? DateTime.UtcNow.AddMonths(currentPlan.NumberOfInstallments);
            currentPlan.Products = modification.NewPlan.Products;

            // Regenerate payment schedule from next unpaid installment
            await RegeneratePaymentSchedule(currentPlan);

            // Update the plan in database
            await _installmentPlanRepository.UpdatePlanAsync(currentPlan);
            return currentPlan;
        }

        private Task RegeneratePaymentSchedule(InstallmentPlan plan)
        {
            // Keep paid installments as-is, regenerate pending ones
            var paidPayments = plan.Payments?.Where(p => p.Status == "Paid").ToList() ?? new List<InstallmentPayment>();
            var nextInstallmentNumber = paidPayments.Count + 1;
            var remainingInstallments = plan.NumberOfInstallments - paidPayments.Count;
            
            if (remainingInstallments <= 0)
            {
                // Plan is completed - IsCompleted is a computed property
                plan.Status = "Completed";
                return Task.CompletedTask;
            }

            var remainingBalance = CalculateRemainingPrincipal(plan);
            var nextDueDate = plan.Payments?.Where(p => p.Status == "Pending")
                .OrderBy(p => p.DueDate).FirstOrDefault()?.DueDate ?? DateTime.UtcNow.AddMonths(1);

            var newPayments = GeneratePaymentSchedule(
                remainingBalance, 
                plan.InstallmentAmount, 
                remainingInstallments, 
                plan.InterestRate, 
                nextDueDate, 
                nextInstallmentNumber);

            // Combine paid payments with new payment schedule
            plan.Payments = paidPayments.Concat(newPayments).ToList();
            plan.UpdatedAt = DateTime.UtcNow;
            
            return Task.CompletedTask;
        }

        private List<InstallmentPayment> GeneratePaymentSchedule(
            decimal principal, 
            decimal emi, 
            int installments, 
            double annualRate, 
            DateTime startDate, 
            int startingInstallmentNumber)
        {
            var payments = new List<InstallmentPayment>();
            var currentDate = startDate;
            
            // Calculate flat interest distribution
            var totalInterest = principal * (decimal)(annualRate / 100);
            var interestPerInstallment = Math.Round(totalInterest / installments, 2);
            var principalPerInstallment = Math.Round(principal / installments, 2);
            
            var remainingPrincipal = principal;

            for (int i = 0; i < installments; i++)
            {
                // For the last installment, adjust to ensure exact principal is covered
                var currentPrincipal = (i == installments - 1) ? remainingPrincipal : principalPerInstallment;
                var currentInterest = (i == installments - 1) ? (emi - currentPrincipal) : interestPerInstallment;
                
                remainingPrincipal -= currentPrincipal;

                payments.Add(new InstallmentPayment
                {
                    InstallmentNumber = startingInstallmentNumber + i,
                    DueDate = currentDate,
                    AmountDue = emi,
                    PrincipalAmount = currentPrincipal,
                    InterestAmount = currentInterest,
                    AmountPaid = 0,
                    PaymentDate = null,
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });

                currentDate = currentDate.AddMonths(1);
            }

            return payments;
        }

        private string GenerateRecommendation(ModificationPreviewDto preview)
        {
            var recommendations = new List<string>();

            if (preview.EMIDifference < 0)
            {
                recommendations.Add($"✓ Lower monthly EMI by {Math.Abs(preview.EMIDifference):C}");
            }
            else if (preview.EMIDifference > 0)
            {
                recommendations.Add($"⚠ Higher monthly EMI by {preview.EMIDifference:C}");
            }

            if (preview.TotalPayableDifference < 0)
            {
                recommendations.Add($"✓ Save {Math.Abs(preview.TotalPayableDifference):C} in total interest");
            }
            else if (preview.TotalPayableDifference > 0)
            {
                recommendations.Add($"⚠ Pay {preview.TotalPayableDifference:C} more in total interest");
            }

            if (preview.TimeDifferenceMonths < 0)
            {
                recommendations.Add($"✓ Finish {Math.Abs(preview.TimeDifferenceMonths)} months earlier");
            }
            else if (preview.TimeDifferenceMonths > 0)
            {
                recommendations.Add($"⚠ Extend plan by {preview.TimeDifferenceMonths} months");
            }

            return string.Join(". ", recommendations);
        }

        // Helper classes for internal calculations
        private class CurrentPlanState
        {
            public int PaidInstallments { get; set; }
            public int RemainingInstallments { get; set; }
            public decimal RemainingBalance { get; set; }
            public DateTime? NextDueDate { get; set; }
        }

        private class NewPlanCalculation
        {
            public decimal NewTotalAmount { get; set; }
            public decimal NewEMI { get; set; }
            public int NewInstallmentCount { get; set; }
            public DateTime? NewEndDate { get; set; }
            public decimal NewTotalPayable { get; set; }
            public List<InstallmentPlanProduct> NewProducts { get; set; } = new List<InstallmentPlanProduct>();
        }
    }
}
