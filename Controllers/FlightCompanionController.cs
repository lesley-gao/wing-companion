// Enhanced FlightCompanionController.cs with validation
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetworkingApp.Data;
using NetworkingApp.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations; 

namespace NetworkingApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FlightCompanionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FlightCompanionController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/FlightCompanion/requests
        [HttpGet("requests")]
        public async Task<ActionResult<IEnumerable<FlightCompanionRequest>>> GetRequests()
        {
            return await _context.FlightCompanionRequests
                .Include(fcr => fcr.User)
                .Include(fcr => fcr.MatchedOffer)
                .Where(fcr => fcr.IsActive)
                .OrderByDescending(fcr => fcr.CreatedAt)
                .ToListAsync();
        }

        // GET: api/FlightCompanion/offers
        [HttpGet("offers")]
        public async Task<ActionResult<IEnumerable<FlightCompanionOffer>>> GetOffers()
        {
            return await _context.FlightCompanionOffers
                .Include(fco => fco.User)
                .Where(fco => fco.IsAvailable)
                .OrderByDescending(fco => fco.CreatedAt)
                .ToListAsync();
        }

        // GET: api/FlightCompanion/requests/5
        [HttpGet("requests/{id}")]
        public async Task<ActionResult<FlightCompanionRequest>> GetRequest(int id)
        {
            if (id <= 0)
            {
                return BadRequest("Invalid request ID.");
            }

            var request = await _context.FlightCompanionRequests
                .Include(fcr => fcr.User)
                .Include(fcr => fcr.MatchedOffer)
                .FirstOrDefaultAsync(fcr => fcr.Id == id);

            if (request == null)
            {
                return NotFound($"Flight companion request with ID {id} not found.");
            }

            return request;
        }

        // POST: api/FlightCompanion/requests
        [HttpPost("requests")]
        public async Task<ActionResult<FlightCompanionRequest>> CreateRequest(FlightCompanionRequest request)
        {
            // Validate model state
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Additional business validation
            if (request.FlightDate <= DateTime.UtcNow)
            {
                ModelState.AddModelError("FlightDate", "Flight date must be in the future.");
                return BadRequest(ModelState);
            }

            if (request.OfferedAmount < 0)
            {
                ModelState.AddModelError("OfferedAmount", "Offered amount cannot be negative.");
                return BadRequest(ModelState);
            }

            // Validate airport codes
            var validAirports = new[] { "AKL", "PVG", "SHA", "PEK", "CAN", "SZX", "WLG", "CHC" };
            if (!validAirports.Contains(request.DepartureAirport?.ToUpper()))
            {
                ModelState.AddModelError("DepartureAirport", "Invalid departure airport code.");
                return BadRequest(ModelState);
            }

            if (!validAirports.Contains(request.ArrivalAirport?.ToUpper()))
            {
                ModelState.AddModelError("ArrivalAirport", "Invalid arrival airport code.");
                return BadRequest(ModelState);
            }

            // Set default values and timestamps
            request.CreatedAt = DateTime.UtcNow;
            request.IsActive = true;
            request.IsMatched = false;

            _context.FlightCompanionRequests.Add(request);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRequest), new { id = request.Id }, request);
        }

        // POST: api/FlightCompanion/offers
        [HttpPost("offers")]
        public async Task<ActionResult<FlightCompanionOffer>> CreateOffer(FlightCompanionOffer offer)
        {
            // Validate model state
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Additional business validation
            if (offer.FlightDate <= DateTime.UtcNow)
            {
                ModelState.AddModelError("FlightDate", "Flight date must be in the future.");
                return BadRequest(ModelState);
            }

            if (offer.RequestedAmount < 0)
            {
                ModelState.AddModelError("RequestedAmount", "Requested amount cannot be negative.");
                return BadRequest(ModelState);
            }

            // Validate airport codes
            var validAirports = new[] { "AKL", "PVG", "SHA", "PEK", "CAN", "SZX", "WLG", "CHC" };
            if (!validAirports.Contains(offer.DepartureAirport?.ToUpper()))
            {
                ModelState.AddModelError("DepartureAirport", "Invalid departure airport code.");
                return BadRequest(ModelState);
            }

            if (!validAirports.Contains(offer.ArrivalAirport?.ToUpper()))
            {
                ModelState.AddModelError("ArrivalAirport", "Invalid arrival airport code.");
                return BadRequest(ModelState);
            }

            // Set default values and timestamps
            offer.CreatedAt = DateTime.UtcNow;
            offer.IsAvailable = true;
            offer.HelpedCount = 0;

            _context.FlightCompanionOffers.Add(offer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOffers), new { id = offer.Id }, offer);
        }

        // GET: api/FlightCompanion/match/{requestId}
        [HttpGet("match/{requestId}")]
        public async Task<ActionResult<IEnumerable<FlightCompanionOffer>>> FindMatches(int requestId)
        {
            if (requestId <= 0)
            {
                return BadRequest("Invalid request ID.");
            }

            var request = await _context.FlightCompanionRequests.FindAsync(requestId);
            if (request == null)
            {
                return NotFound($"Flight companion request with ID {requestId} not found.");
            }

            // Find matching offers (same route and similar date)
            var matches = await _context.FlightCompanionOffers
                .Include(fco => fco.User)
                .Where(fco => fco.IsAvailable &&
                             fco.DepartureAirport == request.DepartureAirport &&
                             fco.ArrivalAirport == request.ArrivalAirport &&
                             fco.FlightDate.Date == request.FlightDate.Date)
                .OrderBy(fco => fco.RequestedAmount)
                .ToListAsync();

            return matches;
        }

        // PUT: api/FlightCompanion/match
        [HttpPut("match")]
        public async Task<IActionResult> MatchRequestWithOffer([FromBody] MatchRequest matchRequest)
        {
            // Validate model state
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (matchRequest.RequestId <= 0 || matchRequest.OfferId <= 0)
            {
                return BadRequest("Invalid request ID or offer ID.");
            }

            var request = await _context.FlightCompanionRequests.FindAsync(matchRequest.RequestId);
            var offer = await _context.FlightCompanionOffers.FindAsync(matchRequest.OfferId);

            if (request == null)
            {
                return NotFound($"Flight companion request with ID {matchRequest.RequestId} not found.");
            }

            if (offer == null)
            {
                return NotFound($"Flight companion offer with ID {matchRequest.OfferId} not found.");
            }

            if (request.IsMatched)
            {
                return BadRequest("Request is already matched.");
            }

            if (!offer.IsAvailable)
            {
                return BadRequest("Offer is no longer available.");
            }

            // Update match status
            request.IsMatched = true;
            request.MatchedOfferId = offer.Id;
            offer.HelpedCount++;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class MatchRequest
    {
        [Range(1, int.MaxValue, ErrorMessage = "Request ID must be greater than 0.")]
        public int RequestId { get; set; }
        
        [Range(1, int.MaxValue, ErrorMessage = "Offer ID must be greater than 0.")]
        public int OfferId { get; set; }
    }
}