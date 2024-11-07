using System.Text.Json.Serialization;

namespace Microsoft.CopilotDashboard.DataIngestion.Models;

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

public class IdeCodeCompletions
{
    [JsonPropertyName("total_engaged_users")]
    public required int TotalEngagedUsers { get; set; }

    [JsonPropertyName("languages")]
    public required IdeCodeCompletionLanguage[] Languages { get; set; }

    [JsonPropertyName("editors")]
    public required IdeCodeCompletionEditor[] Editors { get; set; }
}

public class IdeCodeCompletionLanguage
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("total_engaged_users")]
    public required int TotalEngagedUsers { get; set; }
}

public class IdeCodeCompletionEditor
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("total_engaged_users")]
    public required int TotalEngagedUsers { get; set; }

    [JsonPropertyName("models")]
    public required IdeCodeCompletionModel[] Models { get; set; }
}

public class IdeCodeCompletionModel {
    
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("is_custom_model")]
    public required bool IsCustomModel { get; set; }
    
    [JsonPropertyName("custom_model_training_date")]
    public DateOnly? CustomModelTrainingDate { get; set; }

    [JsonPropertyName("total_engaged_users")]
    public required int TotalEngagedUsers { get; set; }

    [JsonPropertyName("languages")]
    public required IdeCodeCompletionModelLanguage[] Languages { get; set; }

}

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

public class IdeChat
{
    [JsonPropertyName("total_engaged_users")]
    public required int TotalEngagedUsers { get; set; }
    
    [JsonPropertyName("editors")]
    public required IdeChatEditor[] Editors { get; set; }
}

public class IdeChatEditor
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("total_engaged_users")]
    public required int TotalEngagedUsers { get; set; }

    [JsonPropertyName("models")]
    public required IdeChatModel[] Models { get; set; }
}

public class IdeChatModel {
    
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("is_custom_model")]
    public required bool IsCustomModel { get; set; }
    
    [JsonPropertyName("custom_model_training_date")]
    public DateOnly? CustomModelTrainingDate { get; set; }
    
    [JsonPropertyName("total_engaged_users")]
    public required int TotalEngagedUsers { get; set; }

    [JsonPropertyName("total_chats")]
    public required int TotalChats { get; set; }

    [JsonPropertyName("total_chat_insertion_events")]
    public required int TotalChatInsertionEvents { get; set; }

    [JsonPropertyName("total_chat_copy_events")]
    public required int TotalChatCopyEvents { get; set; }
}

public class DotComChat
{
    [JsonPropertyName("total_engaged_users")]
    public required int TotalEngagedUsers { get; set; }
    
    [JsonPropertyName("models")]
    public required DotComChatModel[] Models { get; set; }
}

public class DotComChatModel {
    
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("is_custom_model")]
    public required bool IsCustomModel { get; set; }
    
    [JsonPropertyName("custom_model_training_date")]
    public DateOnly? CustomModelTrainingDate { get; set; }
    
    [JsonPropertyName("total_engaged_users")]
    public required int TotalEngagedUsers { get; set; }

    [JsonPropertyName("total_chats")]
    public required int TotalChats { get; set; }
}

public class DotComPullRequest
{
    [JsonPropertyName("total_engaged_users")]
    public required int TotalEngagedUsers { get; set; }
    
    [JsonPropertyName("repositories")]
    public required DotComPullRequestRepository[] Repositories { get; set; }
}

public class DotComPullRequestRepository
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("total_engaged_users")]
    public required int TotalEngagedUsers { get; set; }

    [JsonPropertyName("models")]
    public required DotComPullRequestRepositoryModel[] Models { get; set; }
}

public class DotComPullRequestRepositoryModel
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("is_custom_model")]
    public required bool IsCustomModel { get; set; }
    
    [JsonPropertyName("custom_model_training_date")]
    public DateOnly? CustomModelTrainingDate { get; set; }

    [JsonPropertyName("total_engaged_users")]
    public required int TotalEngagedUsers { get; set; }

    [JsonPropertyName("total_pr_summaries_created")]
    public required int TotalPrSummariesCreated { get; set; }
}