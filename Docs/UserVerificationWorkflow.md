# User Verification Workflow & API

This document describes the user verification workflow, document upload, and admin approval process.

## Workflow Overview
1. User uploads a verification document (e.g., passport, ID) via `/api/verification/upload`.
2. Document is stored securely in Azure Blob Storage; metadata is saved in the database.
3. Admin reviews pending documents via `/api/verification/pending` and approves or rejects via `/api/verification/review/{id}`.
4. User receives email notification on approval or rejection.
5. User can check their verification status via `/api/verification/status`.

## API Endpoints
- `POST /api/verification/upload` (User): Upload verification document (multipart/form-data)
- `GET /api/verification/status` (User): Get current verification status and document info
- `GET /api/verification/pending` (Admin): List all pending verifications
- `POST /api/verification/review/{id}` (Admin): Approve or reject a document

## Security
- All endpoints require authentication; admin endpoints require `Admin` role.
- Documents are stored in Azure Blob Storage with secure access policies.
- Only admins can approve/reject documents.

## Implementation Notes
- See `VerificationDocument` model for metadata fields.
- Email notifications are sent on status change.
- All actions are logged for audit purposes.

## References
- [Azure Blob Storage Documentation](https://learn.microsoft.com/en-us/azure/storage/blobs/)
- [IdentityConfiguration.md](IdentityConfiguration.md)
- [JwtAuthMiddleware.md](JwtAuthMiddleware.md)
