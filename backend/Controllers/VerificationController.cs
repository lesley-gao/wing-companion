using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using NetworkingApp.Data;
using NetworkingApp.Models;
using NetworkingApp.Services;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;

namespace NetworkingApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VerificationController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IEmailService _emailService;
        private readonly IBlobStorageService _blobStorageService;
        // private readonly ITelemetryService _telemetryService; // Disabled for now
        private readonly ILogger<VerificationController> _logger;

        public VerificationController(
            ApplicationDbContext db, 
            IEmailService emailService,
            IBlobStorageService blobStorageService,
            // ITelemetryService telemetryService, // Disabled for now
            ILogger<VerificationController> logger)
        {
            _db = db;
            _emailService = emailService;
            _blobStorageService = blobStorageService;
            // _telemetryService = telemetryService; // Disabled for now
            _logger = logger;
        }

        /// <summary>
        /// Uploads a verification document for the current user.
        /// </summary>
        [HttpPost("upload")]
        [Authorize]
        [RequestSizeLimit(10 * 1024 * 1024)] // 10MB limit
        public async Task<IActionResult> UploadDocument()
        {
            _logger.LogInformation("=== UploadDocument method called ===");
            _logger.LogInformation("Request Content-Type: {ContentType}", Request.ContentType);
            _logger.LogInformation("Request has form: {HasForm}", Request.HasFormContentType);
            try
            {
                // Manually extract the file from the request
                var file = Request.Form.Files.FirstOrDefault();
                _logger.LogInformation("Files in request: {FileCount}", Request.Form.Files.Count);
                _logger.LogInformation("Form fields count: {FormFieldsCount}", Request.Form.Count);

                _logger.LogInformation("Starting upload for file: {FileName}, Size: {FileSize}, ContentType: {ContentType}", 
                    file?.FileName, file?.Length, file?.ContentType);

                if (file == null || file.Length == 0)
                {
                    _logger.LogWarning("No file uploaded or file is empty");
                    return BadRequest(new { message = "No file uploaded" });
                }

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                _logger.LogInformation("User ID from claims: {UserId}", userIdClaim);

                if (!int.TryParse(userIdClaim, out int userId))
                {
                    _logger.LogWarning("Invalid user ID claim: {UserIdClaim}", userIdClaim);
                    return Unauthorized(new { message = "Invalid user context" });
                }

                _logger.LogInformation("About to call BlobStorageService.UploadVerificationDocumentAsync");

                // Upload to blob storage
                using var fileStream = file.OpenReadStream();
                var uploadResult = await _blobStorageService.UploadVerificationDocumentAsync(
                    fileStream, file.FileName, file.ContentType, userId);

                _logger.LogInformation("BlobStorageService result: IsSuccess={IsSuccess}, ErrorMessage={ErrorMessage}", 
                    uploadResult.IsSuccess, uploadResult.ErrorMessage);

                if (!uploadResult.IsSuccess)
                {
                    _logger.LogWarning("Blob storage upload failed: {ErrorMessage}", uploadResult.ErrorMessage);
                    return BadRequest(new { message = uploadResult.ErrorMessage });
                }

                // Check if user already has a verification document
                var existingDocument = await _db.VerificationDocuments
                    .FirstOrDefaultAsync(vd => vd.UserId == userId);

                if (existingDocument != null && !existingDocument.IsRejected)
                {
                    return BadRequest(new { message = "User already has a verification document. Only rejected documents can be replaced." });
                }

                // Save metadata to database
                var verificationDocument = new VerificationDocument
                {
                    UserId = userId,
                    FileName = file.FileName,
                    BlobUri = uploadResult.BlobUri!,
                    ContentType = file.ContentType,
                    UploadedAt = DateTime.UtcNow,
                    IsApproved = false,
                    IsRejected = false
                };

                // If replacing a rejected document, remove the old one
                if (existingDocument != null)
                {
                    _db.VerificationDocuments.Remove(existingDocument);
                }

                _db.VerificationDocuments.Add(verificationDocument);
                await _db.SaveChangesAsync();

                _logger.LogInformation("Verification document uploaded successfully for user {UserId}: {FileName}", 
                    userId, file.FileName);

                return Ok(new 
                { 
                    message = "Document uploaded successfully",
                    documentId = verificationDocument.Id,
                    fileName = file.FileName,
                    uploadedAt = verificationDocument.UploadedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading verification document");
                // _telemetryService.TrackException(ex, new Dictionary<string, string>
                // {
                //     ["operation"] = "UploadVerificationDocument",
                //     ["controller"] = "VerificationController"
                // }); // Disabled for now
                return StatusCode(500, new { message = "An error occurred while uploading the document" });
            }
        }

        /// <summary>
        /// Test endpoint to verify the route is working
        /// </summary>
        [HttpGet("test")]
        [Authorize]
        public IActionResult Test()
        {
            _logger.LogInformation("=== Test endpoint called ===");
            return Ok(new { message = "Verification controller is working", timestamp = DateTime.UtcNow });
        }

        /// <summary>
        /// Temporary endpoint to create the VerificationDocuments table
        /// </summary>
        [HttpPost("create-table")]
        [Authorize]
        public IActionResult CreateTable()
        {
            try
            {
                _db.Database.ExecuteSqlRaw(@"
                    CREATE TABLE IF NOT EXISTS VerificationDocuments (
                        Id INTEGER PRIMARY KEY AUTOINCREMENT,
                        UserId INTEGER NOT NULL,
                        FileName TEXT NOT NULL,
                        BlobUri TEXT NOT NULL,
                        ContentType TEXT,
                        UploadedAt TEXT NOT NULL,
                        IsApproved INTEGER NOT NULL DEFAULT 0,
                        IsRejected INTEGER NOT NULL DEFAULT 0,
                        AdminComment TEXT,
                        FOREIGN KEY (UserId) REFERENCES AspNetUsers(Id)
                    );");
                
                return Ok(new { message = "VerificationDocuments table created successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating VerificationDocuments table");
                return StatusCode(500, new { message = "Error creating table", error = ex.Message });
            }
        }

        /// <summary>
        /// Gets the current user's verification status and document info.
        /// </summary>
        [HttpGet("status")]
        [Authorize]
        public async Task<IActionResult> GetStatus()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user context" });
                }

                var verificationDocument = await _db.VerificationDocuments
                    .Where(vd => vd.UserId == userId)
                    .OrderByDescending(vd => vd.UploadedAt)
                    .FirstOrDefaultAsync();

                if (verificationDocument == null)
                {
                    return Ok(new 
                    { 
                        status = "not_submitted",
                        message = "No verification document submitted"
                    });
                }

                var status = verificationDocument.IsApproved ? "approved" : 
                            verificationDocument.IsRejected ? "rejected" : "pending";

                return Ok(new
                {
                    status = status,
                    documentId = verificationDocument.Id,
                    fileName = verificationDocument.FileName,
                    uploadedAt = verificationDocument.UploadedAt,
                    adminComment = verificationDocument.AdminComment
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting verification status");
                return StatusCode(500, new { message = "An error occurred while retrieving verification status" });
            }
        }

        /// <summary>
        /// Downloads a verification document (admin only or document owner).
        /// </summary>
        [HttpGet("download/{documentId}")]
        [Authorize]
        public async Task<IActionResult> DownloadDocument(int documentId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid user context" });
                }

                var verificationDocument = await _db.VerificationDocuments
                    .FirstOrDefaultAsync(vd => vd.Id == documentId);

                if (verificationDocument == null)
                {
                    return NotFound(new { message = "Document not found" });
                }

                // Check if user owns the document or is an admin
                var isAdmin = User.IsInRole("Admin");
                if (verificationDocument.UserId != userId && !isAdmin)
                {
                    return Forbid();
                }

                try
                {
                    // Robustly extract blob name from BlobUri
                    var blobUri = new Uri(verificationDocument.BlobUri);
                    var containerName = "verification-documents";
                    var path = blobUri.AbsolutePath;
                    var containerIndex = path.IndexOf(containerName + "/", StringComparison.OrdinalIgnoreCase);
                    if (containerIndex >= 0)
                    {
                        var blobName = path.Substring(containerIndex + containerName.Length + 1);
                        var downloadUrl = await _blobStorageService.GenerateSecureDownloadUrlAsync(
                            blobName, TimeSpan.FromMinutes(15));
                        return Ok(new { downloadUrl = downloadUrl });
                    }
                    else
                    {
                        _logger.LogError("Could not extract blob name from BlobUri: {BlobUri}", verificationDocument.BlobUri);
                        return StatusCode(500, new { message = "Could not extract blob name from BlobUri" });
                    }
                }
                catch (FileNotFoundException ex)
                {
                    _logger.LogWarning(ex, "Blob not found for document {DocumentId}", documentId);
                    return NotFound(new { message = "Document file not found in storage" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading verification document {DocumentId}", documentId);
                return StatusCode(500, new { message = "An error occurred while generating download link" });
            }
        }

        /// <summary>
        /// Admin: Lists all pending verification documents.
        /// </summary>
        [HttpGet("pending")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ListPending()
        {
            try
            {
                var pendingDocuments = await _db.VerificationDocuments
                    .Include(vd => vd.User)
                    .Where(vd => !vd.IsApproved && !vd.IsRejected)
                    .OrderBy(vd => vd.UploadedAt)
                    .Select(vd => new
                    {
                        documentId = vd.Id,
                        userId = vd.UserId,
                        userName = vd.User!.UserName,
                        fileName = vd.FileName,
                        uploadedAt = vd.UploadedAt,
                        contentType = vd.ContentType
                    })
                    .ToListAsync();

                return Ok(pendingDocuments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error listing pending verification documents");
                return StatusCode(500, new { message = "An error occurred while retrieving pending documents" });
            }
        }

        /// <summary>
        /// Admin: Approves or rejects a verification document.
        /// </summary>
        [HttpPost("review/{documentId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Review(int documentId, [FromBody] VerificationReviewDto dto)
        {
            try
            {
                var verificationDocument = await _db.VerificationDocuments
                    .Include(vd => vd.User)
                    .FirstOrDefaultAsync(vd => vd.Id == documentId);

                if (verificationDocument == null)
                {
                    return NotFound(new { message = "Document not found" });
                }

                if (verificationDocument.IsApproved || verificationDocument.IsRejected)
                {
                    return BadRequest(new { message = "Document has already been reviewed" });
                }

                // Update document status
                verificationDocument.IsApproved = dto.Approve;
                verificationDocument.IsRejected = !dto.Approve;
                verificationDocument.AdminComment = dto.Comment;

                // Update user verification status
                if (verificationDocument.User != null)
                {
                    verificationDocument.User.IsVerified = dto.Approve;
                    _db.Entry(verificationDocument.User).Property(u => u.IsVerified).IsModified = true;
                }
                else
                {
                    _logger.LogWarning("User entity is null for verification document {DocumentId}", documentId);
                }

                await _db.SaveChangesAsync();

                // Track telemetry - DISABLED FOR NOW
                // _telemetryService.TrackVerificationDocumentProcessed(
                //     verificationDocument.UserId, 
                //     verificationDocument.FileName, 
                //     dto.Approve, 
                //     dto.Comment);

                // Send notification email to user
                var user = verificationDocument.User!;
                var subject = dto.Approve ? "Document Verification Approved" : "Document Verification Rejected";
                var message = dto.Approve 
                    ? "Your verification document has been approved. You can now access all platform features."
                    : $"Your verification document has been rejected. Reason: {dto.Comment ?? "No reason provided"}. Please upload a new document.";

                await _emailService.SendEmailAsync(user.Email!, subject, message);

                _logger.LogInformation("Verification document {DocumentId} {Status} for user {UserId}", 
                    documentId, dto.Approve ? "approved" : "rejected", verificationDocument.UserId);

                return Ok(new 
                { 
                    message = $"Document {(dto.Approve ? "approved" : "rejected")} successfully",
                    documentId = documentId,
                    status = dto.Approve ? "approved" : "rejected"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reviewing verification document {DocumentId}", documentId);
                return StatusCode(500, new { message = "An error occurred while reviewing the document" });
            }
        }
    }

    public class VerificationReviewDto
    {
        public bool Approve { get; set; }
        public string? Comment { get; set; }
    }
}
