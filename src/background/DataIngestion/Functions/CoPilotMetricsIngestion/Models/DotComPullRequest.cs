using System.Text.Json.Serialization;

namespace Microsoft.CopilotDashboard.DataIngestion.Functions.CoPilotMetricsIngestion.Models;

public class DotComPullRequest
{
    [JsonPropertyName("total_engaged_users")]
    public required int TotalEngagedUsers { get; set; }
    
    [JsonPropertyName("repositories")]
    public required DotComPullRequestRepository[] Repositories { get; set; }
}