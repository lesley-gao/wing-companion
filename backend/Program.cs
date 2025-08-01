using Microsoft.EntityFrameworkCore;
using NetworkingApp.Data;
using NetworkingApp.Middleware;
using NetworkingApp.Filters;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using NetworkingApp.Models;
using NetworkingApp.Data.SeedData;
using NetworkingApp.Services;
using NetworkingApp.Hubs; // Add this using statement
// using Stripe; // Payment feature disabled for current sprint
using Microsoft.AspNetCore.DataProtection; // Add this using directive
using NetworkingApp.Configuration; // Add this for logging configuration
using Serilog;
using DotNetEnv;

var builder = WebApplication.CreateBuilder(args);

// Configure comprehensive logging early in the pipeline
builder.Services.AddComprehensiveLogging(builder.Configuration, builder.Environment);
// builder.Services.AddStructuredLoggingServices(); // DISABLED FOR NOW

// Stripe configuration - DISABLED FOR CURRENT SPRINT
// builder.Services.Configure<StripeSettings>(builder.Configuration.GetSection("Stripe"));
// StripeConfiguration.ApiKey = builder.Configuration["Stripe:ApiKey"];

// Load environment variables from backend/.env
try
{
    DotNetEnv.Env.Load(".env");
    Console.WriteLine("Loaded .env file. AZURE_BLOB_CONNECTION_STRING starts with: " + (Environment.GetEnvironmentVariable("AZURE_BLOB_CONNECTION_STRING")?.Substring(0, 30) ?? "null"));
}
catch (Exception ex)
{
    Console.WriteLine($"[INFO] Could not load backend/.env: {ex.Message}");
}

// Add services to the container.
// Add services to the container.
if (builder.Environment.IsDevelopment())
{
    // Use SQLite for local development
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
}
else
{
    // Use SQL Server for production
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
}

// Configure Application Insights - DISABLED FOR NOW
// builder.Services.AddApplicationInsightsTelemetry(options =>
// {
//     options.ConnectionString = builder.Configuration.GetConnectionString("ApplicationInsights");
//     options.EnableAdaptiveSampling = true;
//     options.EnableQuickPulseMetricStream = true;
//     options.EnableEventCounterCollectionModule = true;
//     options.EnablePerformanceCounterCollectionModule = true;
//     options.EnableRequestTrackingTelemetryModule = true;
//     options.EnableDependencyTrackingTelemetryModule = true;
// });

// Configure ASP.NET Core Identity
builder.Services.AddIdentity<User, IdentityRole<int>>(options =>
{
    // Password settings
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 8;
    options.Password.RequiredUniqueChars = 4;
    
    // Lockout settings
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
    
    // User settings
    options.User.RequireUniqueEmail = true;
    options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
    
    // Sign-in settings
    options.SignIn.RequireConfirmedEmail = false; // Will be true in production
    options.SignIn.RequireConfirmedPhoneNumber = false;
    
    // Token settings
    options.Tokens.EmailConfirmationTokenProvider = TokenOptions.DefaultEmailProvider;
    options.Tokens.PasswordResetTokenProvider = TokenOptions.DefaultEmailProvider;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders()
.AddRoles<IdentityRole<int>>();

builder.Services.AddControllers(options =>
{
    // Add global model validation filter
    options.Filters.Add<ValidateModelStateFilter>();
})
.ConfigureApiBehaviorOptions(options =>
{
    // Disable default model validation response to use our custom filter
    options.SuppressModelStateInvalidFilter = true;
})
.AddJsonOptions(options =>
{
    // Configure JSON serialization
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.WriteIndented = builder.Environment.IsDevelopment();
});

// Configure form options for file uploads
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 10 * 1024 * 1024; // 10MB
    options.ValueLengthLimit = int.MaxValue;
    options.MemoryBufferThreshold = int.MaxValue;
});

// Configure request size limits
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 10 * 1024 * 1024; // 10MB
});

// Configure Kestrel for larger request sizes
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 10 * 1024 * 1024; // 10MB
});

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Add SignalR services
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
    options.HandshakeTimeout = TimeSpan.FromSeconds(15);
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000", "http://localhost:3001", "https://localhost:3001")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Required for SignalR
    });
});

// Add API Explorer for development
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
}

// Register business services
builder.Services.AddScoped<IMatchingService, MatchingService>();
builder.Services.AddScoped<INotificationService, NotificationService>(); // Register NotificationService
builder.Services.AddScoped<IRoleService, RoleService>(); // Register RoleService
builder.Services.AddScoped<IDataProtectionService, DataProtectionService>(); // Register DataProtectionService
// builder.Services.AddScoped<PaymentService>(); // Register PaymentService - DISABLED FOR CURRENT SPRINT
builder.Services.AddScoped<IEmergencyService, EmergencyService>(); // Register EmergencyService
// builder.Services.AddScoped<ITelemetryService, ApplicationInsightsTelemetryService>(); // Register TelemetryService - DISABLED FOR NOW
builder.Services.AddScoped<IBlobStorageService, BlobStorageService>(); // Register BlobStorageService

// Configure Email Service
builder.Services.Configure<EmailConfiguration>(builder.Configuration.GetSection("EmailConfiguration"));
builder.Services.AddScoped<IEmailService, EmailService>();

// Configure JWT settings
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

// Add JWT authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<NetworkingApp.Models.JwtSettings>() ?? new NetworkingApp.Models.JwtSettings
    {
        Issuer = "default-issuer",
        Audience = "default-audience", 
        SecretKey = "default-secret-key-minimum-32-characters-long"
    };
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

// Register JWT token service
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

// Configure Data Protection for encryption of sensitive data
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(AppContext.BaseDirectory, "DataProtectionKeys")));

var app = builder.Build();

// Run database migrations on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    try
    {
        logger.LogInformation("Starting database migration...");
        await context.Database.MigrateAsync();
        logger.LogInformation("Database migration completed successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while migrating the database.");
        throw;
    }
}

// Configure the HTTP request pipeline with comprehensive logging - DISABLED FOR NOW
// app.UseComprehensiveLogging();

// Add error handling middleware (should be one of the first middlewares)
app.UseMiddleware<ErrorHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();

// Use Identity authentication/authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map SignalR Hub
app.MapHub<NotificationHub>("/notificationHub");

// Serve static files and configure SPA fallback
app.UseStaticFiles();
app.MapFallbackToFile("index.html");

// Seed database in development
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var roleService = scope.ServiceProvider.GetRequiredService<IRoleService>();

    // Seed data including roles and admin user
    await DatabaseSeeder.SeedAsync(context, userManager, roleManager, logger);
}

app.Run();