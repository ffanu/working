using Microsoft.AspNetCore.Mvc;
using InventoryAPI.Models;
using InventoryAPI.Services;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SuppliersController : ControllerBase
    {
        private readonly SupplierService _supplierService;

        public SuppliersController(SupplierService supplierService)
        {
            _supplierService = supplierService;
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetAll(
            [FromQuery] string? search = null,
            [FromQuery] string? sortBy = "createdAt",
            [FromQuery] string? sortDir = "desc",
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var (data, total) = await _supplierService.GetPagedAsync(search, sortBy, sortDir, page, pageSize);
                return Ok(new { data, total });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Supplier>> GetById(string id)
        {
            try
            {
                var supplier = await _supplierService.GetByIdAsync(id);
                if (supplier == null)
                    return NotFound();

                return Ok(supplier);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Supplier>> Create(Supplier supplier)
        {
            try
            {
                // Custom email validation - only validate if email is not empty
                if (!string.IsNullOrEmpty(supplier.Email) && !IsValidEmail(supplier.Email))
                {
                    ModelState.AddModelError("Email", "Please enter a valid email address");
                }

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var createdSupplier = await _supplierService.CreateAsync(supplier);
                return CreatedAtAction(nameof(GetById), new { id = createdSupplier.Id }, createdSupplier);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Supplier supplier)
        {
            try
            {
                // Custom email validation - only validate if email is not empty
                if (!string.IsNullOrEmpty(supplier.Email) && !IsValidEmail(supplier.Email))
                {
                    ModelState.AddModelError("Email", "Please enter a valid email address");
                }

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                supplier.Id = id;
                var success = await _supplierService.UpdateAsync(id, supplier);
                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var success = await _supplierService.DeleteAsync(id);
                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<List<Supplier>>> Search([FromQuery] string q)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(q))
                    return BadRequest("Search term is required");

                var suppliers = await _supplierService.SearchAsync(q);
                return Ok(suppliers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
} 