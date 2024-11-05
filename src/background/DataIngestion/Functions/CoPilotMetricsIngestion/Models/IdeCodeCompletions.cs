using System.Text.Json.Serialization;

namespace Microsoft.CopilotDashboard.DataIngestion.Functions.CoPilotMetricsIngestion.Models;

public class IdeCodeCompletions
{
    [JsonPropertyName("total_engaged_users")]
    public required int TotalEngagedUsers { get; set; }

    [JsonPropertyName("languages")]
    public required IdeCodeCompletionLanguage[] Languages { get; set; }

    [JsonPropertyName("editors")]
    public required IdeCodeCompletionEditor[] Editors { get; set; }
}