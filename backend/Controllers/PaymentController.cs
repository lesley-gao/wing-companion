// PAYMENT CONTROLLER DISABLED FOR CURRENT SPRINT
// Payment features will be implemented in a future sprint

/*
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using NetworkingApp.Models;
using NetworkingApp.Models.DTOs;
using NetworkingApp.Services;
// using Stripe; // Payment feature disabled for current sprint
// using Stripe.Checkout; // Payment feature disabled for current sprint
using System.Threading.Tasks;

namespace NetworkingApp.Controllers
{
    /// <summary>
    /// Handles payment processing using Stripe.
    /// DISABLED FOR CURRENT SPRINT - Payment features not implemented
    /// </summary>
    // [ApiController]
    // [Route("api/[controller]")]
    // public class PaymentController : ControllerBase
    // {
    //     private readonly PaymentService _paymentService;
    //     private readonly StripeSettings _stripeSettings;

    //     public PaymentController(PaymentService paymentService, IOptions<StripeSettings> stripeOptions)
    //     {
    //         _paymentService = paymentService;
    //         _stripeSettings = stripeOptions.Value;
    //     }

    //     /// <summary>
    //     /// Creates a Stripe PaymentIntent for a given amount and currency.
    //     /// </summary>
    //     /// <param name="request">Payment intent request</param>
    //     /// <returns>Client secret for Stripe PaymentIntent</returns>
    //     [HttpPost("create-intent")]
    //     [Authorize]
    //     public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentIntentRequest request)
    //     {
    //         var options = new PaymentIntentCreateOptions
    //         {
    //             Amount = (long)(request.Amount * 100), // Stripe expects amount in cents
    //             Currency = request.Currency,
    //             Metadata = request.Metadata,
    //             ReceiptEmail = request.ReceiptEmail,
    //             Description = request.Description,
    //             AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions { Enabled = true }
    //         };
    //         var service = new PaymentIntentService();
    //         var paymentIntent = await service.CreateAsync(options);
    //         return Ok(new { clientSecret = paymentIntent.ClientSecret });
    //     }

    //     /// <summary>
    //     /// Confirms the payment and generates a receipt.
    //     /// </summary>
    //     /// <param name="request">Payment confirmation request</param>
    //     /// <returns>Receipt information</returns>
    //     [HttpPost("confirm")]
    //     public async Task<IActionResult> Confirm([FromBody] ConfirmPaymentRequest request)
    //     {
    //         var receipt = await _paymentService.ConfirmAndGenerateReceiptAsync(request.PaymentIntentId, request.UserId);
    //         if (receipt == null)
    //             return BadRequest("Payment confirmation failed.");
    //         return Ok(receipt);
    //     }

    //     /// <summary>
    //     /// Webhook endpoint for Stripe events (e.g., payment succeeded).
    //     /// </summary>
    //     [HttpPost("webhook")]
    //     [AllowAnonymous]
    //     public async Task<IActionResult> StripeWebhook()
    //     {
    //         var json = await new System.IO.StreamReader(HttpContext.Request.Body).ReadToEndAsync();
    //         var signatureHeader = Request.Headers["Stripe-Signature"];
    //         Event stripeEvent;
    //         try
    //         {
    //             stripeEvent = EventUtility.ConstructEvent(
    //                 json,
    //                 signatureHeader,
    //                 _stripeSettings.WebhookSecret
    //             );
    //         }
    //         catch (StripeException)
    //         {
    //             return BadRequest();
    //         }
    //         // TODO: Handle event types (e.g., payment_intent.succeeded)
    //         return Ok();
    //     }

    //     /// <summary>
    //     /// Gets the payment history for the authenticated user.
    //     /// </summary>
    //     /// <returns>List of payments for the user.</returns>
    //     [HttpGet("history")]
    //     [Authorize]
    //     public async Task<IActionResult> GetPaymentHistory()
    //     {
    //         try
    //         {
    //             var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    //             if (string.IsNullOrEmpty(userId))
    //                 return Unauthorized();

    //             var payments = await _paymentService.GetPaymentHistoryAsync(userId);
    //             return Ok(payments);
    //         }
    //         catch (Exception ex)
    //         {
    //             return StatusCode(500, new { error = "Failed to retrieve payment history", details = ex.Message });
    //         }
    //     }

    //     /// <summary>
    //     /// Gets a specific payment by ID.
    //     /// </summary>
    //     /// <param name="id">Payment ID</param>
    //     /// <returns>Payment information</returns>
    //     [HttpGet("{id}")]
    //     [Authorize]
    //     public async Task<IActionResult> GetPayment(int id)
    //     {
    //         try
    //         {
    //             var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    //             if (string.IsNullOrEmpty(userId))
    //                 return Unauthorized();

    //             var payment = await _paymentService.GetPaymentAsync(id, userId);
    //             if (payment == null)
    //                 return NotFound();

    //             return Ok(payment);
    //         }
    //         catch (Exception ex)
    //         {
    //             return StatusCode(500, new { error = "Failed to retrieve payment", details = ex.Message });
    //         }
    //     }
    // }

    // public class CreatePaymentIntentRequest
    // {
    //     public decimal Amount { get; set; }
    //     public string Currency { get; set; } = "nzd";
    //     public string? ReceiptEmail { get; set; }
    //     public string? Description { get; set; }
    //     public System.Collections.Generic.Dictionary<string, string>? Metadata { get; set; }
    // }

    // public class ConfirmPaymentRequest
    // {
    //     public string PaymentIntentId { get; set; } = null!;
    //     public string UserId { get; set; } = null!;
    // }
}
*/
