# JWT Authentication & Authorization Middleware

This document describes the implementation of JWT token authentication and authorization for the NetworkingApp API.

## Configuration
- JWT settings are defined in `appsettings.json` and `appsettings.Development.json` under the `JwtSettings` section.
- The `JwtSettings` class is used for configuration binding.

## Services
- `IJwtTokenService` and `JwtTokenService` handle JWT token generation.
- JWT tokens are issued on successful login via the `AuthController`.

## Middleware
- JWT authentication is registered in `Program.cs` using `AddAuthentication().AddJwtBearer()`.
- The middleware validates tokens for all `[Authorize]` endpoints.

## Usage
- On successful login, the API returns a JWT token in the response.
- Clients must include the token in the `Authorization: Bearer <token>` header for protected endpoints.

## Security
- Tokens are signed using a secure symmetric key from configuration.
- Token lifetime and claims are configurable.
- All sensitive endpoints require `[Authorize]`.

## References
- [Microsoft Docs: JWT Bearer Authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/jwt)
- [IdentityConfiguration.md](IdentityConfiguration.md)
- [AuthControllerAPI.md](AuthControllerAPI.md)
