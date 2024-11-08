using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.CopilotDashboard.DataIngestion.Functions;
using Microsoft.CopilotDashboard.DataIngestion.Models;
using Microsoft.Extensions.Logging;

namespace Microsoft.CopilotDashboard.DataIngestion.Services
{
    internal enum MetricsType
    {
        Ent,
        Org
    }

    public class GitHubCopilotMetricsClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger _logger;

        public GitHubCopilotMetricsClient(HttpClient httpClient, ILogger<GitHubCopilotMetricsClient> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public Task<Metrics[]> GetCopilotMetricsForEnterpriseAsync(string? team)
        {
            var enterprise = Environment.GetEnvironmentVariable("GITHUB_ENTERPRISE")!;

            var requestUri = string.IsNullOrWhiteSpace(team)
                ? $"/enterprises/{enterprise}/copilot/metrics"
                : $"/enterprises/{enterprise}/team/{team}/copilot/metrics";

            return GetMetrics(requestUri, MetricsType.Ent, enterprise, team);
        }

        public Task<Metrics[]> GetCopilotMetricsForOrganizationAsync(string? team)
        {
            var organization = Environment.GetEnvironmentVariable("GITHUB_ORGANIZATION")!;

            var requestUri = string.IsNullOrWhiteSpace(team)
                ? $"/orgs/{organization}/copilot/metrics"
                : $"/orgs/{organization}/team/{team}/copilot/metrics";

            return GetMetrics(requestUri, MetricsType.Org, organization, team);
        }

        private async Task<Metrics[]> GetMetrics(string requestUri, MetricsType type, string orgOrEnterpriseName, string? team = null)
        {
            var response = await _httpClient.GetAsync(requestUri);
            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Error fetching data: {response.StatusCode}");
            }
            _logger.LogInformation($"Fetched data from {requestUri}");
            var metrics = AddIds((await response.Content.ReadFromJsonAsync<Metrics[]>())!, type, orgOrEnterpriseName, team);
            return metrics;
        }

        public async ValueTask<Metrics[]> GetTestCoPilotMetrics(string? team)
        {
            await using var reader = typeof(CopilotMetricsIngestion)
                    .Assembly
                    .GetManifestResourceStream(
                        "Microsoft.CopilotDashboard.DataIngestion.TestData.metrics.json")!;

            return AddIds((await JsonSerializer.DeserializeAsync<Metrics[]>(reader))!, MetricsType.Org, "test", team);
        }

        private Metrics[] AddIds(Metrics[] metrics, MetricsType type, string orgOrEnterpriseName, string? team = null)
        {
            foreach (var metric in metrics)
            {
                metric.Id = $"{metric.Date.ToString("O")}-{type.ToString().ToLowerInvariant()}-{orgOrEnterpriseName}{(string.IsNullOrWhiteSpace(team) ? "" : $"-{team}")}";
            }

            return metrics;
        }
    }
}
