using Microsoft.AspNetCore.Mvc;
using InventoryAPI.Models;
using InventoryAPI.Services;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalesController : ControllerBase
    {
        private readonly SaleService _saleService;

        public SalesController(SaleService saleService)
        {
            _saleService = saleService;
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
                var (data, total) = await _saleService.GetPagedAsync(search, sortBy, sortDir, page, pageSize);
                return Ok(new { data, total });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Sale>> GetById(string id)
        {
            try
            {
                var sale = await _saleService.GetByIdAsync(id);
                if (sale == null)
                    return NotFound();

                return Ok(sale);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Sale>> Create(Sale sale)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Validate that at least one of ShopId or WarehouseId is provided
                if (string.IsNullOrEmpty(sale.ShopId) && string.IsNullOrEmpty(sale.WarehouseId))
                {
                    ModelState.AddModelError("Location", "Either Shop or Warehouse is required for sale creation");
                    return BadRequest(ModelState);
                }

                // Validate sale can be fulfilled
                var canFulfill = await _saleService.ValidateSaleAsync(sale);
                if (!canFulfill)
                {
                    return BadRequest("Insufficient stock to fulfill this sale");
                }

                var createdSale = await _saleService.CreateAsync(sale);
                return CreatedAtAction(nameof(GetById), new { id = createdSale.Id }, createdSale);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Sale sale)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                sale.Id = id;
                var success = await _saleService.UpdateAsync(id, sale);
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
                var success = await _saleService.DeleteAsync(id);
                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<List<Sale>>> GetByCustomer(string customerId)
        {
            try
            {
                var sales = await _saleService.GetByCustomerAsync(customerId);
                return Ok(sales);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("status/{status}")]
        public async Task<ActionResult<List<Sale>>> GetByStatus(string status)
        {
            try
            {
                var sales = await _saleService.GetByStatusAsync(status);
                return Ok(sales);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("date-range")]
        public async Task<ActionResult<List<Sale>>> GetByDateRange(
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime endDate)
        {
            try
            {
                var sales = await _saleService.GetByDateRangeAsync(startDate, endDate);
                return Ok(sales);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{id}/invoice")]
        public async Task<ActionResult<object>> GenerateInvoice(string id)
        {
            try
            {
                var sale = await _saleService.GetByIdAsync(id);
                if (sale == null)
                    return NotFound("Sale not found");

                var invoiceNumber = await _saleService.GenerateInvoiceNumberAsync();
                sale.InvoiceNumber = invoiceNumber;
                
                var success = await _saleService.UpdateAsync(id, sale);
                if (!success)
                    return BadRequest("Failed to update sale with invoice number");

                return Ok(new { 
                    invoiceNumber = invoiceNumber,
                    message = "Invoice generated successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // NEW: Enhanced warehouse-sale relationship endpoints
        [HttpGet("stock/{productId}")]
        public async Task<ActionResult<List<WarehouseStock>>> GetAvailableStock(string productId)
        {
            try
            {
                var stock = await _saleService.GetAvailableStockForProductAsync(productId);
                return Ok(stock);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("check-stock")]
        public async Task<ActionResult<StockAllocationResult>> CheckStockAvailability([FromBody] StockCheckRequest request)
        {
            try
            {
                var result = await _saleService.CheckStockAvailabilityAsync(
                    request.ProductId, 
                    request.Quantity, 
                    request.PreferredWarehouseId);
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("validate")]
        public async Task<ActionResult<object>> ValidateSale([FromBody] Sale sale)
        {
            try
            {
                var isValid = await _saleService.ValidateSaleAsync(sale);
                return Ok(new { 
                    isValid, 
                    message = isValid ? "Sale can be fulfilled" : "Insufficient stock to fulfill this sale" 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/invoice")]
        public async Task<ActionResult<object>> GetInvoice(string id)
        {
            try
            {
                var sale = await _saleService.GetByIdAsync(id);
                if (sale == null)
                    return NotFound("Sale not found");

                if (string.IsNullOrEmpty(sale.InvoiceNumber))
                    return NotFound("No invoice found for this sale");

                return Ok(new { 
                    invoiceNumber = sale.InvoiceNumber,
                    sale = sale
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    // NEW: Supporting classes for enhanced warehouse-sale relationship
    public class StockCheckRequest
    {
        public string ProductId { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string? PreferredWarehouseId { get; set; }
    }
} 