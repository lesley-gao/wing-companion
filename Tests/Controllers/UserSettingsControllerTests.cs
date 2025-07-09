using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using NetworkingApp.Controllers;
using NetworkingApp.Data;
using NetworkingApp.Models;
using NetworkingApp.Models.DTOs;
using System.Text.Json;
using Xunit;

namespace NetworkingApp.Tests.Controllers
{
    public class UserSettingsControllerTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<ILogger<UserSettingsController>> _loggerMock;
        private readonly UserSettingsController _controller;

        public UserSettingsControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _loggerMock = new Mock<ILogger<UserSettingsController>>();
            _controller = new UserSettingsController(_context, _loggerMock.Object);

            // Seed test data
            SeedTestData();
        }

        private void SeedTestData()
        {
            var user = new User
            {
                Id = 1,
                Name = "Test User",
                Email = "test@example.com",
                Phone = "+64123456789",
                CreatedAt = DateTime.UtcNow
            };

            var userSettings = new UserSettings
            {
                Id = 1,
                UserId = 1,
                Theme = "dark",
                Language = "en",
                TimeZone = "Pacific/Auckland",
                Currency = "NZD",
                EmailNotifications = true,
                PushNotifications = false,
                SmsNotifications = true,
                EmailMatches = true,
                EmailMessages = false,
                EmailReminders = true,
                EmailMarketing = false,
                ShowOnlineStatus = false,
                ShowLastSeen = true,
                AllowDirectMessages = true,
                DefaultSearchRadius = "25km",
                AutoAcceptMatches = false,
                RequirePhoneVerification = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CustomPreferences = JsonSerializer.Serialize(new Dictionary<string, object>
                {
                    { "darkModeStartTime", "18:00" },
                    { "darkModeEndTime", "06:00" }
                })
            };

            _context.Users.Add(user);
            _context.UserSettings.Add(userSettings);
            _context.SaveChanges();
        }

        [Fact]
        public async Task GetUserSettings_ExistingUser_ReturnsUserSettings()
        {
            // Act
            var result = await _controller.GetUserSettings(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var userSettingsDto = Assert.IsType<UserSettingsDto>(okResult.Value);
            
            Assert.Equal(1, userSettingsDto.UserId);
            Assert.Equal("dark", userSettingsDto.Theme);
            Assert.Equal("en", userSettingsDto.Language);
            Assert.True(userSettingsDto.EmailNotifications);
            Assert.False(userSettingsDto.PushNotifications);
            Assert.NotNull(userSettingsDto.CustomPreferences);
            Assert.Equal(2, userSettingsDto.CustomPreferences.Count);
        }

        [Fact]
        public async Task GetUserSettings_NonExistingUser_CreatesDefaultSettings()
        {
            // Act
            var result = await _controller.GetUserSettings(999);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var userSettingsDto = Assert.IsType<UserSettingsDto>(okResult.Value);
            
            Assert.Equal(999, userSettingsDto.UserId);
            Assert.Equal("light", userSettingsDto.Theme); // Default theme
            Assert.Equal("en", userSettingsDto.Language); // Default language
            Assert.True(userSettingsDto.EmailNotifications); // Default notification setting
            
            // Verify settings were saved to database
            var savedSettings = await _context.UserSettings.FirstOrDefaultAsync(us => us.UserId == 999);
            Assert.NotNull(savedSettings);
        }

        [Fact]
        public async Task UpdateUserSettings_ValidData_UpdatesSettings()
        {
            // Arrange
            var updateDto = new UpdateUserSettingsDto
            {
                Theme = "light",
                Language = "zh",
                EmailNotifications = false,
                PushNotifications = true,
                CustomPreferences = new Dictionary<string, object>
                {
                    { "newSetting", "newValue" }
                }
            };

            // Act
            var result = await _controller.UpdateUserSettings(1, updateDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var userSettingsDto = Assert.IsType<UserSettingsDto>(okResult.Value);
            
            Assert.Equal("light", userSettingsDto.Theme);
            Assert.Equal("zh", userSettingsDto.Language);
            Assert.False(userSettingsDto.EmailNotifications);
            Assert.True(userSettingsDto.PushNotifications);
            Assert.NotNull(userSettingsDto.CustomPreferences);
            Assert.True(userSettingsDto.CustomPreferences.ContainsKey("newSetting"));
        }

        [Fact]
        public async Task UpdateUserSettings_NonExistingUser_ReturnsNotFound()
        {
            // Arrange
            var updateDto = new UpdateUserSettingsDto
            {
                Theme = "light"
            };

            // Act
            var result = await _controller.UpdateUserSettings(999, updateDto);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            var response = notFoundResult.Value;
            Assert.NotNull(response);
        }

        [Fact]
        public async Task UpdateThemePreference_ExistingUser_UpdatesTheme()
        {
            // Arrange
            var themeDto = new ThemePreferenceDto { Theme = "system" };

            // Act
            var result = await _controller.UpdateThemePreference(1, themeDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            dynamic response = okResult.Value!;
            Assert.Equal("system", response.theme);
            
            // Verify in database
            var userSettings = await _context.UserSettings.FirstOrDefaultAsync(us => us.UserId == 1);
            Assert.Equal("system", userSettings!.Theme);
        }

        [Fact]
        public async Task UpdateThemePreference_NonExistingUser_CreatesNewSettings()
        {
            // Arrange
            var themeDto = new ThemePreferenceDto { Theme = "dark" };

            // Act
            var result = await _controller.UpdateThemePreference(999, themeDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            dynamic response = okResult.Value!;
            Assert.Equal("dark", response.theme);
            
            // Verify settings were created
            var userSettings = await _context.UserSettings.FirstOrDefaultAsync(us => us.UserId == 999);
            Assert.NotNull(userSettings);
            Assert.Equal("dark", userSettings.Theme);
        }

        [Fact]
        public async Task UpdateLanguagePreference_ExistingUser_UpdatesLanguage()
        {
            // Arrange
            var languageDto = new LanguagePreferenceDto { Language = "zh" };

            // Act
            var result = await _controller.UpdateLanguagePreference(1, languageDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            dynamic response = okResult.Value!;
            Assert.Equal("zh", response.language);
            
            // Verify in database
            var userSettings = await _context.UserSettings.FirstOrDefaultAsync(us => us.UserId == 1);
            Assert.Equal("zh", userSettings!.Language);
        }

        [Fact]
        public async Task UpdateNotificationPreferences_ExistingUser_UpdatesNotifications()
        {
            // Arrange
            var notificationDto = new NotificationPreferencesDto
            {
                EmailNotifications = false,
                PushNotifications = true,
                SmsNotifications = false,
                EmailMatches = false,
                EmailMessages = true,
                EmailReminders = false,
                EmailMarketing = true
            };

            // Act
            var result = await _controller.UpdateNotificationPreferences(1, notificationDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            
            // Verify in database
            var userSettings = await _context.UserSettings.FirstOrDefaultAsync(us => us.UserId == 1);
            Assert.False(userSettings!.EmailNotifications);
            Assert.True(userSettings.PushNotifications);
            Assert.False(userSettings.SmsNotifications);
            Assert.False(userSettings.EmailMatches);
            Assert.True(userSettings.EmailMessages);
            Assert.False(userSettings.EmailReminders);
            Assert.True(userSettings.EmailMarketing);
        }

        [Fact]
        public async Task UpdateNotificationPreferences_NonExistingUser_ReturnsNotFound()
        {
            // Arrange
            var notificationDto = new NotificationPreferencesDto
            {
                EmailNotifications = false
            };

            // Act
            var result = await _controller.UpdateNotificationPreferences(999, notificationDto);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task UpdatePrivacyPreferences_ExistingUser_UpdatesPrivacy()
        {
            // Arrange
            var privacyDto = new PrivacyPreferencesDto
            {
                ShowOnlineStatus = true,
                ShowLastSeen = false,
                AllowDirectMessages = false,
                RequirePhoneVerification = false
            };

            // Act
            var result = await _controller.UpdatePrivacyPreferences(1, privacyDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            
            // Verify in database
            var userSettings = await _context.UserSettings.FirstOrDefaultAsync(us => us.UserId == 1);
            Assert.True(userSettings!.ShowOnlineStatus);
            Assert.False(userSettings.ShowLastSeen);
            Assert.False(userSettings.AllowDirectMessages);
            Assert.False(userSettings.RequirePhoneVerification);
        }

        [Fact]
        public async Task UpdatePrivacyPreferences_NonExistingUser_ReturnsNotFound()
        {
            // Arrange
            var privacyDto = new PrivacyPreferencesDto
            {
                ShowOnlineStatus = false
            };

            // Act
            var result = await _controller.UpdatePrivacyPreferences(999, privacyDto);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task ResetUserSettings_ExistingUser_ResetsToDefaults()
        {
            // Act
            var result = await _controller.ResetUserSettings(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var userSettingsDto = Assert.IsType<UserSettingsDto>(okResult.Value);
            
            // Verify default values
            Assert.Equal("light", userSettingsDto.Theme);
            Assert.Equal("en", userSettingsDto.Language);
            Assert.Equal("Pacific/Auckland", userSettingsDto.TimeZone);
            Assert.Equal("NZD", userSettingsDto.Currency);
            Assert.True(userSettingsDto.EmailNotifications);
            Assert.True(userSettingsDto.PushNotifications);
            Assert.False(userSettingsDto.SmsNotifications);
            Assert.True(userSettingsDto.EmailMatches);
            Assert.True(userSettingsDto.EmailMessages);
            Assert.True(userSettingsDto.EmailReminders);
            Assert.False(userSettingsDto.EmailMarketing);
            Assert.True(userSettingsDto.ShowOnlineStatus);
            Assert.True(userSettingsDto.ShowLastSeen);
            Assert.True(userSettingsDto.AllowDirectMessages);
            Assert.Equal("50km", userSettingsDto.DefaultSearchRadius);
            Assert.False(userSettingsDto.AutoAcceptMatches);
            Assert.True(userSettingsDto.RequirePhoneVerification);
            Assert.Null(userSettingsDto.CustomPreferences);
        }

        [Fact]
        public async Task ResetUserSettings_NonExistingUser_ReturnsNotFound()
        {
            // Act
            var result = await _controller.ResetUserSettings(999);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task UpdateUserSettings_PartialUpdate_UpdatesOnlyProvidedFields()
        {
            // Arrange
            var originalSettings = await _context.UserSettings.FirstOrDefaultAsync(us => us.UserId == 1);
            var originalTheme = originalSettings!.Theme;
            var originalLanguage = originalSettings.Language;
            
            var updateDto = new UpdateUserSettingsDto
            {
                EmailNotifications = false // Only update this field
            };

            // Act
            var result = await _controller.UpdateUserSettings(1, updateDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var userSettingsDto = Assert.IsType<UserSettingsDto>(okResult.Value);
            
            // Verify only the specified field was updated
            Assert.False(userSettingsDto.EmailNotifications); // Updated
            Assert.Equal(originalTheme, userSettingsDto.Theme); // Unchanged
            Assert.Equal(originalLanguage, userSettingsDto.Language); // Unchanged
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
