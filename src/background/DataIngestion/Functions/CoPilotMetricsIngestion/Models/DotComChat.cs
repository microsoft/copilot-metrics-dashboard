using System.Text.Json.Serialization;

namespace Microsoft.CopilotDashboard.DataIngestion.Functions.CoPilotMetricsIngestion.Models;

public class DotComChat
{
    [JsonPropertyName("total_engaged_users")]
    public required int TotalEngagedUsers { get; set; }
    
    [JsonPropertyName("models")]
    public required DotComChatModel[] Models { get; set; }
}