using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetworkingApp.Data;
using NetworkingApp.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
            var request = await _context.FlightCompanionRequests
                .Include(fcr => fcr.User)
                .Include(fcr => fcr.MatchedOffer)
                .FirstOrDefaultAsync(fcr => fcr.Id == id);

            if (request == null)
            {
                return NotFound();
            }

            return request;
        }

        // POST: api/FlightCompanion/requests
        [HttpPost("requests")]
        public async Task<ActionResult<FlightCompanionRequest>> CreateRequest(FlightCompanionRequest request)
        {
            _context.FlightCompanionRequests.Add(request);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRequest), new { id = request.Id }, request);
        }

        // POST: api/FlightCompanion/offers
        [HttpPost("offers")]
        public async Task<ActionResult<FlightCompanionOffer>> CreateOffer(FlightCompanionOffer offer)
        {
            _context.FlightCompanionOffers.Add(offer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOffers), new { id = offer.Id }, offer);
        }

        // GET: api/FlightCompanion/match/{requestId}
        [HttpGet("match/{requestId}")]
        public async Task<ActionResult<IEnumerable<FlightCompanionOffer>>> FindMatches(int requestId)
        {
            var request = await _context.FlightCompanionRequests.FindAsync(requestId);
            if (request == null)
            {
                return NotFound();
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
            var request = await _context.FlightCompanionRequests.FindAsync(matchRequest.RequestId);
            var offer = await _context.FlightCompanionOffers.FindAsync(matchRequest.OfferId);

            if (request == null || offer == null)
            {
                return NotFound();
            }

            request.IsMatched = true;
            request.MatchedOfferId = offer.Id;
            offer.HelpedCount++;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class MatchRequest
    {
        public int RequestId { get; set; }
        public int OfferId { get; set; }
    }
}
