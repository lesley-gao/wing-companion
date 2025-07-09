# AuthController API Documentation

This document describes the authentication endpoints for user registration, login, logout, and password reset.

## Endpoints

### POST /api/auth/register
Registers a new user.
- **Request Body:** `RegisterDto`
- **Response:** 200 OK on success, 400 Bad Request on failure

### POST /api/auth/login
Logs in a user.
- **Request Body:** `LoginDto`
- **Response:** 200 OK on success, 401 Unauthorized on failure

### POST /api/auth/logout
Logs out the current user.
- **Authorization:** Bearer token required
- **Response:** 200 OK

### POST /api/auth/password-reset
Initiates password reset by sending a reset email.
- **Request Body:** `PasswordResetRequestDto`
- **Response:** 200 OK (always, for security)

## DTOs
- `RegisterDto`: `{ Email, Password }`
- `LoginDto`: `{ Email, Password, RememberMe }`
- `PasswordResetRequestDto`: `{ Email, ResetUrlBase }`

## Security
- All endpoints use ASP.NET Core Identity.
- Passwords are never returned or logged.
- Password reset does not reveal if an email is registered.

## See Also
- [IdentityConfiguration.md](IdentityConfiguration.md)
- [UserSettingsAPI.md](UserSettingsAPI.md)
