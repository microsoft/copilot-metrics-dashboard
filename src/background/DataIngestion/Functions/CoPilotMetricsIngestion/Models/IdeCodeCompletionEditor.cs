using System.Text.Json.Serialization;

namespace Microsoft.CopilotDashboard.DataIngestion.Functions.CoPilotMetricsIngestion.Models;

public class IdeCodeCompletionEditor
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("total_engaged_users")]
    public required int TotalEngagedUsers { get; set; }

    [JsonPropertyName("models")]
    public required IdeCodeCompletionModel[] Models { get; set; }
}