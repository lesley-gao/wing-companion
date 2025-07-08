using Microsoft.AspNetCore.Mvc;
using NetworkingApp.Data;
using NetworkingApp.Models;
using AutoMapper;
using Microsoft.EntityFrameworkCore;

namespace NetworkingApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FlightCompanionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<FlightCompanionController> _logger;

        public FlightCompanionController(
            ApplicationDbContext context, 
            IMapper mapper,
            ILogger<FlightCompanionController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet("requests")]
        public async Task<ActionResult<IEnumerable<FlightCompanionRequest>>> GetRequests()
        {
            try
            {
                var requests = await _context.FlightCompanionRequests
                    .Include(r => r.User)
                    .ToListAsync();

                return Ok(requests);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving flight companion requests");
                throw; // Will be handled by middleware
            }
        }

        [HttpGet("requests/{id}")]
        public async Task<ActionResult<FlightCompanionRequest>> GetRequest(int id)
        {
            var request = await _context.FlightCompanionRequests
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (request == null)
            {
                throw ApiException.NotFound("FlightCompanionRequest", id.ToString());
            }

            return Ok(request);
        }

        [HttpPost("requests")]
        public async Task<ActionResult<FlightCompanionRequest>> CreateRequest(
            [FromBody] FlightCompanionRequest request)
        {
            try
            {
                // Business logic validation
                if (request.FlightDate <= DateTime.UtcNow)
                {
                    throw ApiException.BadRequest(
                        "Flight date must be in the future.", 
                        $"Provided date: {request.FlightDate}"
                    );
                }

                _context.FlightCompanionRequests.Add(request);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created flight companion request with ID {RequestId}", request.Id);

                return CreatedAtAction(
                    nameof(GetRequest), 
                    new { id = request.Id }, 
                    request
                );
            }
            catch (Exception ex) when (!(ex is ApiException))
            {
                _logger.LogError(ex, "Error creating flight companion request");
                throw; // Will be handled by middleware
            }
        }

        // Add other methods with similar error handling patterns...
    }
}