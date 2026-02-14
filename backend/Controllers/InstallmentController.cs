using Microsoft.AspNetCore.Mvc;
using InventoryApp.Models;
using InventoryApp.DTOs;
using InventoryApp.Services.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace InventoryApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InstallmentController : ControllerBase
    {
        private readonly IInstallmentPlanService _installmentPlanService;
        private readonly ILogger<InstallmentController> _logger;

        public InstallmentController(
            IInstallmentPlanService installmentPlanService,
            ILogger<InstallmentController> logger)
        {
            _installmentPlanService = installmentPlanService;
            _logger = logger;
        }

        /// <summary>
        /// Create a new installment plan
        /// </summary>
        /// <param name="createPlanDto">Installment plan creation data</param>
        /// <returns>Created installment plan</returns>
        [HttpPost("create")]
        public async Task<ActionResult<InstallmentPlan>> CreateInstallmentPlan([FromBody] CreateInstallmentPlanDto createPlanDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Validate that down payment is not greater than total price
                if (createPlanDto.DownPayment > createPlanDto.TotalPrice)
                {
                    return BadRequest("Down payment cannot be greater than total price");
                }

                // Validate that there's an amount to finance
                if (createPlanDto.TotalPrice - createPlanDto.DownPayment <= 0)
                {
                    return BadRequest("Principal amount (Total Price - Down Payment) must be greater than 0");
                }

                var plan = await _installmentPlanService.CreatePlanAsync(
                    createPlanDto.SaleId,
                    createPlanDto.CustomerId,
                    createPlanDto.ProductId,
                    createPlanDto.TotalPrice,
                    createPlanDto.DownPayment,
                    createPlanDto.NumberOfMonths,
                    createPlanDto.InterestRate,
                    createPlanDto.StartDate
                );

                _logger.LogInformation($"Installment plan created successfully with ID: {plan.Id}");
                
                return CreatedAtAction(nameof(GetInstallmentPlan), new { id = plan.Id }, plan);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument provided for installment plan creation");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating installment plan");
                return StatusCode(500, "An error occurred while creating the installment plan");
            }
        }

        /// <summary>
        /// Record a payment for a specific installment
        /// </summary>
        /// <param name="planId">Installment plan ID</param>
        /// <param name="installmentIndex">Index of the installment (0-based)</param>
        /// <param name="paymentDto">Payment details</param>
        /// <returns>Updated installment plan</returns>
        [HttpPost("{planId}/payment/{installmentIndex}")]
        public async Task<ActionResult<InstallmentPlan>> RecordPayment(
            string planId, 
            int installmentIndex, 
            [FromBody] RecordPaymentDto paymentDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Validate payment
                var isValidPayment = await _installmentPlanService.ValidatePaymentAsync(planId, installmentIndex, paymentDto.Amount);
                if (!isValidPayment)
                {
                    return BadRequest("Invalid payment details or installment already paid");
                }

                var updatedPlan = await _installmentPlanService.RecordPaymentAsync(
                    planId, 
                    installmentIndex, 
                    paymentDto.Amount, 
                    paymentDto.PaymentDate
                );

                _logger.LogInformation($"Payment recorded successfully for plan {planId}, installment {installmentIndex}");
                
                return Ok(updatedPlan);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, $"Invalid argument for payment recording: Plan {planId}, Installment {installmentIndex}");
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, $"Invalid operation for payment recording: Plan {planId}, Installment {installmentIndex}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error recording payment for plan {planId}, installment {installmentIndex}");
                return StatusCode(500, "An error occurred while recording the payment");
            }
        }

        /// <summary>
        /// Get installment plan by ID
        /// </summary>
        /// <param name="id">Installment plan ID</param>
        /// <returns>Installment plan details</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<InstallmentPlan>> GetInstallmentPlan(string id)
        {
            try
            {
                var plan = await _installmentPlanService.GetPlanByIdAsync(id);
                
                if (plan == null)
                {
                    return NotFound($"Installment plan with ID {id} not found");
                }

                return Ok(plan);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving installment plan with ID: {id}");
                return StatusCode(500, "An error occurred while retrieving the installment plan");
            }
        }

        /// <summary>
        /// Get all installment plans
        /// </summary>
        /// <returns>List of all installment plans</returns>
        [HttpGet]
        public async Task<ActionResult<List<InstallmentPlan>>> GetAllInstallmentPlans()
        {
            try
            {
                var plans = await _installmentPlanService.GetAllPlansAsync();
                return Ok(plans);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all installment plans");
                return StatusCode(500, "An error occurred while retrieving installment plans");
            }
        }

        /// <summary>
        /// Get installment plans by customer ID
        /// </summary>
        /// <param name="customerId">Customer ID</param>
        /// <returns>List of installment plans for the customer</returns>
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<List<InstallmentPlan>>> GetInstallmentPlansByCustomer(string customerId)
        {
            try
            {
                var plans = await _installmentPlanService.GetPlansByCustomerIdAsync(customerId);
                return Ok(plans);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving installment plans for customer: {customerId}");
                return StatusCode(500, "An error occurred while retrieving customer installment plans");
            }
        }

        /// <summary>
        /// Get overdue installment plans
        /// </summary>
        /// <returns>List of overdue installment plans</returns>
        [HttpGet("overdue")]
        public async Task<ActionResult<List<InstallmentPlan>>> GetOverdueInstallmentPlans()
        {
            try
            {
                var overduePlans = await _installmentPlanService.GetOverduePlansAsync();
                return Ok(overduePlans);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving overdue installment plans");
                return StatusCode(500, "An error occurred while retrieving overdue plans");
            }
        }

        /// <summary>
        /// Update installment plan status
        /// </summary>
        /// <param name="planId">Installment plan ID</param>
        /// <param name="status">New status</param>
        /// <returns>Success status</returns>
        [HttpPut("{planId}/status")]
        public async Task<ActionResult> UpdateInstallmentPlanStatus(string planId, [FromBody] string status)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(status))
                {
                    return BadRequest("Status cannot be empty");
                }

                var validStatuses = new[] { "Active", "Completed", "Defaulted", "Cancelled" };
                if (!validStatuses.Contains(status))
                {
                    return BadRequest($"Invalid status. Valid statuses are: {string.Join(", ", validStatuses)}");
                }

                var success = await _installmentPlanService.UpdatePlanStatusAsync(planId, status);
                
                if (!success)
                {
                    return NotFound($"Installment plan with ID {planId} not found");
                }

                _logger.LogInformation($"Installment plan {planId} status updated to {status}");
                
                return Ok(new { message = "Status updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating status for installment plan: {planId}");
                return StatusCode(500, "An error occurred while updating the plan status");
            }
        }

        /// <summary>
        /// Complete an installment plan (mark all remaining payments as paid)
        /// </summary>
        /// <param name="planId">Installment plan ID</param>
        /// <returns>Completed installment plan</returns>
        [HttpPost("{planId}/complete")]
        public async Task<ActionResult<InstallmentPlan>> CompleteInstallmentPlan(string planId)
        {
            try
            {
                var completedPlan = await _installmentPlanService.CompleteInstallmentPlanAsync(planId);
                
                _logger.LogInformation($"Installment plan {planId} completed successfully");
                
                return Ok(completedPlan);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, $"Invalid argument for completing installment plan: {planId}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error completing installment plan: {planId}");
                return StatusCode(500, "An error occurred while completing the installment plan");
            }
        }

        /// <summary>
        /// Update overdue status for all active plans
        /// </summary>
        /// <returns>Success status</returns>
        [HttpPost("update-overdue-status")]
        public async Task<ActionResult> UpdateOverdueStatus()
        {
            try
            {
                await _installmentPlanService.UpdateOverdueStatusAsync();
                
                _logger.LogInformation("Overdue status update completed successfully");
                
                return Ok(new { message = "Overdue status updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating overdue status");
                return StatusCode(500, "An error occurred while updating overdue status");
            }
        }

        /// <summary>
        /// Calculate installment amount for given parameters
        /// </summary>
        /// <param name="principalAmount">Principal amount to finance</param>
        /// <param name="interestRate">Annual interest rate</param>
        /// <param name="numberOfMonths">Number of months</param>
        /// <returns>Calculated installment amount</returns>
        [HttpGet("calculate-installment")]
        public async Task<ActionResult<decimal>> CalculateInstallmentAmount(
            [FromQuery, Required] decimal principalAmount,
            [FromQuery, Required] double interestRate,
            [FromQuery, Required] int numberOfMonths)
        {
            try
            {
                if (principalAmount <= 0)
                {
                    return BadRequest("Principal amount must be greater than 0");
                }

                if (interestRate < 0)
                {
                    return BadRequest("Interest rate cannot be negative");
                }

                if (numberOfMonths <= 0)
                {
                    return BadRequest("Number of months must be greater than 0");
                }

                var installmentAmount = await _installmentPlanService.CalculateInstallmentAmountAsync(
                    principalAmount, interestRate, numberOfMonths);
                
                return Ok(new { installmentAmount = installmentAmount });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating installment amount");
                return StatusCode(500, "An error occurred while calculating installment amount");
            }
        }
    }
}


