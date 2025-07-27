// PAYMENT CONTROLLER INTEGRATION TESTS DISABLED FOR CURRENT SPRINT
// Payment features will be implemented in a future sprint

/*
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using NetworkingApp.Data;
using NetworkingApp.Models;
using System.Net;
using System.Net.Http.Json;

namespace NetworkingApp.Tests.Integration
{
    /// <summary>
    /// Integration tests for Payment endpoints.
    /// DISABLED FOR CURRENT SPRINT
    /// </summary>
    // public class PaymentControllerIntegrationTests : IntegrationTestBase
    // {
    //     public PaymentControllerIntegrationTests(WebApplicationFactory<Program> factory) : base(factory)
    //     {
    //     }

    //     [Fact]
    //     public async Task CreatePaymentIntent_WithValidData_ShouldReturnClientSecret()
    //     {
    //         // Arrange
    //         var user = await CreateTestUser();
    //         var token = await GetAuthToken(user);

    //         var paymentRequest = new
    //         {
    //             Amount = 50.00m,
    //             Currency = "nzd",
    //             ReceiptEmail = "test@example.com",
    //             Description = "Test payment for flight companion service",
    //             Metadata = new Dictionary<string, string> { { "serviceType", "flight-companion" } }
    //         };

    //         // Act
    //         _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    //         var response = await _client.PostAsync("/api/payment/create-intent", CreateJsonContent(paymentRequest));

    //         // Assert
    //         response.StatusCode.Should().Be(HttpStatusCode.OK);
    //         var result = await response.Content.ReadFromJsonAsync<dynamic>();
    //         result.Should().NotBeNull();
    //         ((string)result.clientSecret).Should().NotBeNullOrEmpty();
    //     }

    //     [Fact]
    //     public async Task CreatePaymentIntent_WithoutAuthentication_ShouldReturnUnauthorized()
    //     {
    //         // Arrange
    //         var paymentRequest = new
    //         {
    //             Amount = 50.00m,
    //             Currency = "nzd",
    //             ReceiptEmail = "test@example.com",
    //             Description = "Test payment"
    //         };

    //         // Act
    //         var response = await _client.PostAsync("/api/payment/create-intent", CreateJsonContent(paymentRequest));

    //         // Assert
    //         response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    //     }

    //     [Fact]
    //     public async Task CreatePaymentIntent_WithInvalidAmount_ShouldReturnBadRequest()
    //     {
    //         // Arrange
    //         var user = await CreateTestUser();
    //         var token = await GetAuthToken(user);

    //         var paymentRequest = new
    //         {
    //             Amount = -10.00m, // Invalid negative amount
    //             Currency = "nzd",
    //             ReceiptEmail = "test@example.com",
    //             Description = "Test payment"
    //         };

    //         // Act
    //         _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    //         var response = await _client.PostAsync("/api/payment/create-intent", CreateJsonContent(paymentRequest));

    //         // Assert
    //         response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    //     }

    //     [Fact]
    //     public async Task CreateCheckoutSession_WithValidData_ShouldReturnCheckoutUrl()
    //     {
    //         // Arrange
    //         var user = await CreateTestUser();
    //         var token = await GetAuthToken(user);

    //         var checkoutRequest = new
    //         {
    //             Amount = 50.00m,
    //             Currency = "nzd",
    //             SuccessUrl = "https://localhost:3000/payment/success",
    //             CancelUrl = "https://localhost:3000/payment/cancel",
    //             Description = "Flight companion service payment",
    //             Metadata = new Dictionary<string, string> { { "serviceType", "flight-companion" } }
    //         };

    //         // Act
    //         _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    //         var response = await _client.PostAsync("/api/payment/create-checkout-session", CreateJsonContent(checkoutRequest));

    //         // Assert
    //         response.StatusCode.Should().Be(HttpStatusCode.OK);
    //         var content = await response.Content.ReadAsStringAsync();
    //         content.Should().Contain("url"); // Stripe checkout session URL
    //     }

    //     [Fact]
    //     public async Task ConfirmPayment_WithValidPaymentIntentId_ShouldReturnSuccess()
    //     {
    //         // Arrange
    //         var user = await CreateTestUser();
    //         var token = await GetAuthToken(user);

    //         // Create a payment record in the database first
    //         var payment = new Payment
    //         {
    //             UserId = user.Id,
    //             Amount = 50.00m,
    //             Currency = "NZD",
    //             PaymentIntentId = "pi_test_12345",
    //             Status = "pending",
    //             Description = "Test payment",
    //             CreatedAt = DateTime.UtcNow
    //         };

    //         using var scope = _factory.Services.CreateScope();
    //         var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    //         _context.Payments.Add(payment);
    //         await _context.SaveChangesAsync();

    //         var confirmRequest = new
    //         {
    //             PaymentIntentId = "pi_test_12345"
    //         };

    //         // Act
    //         _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    //         var response = await _client.PostAsync("/api/payment/confirm", CreateJsonContent(confirmRequest));

    //         // Assert
    //         // Note: This will likely fail in a real test environment without actual Stripe integration
    //         response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.BadRequest);
    //     }

    //     [Fact]
    //     public async Task GetPaymentHistory_WhenAuthenticated_ShouldReturnUserPayments()
    //     {
    //         // Arrange
    //         var user = await CreateTestUser();
    //         var token = await GetAuthToken(user);

    //         // Create test payments for the user
    //         var payment1 = new Payment
    //         {
    //             UserId = user.Id,
    //             Amount = 50.00m,
    //             Currency = "NZD",
    //             PaymentIntentId = "pi_test_1",
    //             Status = "completed",
    //             Description = "Flight companion payment 1"
    //         };

    //         var payment2 = new Payment
    //         {
    //             UserId = user.Id,
    //             Amount = 30.00m,
    //             Currency = "NZD",
    //             PaymentIntentId = "pi_test_2",
    //             Status = "completed",
    //             Description = "Flight companion payment 2"
    //         };

    //         // Create payment for different user (should not be returned)
    //         var otherUser = await CreateTestUser("other@example.com");
    //         var otherPayment = new Payment
    //         {
    //             UserId = otherUser.Id,
    //             Amount = 25.00m,
    //             Currency = "NZD",
    //             PaymentIntentId = "pi_test_3",
    //             Status = "completed",
    //             Description = "Other user payment"
    //         };

    //         using var scope = _factory.Services.CreateScope();
    //         var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    //         _context.Payments.AddRange(payment1, payment2, otherPayment);
    //         await _context.SaveChangesAsync();

    //         // Act
    //         _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    //         var response = await _client.GetAsync("/api/payment/history");

    //         // Assert
    //         response.StatusCode.Should().Be(HttpStatusCode.OK);
    //         var payments = await DeserializeResponseAsync<List<Payment>>(response);
    //         payments.Should().NotBeNull();
    //         payments.Should().HaveCount(2); // Only current user's payments
    //         payments!.All(p => p.UserId == user.Id).Should().BeTrue();
    //         payments.Should().Contain(p => p.PaymentIntentId == "pi_test_1");
    //         payments.Should().Contain(p => p.PaymentIntentId == "pi_test_2");
    //         payments.Should().NotContain(p => p.PaymentIntentId == "pi_test_3");
    //     }

    //     [Fact]
    //     public async Task GetPaymentHistory_WithoutAuthentication_ShouldReturnUnauthorized()
    //     {
    //         // Act
    //         var response = await _client.GetAsync("/api/payment/history");

    //         // Assert
    //         response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    //     }

    //     [Fact]
    //     public async Task GetPayment_WithValidId_ShouldReturnPayment()
    //     {
    //         // Arrange
    //         var user = await CreateTestUser();
    //         var token = await GetAuthToken(user);

    //         var payment = new Payment
    //         {
    //             UserId = user.Id,
    //             Amount = 50.00m,
    //             Currency = "NZD",
    //             PaymentIntentId = "pi_test_123",
    //             Status = "completed",
    //             Description = "Test payment"
    //         };

    //         using var scope = _factory.Services.CreateScope();
    //         var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    //         _context.Payments.Add(payment);
    //         await _context.SaveChangesAsync();

    //         // Act
    //         _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    //         var response = await _client.GetAsync($"/api/payment/{payment.Id}");

    //         // Assert
    //         response.StatusCode.Should().Be(HttpStatusCode.OK);
    //         var returnedPayment = await DeserializeResponseAsync<Payment>(response);
    //         returnedPayment.Should().NotBeNull();
    //         returnedPayment!.Id.Should().Be(payment.Id);
    //         returnedPayment.PaymentIntentId.Should().Be("pi_test_123");
    //     }
    // }
}
*/
