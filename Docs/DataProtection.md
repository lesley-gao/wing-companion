# Data Encryption for Sensitive User Information

This document describes the use of ASP.NET Core Data Protection for encrypting sensitive user data in the NetworkingApp platform.

## Implementation
- ASP.NET Core Data Protection is registered in `Program.cs` with file system key storage (`DataProtectionKeys` directory).
- `IDataProtectionService` and `DataProtectionService` provide methods to encrypt (protect) and decrypt (unprotect) sensitive fields.
- Use a unique `purpose` string for each data type (e.g., "EmergencyContact", "VerificationDocumentUri").

## Usage Example
```
// Protect sensitive data
var encrypted = _dataProtectionService.Protect(plainValue, "EmergencyContact");
// Unprotect sensitive data
var decrypted = _dataProtectionService.Unprotect(encrypted, "EmergencyContact");
```

## Key Management
- Keys are persisted to the `DataProtectionKeys` directory by default.
- For production, configure Azure Key Vault or secure file share for key storage.

## Security Notes
- Never log or expose unprotected sensitive data.
- Rotate keys periodically and restrict access to key storage.

## References
- [Microsoft Docs: Data Protection](https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/)
- [UserVerificationWorkflow.md](UserVerificationWorkflow.md)
