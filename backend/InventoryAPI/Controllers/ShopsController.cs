using Microsoft.AspNetCore.Mvc;
using InventoryAPI.Models;
using InventoryAPI.Services;

namespace InventoryAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShopsController : ControllerBase
    {
        private readonly ShopService _shopService;

        public ShopsController(ShopService shopService)
        {
            _shopService = shopService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Shop>>> GetAll()
        {
            try
            {
                var shops = await _shopService.GetAllAsync();
                return Ok(shops);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("active")]
        public async Task<ActionResult<List<Shop>>> GetActive()
        {
            try
            {
                var shops = await _shopService.GetActiveShopsAsync();
                return Ok(shops);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Shop>> GetById(string id)
        {
            try
            {
                var shop = await _shopService.GetByIdAsync(id);
                if (shop == null)
                    return NotFound();

                return Ok(shop);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("code/{code}")]
        public async Task<ActionResult<Shop>> GetByCode(string code)
        {
            try
            {
                var shop = await _shopService.GetByCodeAsync(code);
                if (shop == null)
                    return NotFound();

                return Ok(shop);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("main")]
        public async Task<ActionResult<Shop>> GetMainBranch()
        {
            try
            {
                var shop = await _shopService.GetMainBranchAsync();
                if (shop == null)
                    return NotFound();

                return Ok(shop);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Shop>> Create(Shop shop)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var createdShop = await _shopService.CreateAsync(shop);
                return CreatedAtAction(nameof(GetById), new { id = createdShop.Id }, createdShop);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Shop>> Update(string id, Shop shop)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updatedShop = await _shopService.UpdateAsync(id, shop);
                if (updatedShop == null)
                    return NotFound();

                return Ok(updatedShop);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            try
            {
                var result = await _shopService.DeleteAsync(id);
                if (!result)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
