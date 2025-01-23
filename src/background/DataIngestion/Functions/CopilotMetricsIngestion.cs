using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.CopilotDashboard.DataIngestion.Models;
using Microsoft.CopilotDashboard.DataIngestion.Services;

namespace Microsoft.CopilotDashboard.DataIngestion.Functions;

public class CopilotMetricsIngestion
{
    private readonly ILogger _logger;
    private readonly GitHubCopilotMetricsClient _metricsClient;
    private readonly IOptions<GithubMetricsApiOptions> _options;

    public CopilotMetricsIngestion(
        ILogger<CopilotMetricsIngestion> logger,
        GitHubCopilotMetricsClient metricsClient,
        IOptions<GithubMetricsApiOptions> options)
    {
        _logger = logger;
        _metricsClient = metricsClient;
        _options = options;
    }


    [Function("GitHubCopilotMetricsIngestion")]
    [CosmosDBOutput(databaseName: "platform-engineering", containerName: "metrics_history", Connection = "AZURE_COSMOSDB_ENDPOINT", CreateIfNotExists = true)]
    public async Task<List<Metrics>> Run([TimerTrigger("0 0 * * * *")] TimerInfo myTimer)
    {
        _logger.LogInformation($"GitHubCopilotMetricsIngestion timer trigger function executed at: {DateTime.Now}");

        var metrics = new List<Metrics>();

        metrics.AddRange(await ExtractMetrics());

        var teams = _options.Value.Teams;
        if (teams != null && teams.Any())
        {
            foreach (var team in teams)
            {
                metrics.AddRange(await ExtractMetrics(team));
            }
        }
        else
        {
            metrics.AddRange(await ExtractMetrics());
        }

        if (myTimer.ScheduleStatus is not null)
        {
            _logger.LogInformation($"Finished ingestion. Next timer schedule at: {myTimer.ScheduleStatus.Next}");
        }
        _logger.LogInformation($"Metrics count: {metrics.Count}");
        return metrics;
    }

    private async Task<Metrics[]> ExtractMetrics(string? team = null)
    {
        if (_options.Value.UseTestData)
        {
            return await LoadTestData(team);
        }

        var scope = Environment.GetEnvironmentVariable("GITHUB_API_SCOPE");
        if (!string.IsNullOrWhiteSpace(scope) && scope == "enterprise")
        {
            _logger.LogInformation("Fetching GitHub Copilot usage metrics for enterprise");
            return await _metricsClient.GetCopilotMetricsForEnterpriseAsync(team);
        }

        _logger.LogInformation("Fetching GitHub Copilot usage metrics for organization");
        return await _metricsClient.GetCopilotMetricsForOrganizationAsync(team);
    }

    private ValueTask<Metrics[]> LoadTestData(string? teamName)
    {
        return _metricsClient.GetTestCopilotMetrics(teamName);
    }
}
