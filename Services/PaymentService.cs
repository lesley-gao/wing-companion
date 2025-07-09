using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NetworkingApp.Data;
using NetworkingApp.Models;
using Stripe;

namespace NetworkingApp.Services
{
    /// <summary>
    /// Handles payment and escrow business logic: holding funds on match, releasing on completion.
    /// </summary>
    public class PaymentService
    {
        private readonly ApplicationDbContext _dbContext;
        public PaymentService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Creates an escrow record and associates it with a Payment when a match is confirmed.
        /// </summary>
        /// <param name="paymentId">The Payment entity ID.</param>
        /// <param name="amount">The amount to hold in escrow.</param>
        /// <returns></returns>
        public async Task<Escrow> HoldFundsAsync(int paymentId, decimal amount)
        {
            var payment = await _dbContext.Payments.Include(p => p.Escrow).FirstOrDefaultAsync(p => p.Id == paymentId);
            if (payment == null) throw new InvalidOperationException("Payment not found");
            if (payment.Escrow != null) throw new InvalidOperationException("Escrow already exists for this payment");

            var escrow = new Escrow
            {
                PaymentId = paymentId,
                Amount = amount,
                Status = EscrowStatus.Held,
                CreatedAt = DateTime.UtcNow
            };
            payment.Escrow = escrow;
            payment.Status = PaymentStatus.HeldInEscrow.ToString();
            await _dbContext.Escrows.AddAsync(escrow);
            await _dbContext.SaveChangesAsync();
            return escrow;
        }

        /// <summary>
        /// Releases funds from escrow when the service is completed.
        /// </summary>
        /// <param name="escrowId">The Escrow entity ID.</param>
        /// <returns></returns>
        public async Task ReleaseFundsAsync(int escrowId)
        {
            var escrow = await _dbContext.Escrows.Include(e => e.Payment).FirstOrDefaultAsync(e => e.Id == escrowId);
            if (escrow == null) throw new InvalidOperationException("Escrow not found");
            if (escrow.Status != EscrowStatus.Held) throw new InvalidOperationException("Escrow is not in held state");

            escrow.Status = EscrowStatus.Released;
            escrow.ReleasedAt = DateTime.UtcNow;
            if (escrow.Payment != null)
                escrow.Payment.Status = PaymentStatus.Released.ToString();
            await _dbContext.SaveChangesAsync();
        }
    }
}
