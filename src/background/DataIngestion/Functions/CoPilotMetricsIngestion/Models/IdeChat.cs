using System.Text.Json.Serialization;

namespace Microsoft.CopilotDashboard.DataIngestion.Functions.CoPilotMetricsIngestion.Models;

public class IdeChat
{
    [JsonPropertyName("total_engaged_users")]
    public required int TotalEngagedUsers { get; set; }
    
    [JsonPropertyName("editors")]
    public required IdeChatEditor[] Editors { get; set; }
}