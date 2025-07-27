// PAYMENT SERVICE DISABLED FOR CURRENT SPRINT
// Payment features will be implemented in a future sprint

/*
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NetworkingApp.Data;
using NetworkingApp.Models;
using NetworkingApp.Models.DTOs;
// using Stripe; // Payment feature disabled for current sprint

namespace NetworkingApp.Services
{
    /// <summary>
    /// Handles payment and escrow business logic: holding funds on match, releasing on completion.
    /// DISABLED FOR CURRENT SPRINT
    /// </summary>
    // public class PaymentService
    // {
    //     private readonly ApplicationDbContext _dbContext;
    //     private readonly IEmailService _emailService;

    //     public PaymentService(ApplicationDbContext dbContext, IEmailService emailService)
    //     {
    //         _dbContext = dbContext;
    //         _emailService = emailService;
    //     }

    //     /// <summary>
    //     /// Creates an escrow record and associates it with a Payment when a match is confirmed.
    //     /// </summary>
    //     /// <param name="paymentId">The Payment entity ID.</param>
    //     /// <param name="amount">The amount to hold in escrow.</param>
    //     /// <returns></returns>
    //     public async Task<Escrow> HoldFundsAsync(int paymentId, decimal amount)
    //     {
    //         var payment = await _dbContext.Payments.Include(p => p.Escrow).FirstOrDefaultAsync(p => p.Id == paymentId);
    //         if (payment == null) throw new InvalidOperationException("Payment not found");
    //         if (payment.Escrow != null) throw new InvalidOperationException("Escrow already exists for this payment");

    //         var escrow = new Escrow
    //         {
    //             PaymentId = paymentId,
    //             Amount = amount,
    //             Status = EscrowStatus.Held,
    //             CreatedAt = DateTime.UtcNow
    //         };
    //         payment.Escrow = escrow;
    //         payment.Status = PaymentStatus.HeldInEscrow.ToString();
    //         await _dbContext.Escrows.AddAsync(escrow);
    //         await _dbContext.SaveChangesAsync();
    //         return escrow;
    //     }

    //     /// <summary>
    //     /// Releases funds from escrow when the service is completed.
    //     /// </summary>
    //     /// <param name="escrowId">The Escrow entity ID.</param>
    //     /// <returns></returns>
    //     public async Task ReleaseFundsAsync(int escrowId)
    //     {
    //         var escrow = await _dbContext.Escrows.Include(e => e.Payment).FirstOrDefaultAsync(e => e.Id == escrowId);
    //         if (escrow == null) throw new InvalidOperationException("Escrow not found");
    //         if (escrow.Status != EscrowStatus.Held) throw new InvalidOperationException("Escrow is not in held state");

    //         escrow.Status = EscrowStatus.Released;
    //         escrow.ReleasedAt = DateTime.UtcNow;
    //         if (escrow.Payment != null)
    //             escrow.Payment.Status = PaymentStatus.Released.ToString();
    //         await _dbContext.SaveChangesAsync();
    //     }

    //     /// <summary>
    //     /// Confirms payment and generates a receipt.
    //     /// </summary>
    //     /// <param name="paymentIntentId">The payment intent ID from Stripe.</param>
    //     /// <param name="userId">The ID of the user receiving the receipt.</param>
    //     /// <returns>A task that represents the asynchronous operation, containing the receipt data transfer object.</returns>
    //     public async Task<ReceiptDto?> ConfirmAndGenerateReceiptAsync(string paymentIntentId, string userId)
    //     {
    //         // 1. Retrieve payment from Stripe
    //         var service = new PaymentIntentService();
    //         var paymentIntent = await service.GetAsync(paymentIntentId);

    //         if (paymentIntent.Status != "succeeded")
    //             return null;

    //         // 2. Update Payment/Escrow status in DB (pseudo-code)
    //         // var payment = await _db.Payments.FirstOrDefaultAsync(p => p.PaymentIntentId == paymentIntentId);
    //         // payment.Status = PaymentStatus.Confirmed;
    //         // await _db.SaveChangesAsync();

    //         // 3. Generate receipt
    //         var receipt = new ReceiptDto
    //         {
    //             ReceiptId = Guid.NewGuid().ToString(),
    //             PaymentIntentId = paymentIntentId,
    //             UserEmail = paymentIntent.ReceiptEmail,
    //             Amount = (decimal)paymentIntent.AmountReceived / 100,
    //             Currency = paymentIntent.Currency.ToUpper(),
    //             PaidAt = DateTime.UtcNow,
    //             ServiceType = "Flight Companion / Pickup", // Set appropriately
    //             Description = paymentIntent.Description ?? "Payment for service",
    //             Status = "Completed"
    //         };

    //         // 4. Send receipt email
    //         if (!string.IsNullOrEmpty(receipt.UserEmail))
    //         {
    //             await _emailService.SendReceiptEmailAsync(receipt.UserEmail, receipt);
    //         }

    //         return receipt;
    //     }

    //     /// <summary>
    //     /// Gets payment history for a specific user.
    //     /// </summary>
    //     /// <param name="userId">The ID of the user.</param>
    //     /// <returns>A list of payments for the user.</returns>
    //     public async Task<List<Payment>> GetPaymentHistoryAsync(string userId)
    //     {
    //         return await _dbContext.Payments
    //             .Where(p => p.UserId == userId)
    //             .OrderByDescending(p => p.CreatedAt)
    //             .ToListAsync();
    //     }

    //     /// <summary>
    //     /// Gets a specific payment by ID for a user.
    //     /// </summary>
    //     /// <param name="paymentId">The payment ID.</param>
    //     /// <param name="userId">The user ID.</param>
    //     /// <returns>The payment if found and belongs to the user.</returns>
    //     public async Task<Payment?> GetPaymentAsync(int paymentId, string userId)
    //     {
    //         return await _dbContext.Payments
    //             .FirstOrDefaultAsync(p => p.Id == paymentId && p.UserId == userId);
    //     }
    // }
}
*/
