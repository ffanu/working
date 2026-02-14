using Microsoft.AspNetCore.Mvc;
using InventoryAPI.Services.Interfaces;
using InventoryAPI.DTOs;
using InventoryAPI.Models;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InstallmentModificationController : ControllerBase
    {
        private readonly IInstallmentModificationService _modificationService;
        private readonly ILogger<InstallmentModificationController> _logger;

        public InstallmentModificationController(
            IInstallmentModificationService modificationService,
            ILogger<InstallmentModificationController> logger)
        {
            _modificationService = modificationService;
            _logger = logger;
        }

        /// <summary>
        /// Preview the financial impact of a modification before requesting it
        /// </summary>
        [HttpPost("preview")]
        public async Task<ActionResult<ModificationPreviewDto>> PreviewModification([FromBody] ModifyInstallmentPlanDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                _logger.LogInformation($"Previewing modification for plan {request.InstallmentPlanId}");
                var preview = await _modificationService.PreviewModificationAsync(request);
                return Ok(preview);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning($"Invalid request for modification preview: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error previewing modification");
                return StatusCode(500, "An error occurred while previewing the modification");
            }
        }

        /// <summary>
        /// Request a modification to an existing installment plan
        /// </summary>
        [HttpPost("request")]
        public async Task<ActionResult<InstallmentPlanModification>> RequestModification([FromBody] ModifyInstallmentPlanDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                _logger.LogInformation($"Processing modification request for plan {request.InstallmentPlanId}");
                var modification = await _modificationService.RequestModificationAsync(request);
                return CreatedAtAction(nameof(GetModificationById), new { id = modification.Id }, modification);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning($"Invalid modification request: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing modification request");
                return StatusCode(500, "An error occurred while processing the modification request");
            }
        }

        /// <summary>
        /// Approve a pending modification request (Admin only)
        /// </summary>
        [HttpPost("approve")]
        public async Task<ActionResult<InstallmentPlanModification>> ApproveModification([FromBody] ApproveModificationDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                _logger.LogInformation($"Approving modification {request.ModificationId}");
                var modification = await _modificationService.ApproveModificationAsync(request);
                return Ok(modification);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning($"Invalid approval request: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Invalid operation for approval: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving modification");
                return StatusCode(500, "An error occurred while approving the modification");
            }
        }

        /// <summary>
        /// Reject a pending modification request (Admin only)
        /// </summary>
        [HttpPost("reject")]
        public async Task<ActionResult<InstallmentPlanModification>> RejectModification([FromBody] RejectModificationDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                _logger.LogInformation($"Rejecting modification {request.ModificationId}");
                var modification = await _modificationService.RejectModificationAsync(request);
                return Ok(modification);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning($"Invalid rejection request: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Invalid operation for rejection: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting modification");
                return StatusCode(500, "An error occurred while rejecting the modification");
            }
        }

        /// <summary>
        /// Apply an approved modification to update the installment plan
        /// </summary>
        [HttpPost("apply/{modificationId}")]
        public async Task<ActionResult<InstallmentPlan>> ApplyModification(string modificationId)
        {
            try
            {
                _logger.LogInformation($"Applying modification {modificationId}");
                var updatedPlan = await _modificationService.ApplyModificationAsync(modificationId);
                return Ok(updatedPlan);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning($"Invalid application request: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Invalid operation for application: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying modification");
                return StatusCode(500, "An error occurred while applying the modification");
            }
        }

        /// <summary>
        /// Get all modifications for a specific installment plan
        /// </summary>
        [HttpGet("plan/{planId}")]
        public async Task<ActionResult<List<InstallmentPlanModification>>> GetModificationsByPlanId(string planId)
        {
            try
            {
                _logger.LogInformation($"Retrieving modifications for plan {planId}");
                var modifications = await _modificationService.GetModificationsByPlanIdAsync(planId);
                return Ok(modifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving modifications for plan {planId}");
                return StatusCode(500, "An error occurred while retrieving modifications");
            }
        }

        /// <summary>
        /// Get all pending modifications (Admin only)
        /// </summary>
        [HttpGet("pending")]
        public async Task<ActionResult<List<InstallmentPlanModification>>> GetPendingModifications()
        {
            try
            {
                _logger.LogInformation("Retrieving pending modifications");
                var modifications = await _modificationService.GetPendingModificationsAsync();
                return Ok(modifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pending modifications");
                return StatusCode(500, "An error occurred while retrieving pending modifications");
            }
        }

        /// <summary>
        /// Get a specific modification by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<InstallmentPlanModification>> GetModificationById(string id)
        {
            try
            {
                _logger.LogInformation($"Retrieving modification {id}");
                var modification = await _modificationService.GetModificationByIdAsync(id);
                
                if (modification == null)
                {
                    return NotFound($"Modification with ID {id} not found");
                }

                return Ok(modification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving modification {id}");
                return StatusCode(500, "An error occurred while retrieving the modification");
            }
        }

        /// <summary>
        /// Get all modifications requested by a specific customer
        /// </summary>
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<List<InstallmentPlanModification>>> GetModificationsByCustomer(string customerId)
        {
            try
            {
                _logger.LogInformation($"Retrieving modifications for customer {customerId}");
                var modifications = await _modificationService.GetModificationsByCustomerAsync(customerId);
                return Ok(modifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving modifications for customer {customerId}");
                return StatusCode(500, "An error occurred while retrieving customer modifications");
            }
        }
    }
}


