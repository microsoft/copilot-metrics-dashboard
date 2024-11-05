using System.Text.Json.Serialization;

namespace Microsoft.CopilotDashboard.DataIngestion.Models;

public class CopilotUsage
{
    [JsonPropertyName("total_suggestions_count")]
    public required int TotalSuggestionsCount { get; set; }

    [JsonPropertyName("total_acceptances_count")]
    public required int TotalAcceptancesCount { get; set; }

    [JsonPropertyName("total_lines_suggested")]
    public required int TotalLinesSuggested { get; set; }

    [JsonPropertyName("total_lines_accepted")]
    public required int TotalLinesAccepted { get; set; }

    [JsonPropertyName("total_active_users")]
    public required int TotalActiveUsers { get; set; }

    [JsonPropertyName("total_chat_acceptances")]
    public required int TotalChatAcceptances { get; set; }

    [JsonPropertyName("total_chat_turns")]
    public required int TotalChatTurns { get; set; }

    [JsonPropertyName("total_active_chat_users")]
    public required int TotalActiveChatUsers { get; set; }


    [JsonPropertyName("day")]
    public required string Day { get; set; }

    [JsonPropertyName("id")]
    public string Id
    {
        get
        {
            return $"{Day}";
        }
    }


    [JsonPropertyName("breakdown")]
    public required List<Breakdown> Breakdown { get; set; }
}


public class Breakdown
{
    [JsonPropertyName("language")]
    public required string Language { get; set; }

    [JsonPropertyName("editor")]
    public required string Editor { get; set; }

    [JsonPropertyName("suggestions_count")]
    public required int SuggestionsCount { get; set; }

    [JsonPropertyName("acceptances_count")]
    public required int AcceptancesCount { get; set; }

    [JsonPropertyName("lines_suggested")]
    public required int LinesSuggested { get; set; }

    [JsonPropertyName("lines_accepted")]
    public required int LinesAccepted { get; set; }

    [JsonPropertyName("active_users")]
    public required int ActiveUsers { get; set; }
}