using System.Text.Json.Serialization;

namespace Microsoft.CopilotDashboard.DataIngestion.Functions.CoPilotMetricsIngestion.Models;

public class IdeCodeCompletionModelLanguage
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("total_code_suggestions")]
    public required int TotalCodeSuggestions { get; set; }

    [JsonPropertyName("total_code_acceptances")]
    public required int TotalCodeAcceptances { get; set; }

    [JsonPropertyName("total_code_lines_suggested")]
    public required int TotalCodeLinesSuggested { get; set; }

    [JsonPropertyName("total_code_lines_accepted")]
    public required int TotalCodeLinesAccepted { get; set; }
}