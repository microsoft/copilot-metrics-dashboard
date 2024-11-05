using System.Text.Json.Serialization;

namespace Microsoft.CopilotDashboard.DataIngestion.Functions.CoPilotMetricsIngestion.Models;

public class Metrics
{
    [JsonPropertyName("id")]
    public string? Id { get; set; }

    [JsonPropertyName("date")]
    public required DateOnly Date { get; set; }

    [JsonPropertyName("total_active_users")]
    public required int TotalActiveUsers { get; set; }

    [JsonPropertyName("total_engaged_users")]
    public required int TotalEngagedUsers { get; set; }
    
    [JsonPropertyName("copilot_ide_code_completions")]
    public IdeCodeCompletions? CoPilotIdeCodeCompletions { get; set; }
    
    [JsonPropertyName("copilot_ide_chat")]
    public IdeChat? IdeChat { get; set; }
    
    [JsonPropertyName("copilot_dotcom_chat")]
    public DotComChat? DotComChat { get; set; }
    
    [JsonPropertyName("copilot_dotcom_pull_requests")]
    public DotComPullRequest? DotComPullRequests { get; set; }
}