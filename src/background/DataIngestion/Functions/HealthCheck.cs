using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace Microsoft.CopilotDashboard.DataIngestion.Functions;

public class HealthCheck
{
    private readonly ILogger _logger;

    public HealthCheck(ILoggerFactory loggerFactory)
    {
        _logger = loggerFactory.CreateLogger<HealthCheck>();
    }

    [Function("HealthCheck")]
    public HttpResponseData Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "health")] HttpRequestData req)
    {
        _logger.LogInformation("Health check endpoint called");

        var healthStatus = new HealthStatus
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Service = "CopilotMetrics DataIngestion",
            Version = GetVersion()
        };

        var checks = new List<HealthCheckResult>();

        // Check required environment variables
        checks.Add(CheckEnvironmentVariable("GITHUB_TOKEN", "GitHub Token"));
        checks.Add(CheckEnvironmentVariable("GITHUB_API_VERSION", "GitHub API Version"));

        healthStatus.Checks = checks;

        // Set overall status to Unhealthy if any check failed
        if (checks.Any(c => c.Status == "Unhealthy"))
        {
            healthStatus.Status = "Unhealthy";
        }

        var response = req.CreateResponse(
            healthStatus.Status == "Healthy" ? HttpStatusCode.OK : HttpStatusCode.ServiceUnavailable
        );
        
        response.WriteAsJsonAsync(healthStatus);
        
        return response;
    }

    private HealthCheckResult CheckEnvironmentVariable(string variableName, string displayName)
    {
        var value = Environment.GetEnvironmentVariable(variableName);
        var isHealthy = !string.IsNullOrWhiteSpace(value);

        return new HealthCheckResult
        {
            Name = displayName,
            Status = isHealthy ? "Healthy" : "Unhealthy",
            Description = isHealthy 
                ? $"{displayName} is configured" 
                : $"{displayName} is missing or empty"
        };
    }

    private static string GetVersion()
    {
        // Try to get version from environment variable first (for CI/CD)
        var envVersion = Environment.GetEnvironmentVariable("APP_VERSION");
        if (!string.IsNullOrWhiteSpace(envVersion))
        {
            return envVersion;
        }

        // Fall back to assembly version
        var assembly = typeof(HealthCheck).Assembly;
        var version = assembly.GetName().Version;
        return version?.ToString() ?? "unknown";
    }

    private class HealthStatus
    {
        public string Status { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Service { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public List<HealthCheckResult> Checks { get; set; } = new();
    }

    private class HealthCheckResult
    {
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}

