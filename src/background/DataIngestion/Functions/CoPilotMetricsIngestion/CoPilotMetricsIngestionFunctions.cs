using Microsoft.Azure.Functions.Worker;
using Microsoft.CopilotDashboard.DataIngestion.Functions.CoPilotMetricsIngestion.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Microsoft.CopilotDashboard.DataIngestion.Functions.CoPilotMetricsIngestion;

public class CoPilotMetricsIngestionFunctions
{
    private readonly ILogger _logger;
    private readonly GitHubCopilotMetricsClient _metricsClient;
    private readonly IOptions<GithubMetricsApiOptions> _options;

    public CoPilotMetricsIngestionFunctions(
        ILogger<CoPilotMetricsIngestionFunctions> logger, 
        GitHubCopilotMetricsClient metricsClient,
        IOptions<GithubMetricsApiOptions> options)
    {
        _logger = logger;
        _metricsClient = metricsClient;
        _options = options;
    }

    
    [Function("GitHubCopilotMetricsDataIngestion")]
    [CosmosDBOutput(databaseName: "platform-engineering", containerName: "metrics_history", Connection = "AZURE_COSMOSDB_ENDPOINT", CreateIfNotExists = true)]
    public async Task<List<Metrics>> Run([TimerTrigger("0 0 * * * *")] TimerInfo myTimer)
    {
        _logger.LogInformation($"GitHubCopilotDataIngestion timer trigger function executed at: {DateTime.Now}");
        bool.TryParse(Environment.GetEnvironmentVariable("USE_METRICS_API"), out var useMetricsApi);

        if (!useMetricsApi) return [];

        var metrics = new List<Metrics>();
        
        metrics.AddRange(await ExtractMetrics());
        
        var teams = _options.Value.Teams;
        if (teams != null)
        {
            foreach (var team in teams)
            {
                metrics.AddRange(await ExtractMetrics(team));
            }
        }

        if (myTimer.ScheduleStatus is not null)
        {
            _logger.LogInformation($"Finished ingestion. Next timer schedule at: {myTimer.ScheduleStatus.Next}");
        }

        return metrics;
    }

    private async Task<Metrics[]> ExtractMetrics(string? team = null)
    {
        if (_options.Value.UseTestData)
        {
            return await LoadTestData(team);
        }

        var scope = Environment.GetEnvironmentVariable("GITHUB_API_SCOPE");
        if(!string.IsNullOrWhiteSpace(scope) && scope == "enterprise")
        {
            _logger.LogInformation("Fetching GitHub Copilot usage metrics for enterprise");
            return await _metricsClient.GetCopilotMetricsForEnterpriseAsync(team);
        }

        _logger.LogInformation("Fetching GitHub Copilot usage metrics for organization");
        return await _metricsClient.GetCopilotMetricsForOrganisationAsync(team);
    }

    private ValueTask<Metrics[]> LoadTestData(string? teamName)
    {
        return _metricsClient.GetTestCoPilotMetrics(teamName);
    }
}
