using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Microsoft.CopilotDashboard.DataIngestion.Models;
using Microsoft.CopilotDashboard.DataIngestion.Services;

namespace Microsoft.CopilotDashboard.DataIngestion.Functions;

public class CopilotDataIngestion
{
    private readonly ILogger _logger;
    private readonly GitHubCopilotUsageClient usageClient;

    public CopilotDataIngestion(ILoggerFactory loggerFactory, GitHubCopilotUsageClient usageClient)
    {
        _logger = loggerFactory.CreateLogger<CopilotDataIngestion>();
        this.usageClient = usageClient;
    }

    [Function("GitHubCopilotDataIngestion")]
    [CosmosDBOutput(databaseName: "platform-engineering", containerName: "history", Connection = "AZURE_COSMOSDB_ENDPOINT", CreateIfNotExists = true)]
    public async Task<List<CopilotUsage>> Run([TimerTrigger("0 0 * * * *")] TimerInfo myTimer)
    {
        _logger.LogInformation($"GitHubCopilotDataIngestion timer trigger function executed at: {DateTime.Now}");

        List<CopilotUsage> usage;

        var scope = Environment.GetEnvironmentVariable("GITHUB_API_SCOPE");
        if (!string.IsNullOrWhiteSpace(scope) && scope == "enterprise")
        {
            _logger.LogInformation("Fetching GitHub Copilot usage metrics for enterprise");
            usage = await usageClient.GetCopilotMetricsForEnterpriseAsync();
        }
        else
        {
            _logger.LogInformation("Fetching GitHub Copilot usage metrics for organization");
            usage = await usageClient.GetCopilotMetricsForOrgsAsync();
        }

        if (myTimer.ScheduleStatus is not null)
        {
            _logger.LogInformation($"Finished ingestion. Next timer schedule at: {myTimer.ScheduleStatus.Next}");
        }

        return usage;
    }
}