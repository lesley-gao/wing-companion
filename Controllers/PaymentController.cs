using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using NetworkingApp.Models;
using Stripe;
using Stripe.Checkout;
using System.Threading.Tasks;

namespace NetworkingApp.Controllers
{
    /// <summary>
    /// Handles payment processing using Stripe.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly StripeSettings _stripeSettings;

        public PaymentController(IOptions<StripeSettings> stripeOptions)
        {
            _stripeSettings = stripeOptions.Value;
        }

        /// <summary>
        /// Creates a Stripe PaymentIntent for a given amount and currency.
        /// </summary>
        /// <param name="request">Payment intent request</param>
        /// <returns>Client secret for Stripe PaymentIntent</returns>
        [HttpPost("create-intent")]
        [Authorize]
        public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentIntentRequest request)
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(request.Amount * 100), // Stripe expects amount in cents
                Currency = request.Currency,
                Metadata = request.Metadata,
                ReceiptEmail = request.ReceiptEmail,
                Description = request.Description,
                AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions { Enabled = true }
            };
            var service = new PaymentIntentService();
            var paymentIntent = await service.CreateAsync(options);
            return Ok(new { clientSecret = paymentIntent.ClientSecret });
        }

        /// <summary>
        /// Webhook endpoint for Stripe events (e.g., payment succeeded).
        /// </summary>
        [HttpPost("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new System.IO.StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var signatureHeader = Request.Headers["Stripe-Signature"];
            Event stripeEvent;
            try
            {
                stripeEvent = EventUtility.ConstructEvent(
                    json,
                    signatureHeader,
                    _stripeSettings.WebhookSecret
                );
            }
            catch (StripeException)
            {
                return BadRequest();
            }
            // TODO: Handle event types (e.g., payment_intent.succeeded)
            return Ok();
        }
    }

    /// <summary>
    /// Request model for creating a payment intent.
    /// </summary>
    public class CreatePaymentIntentRequest
    {
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "nzd";
        public string? ReceiptEmail { get; set; }
        public string? Description { get; set; }
        public System.Collections.Generic.Dictionary<string, string>? Metadata { get; set; }
    }
}
