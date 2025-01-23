using System.Text.Json.Serialization;

namespace Microsoft.CopilotDashboard.DataIngestion.Models;

public class Metrics
{
    [JsonPropertyName("id")]
    public string Id
    {
        get
        {
            return GetId();
        }
    }

    [JsonPropertyName("date")]
    public DateOnly Date { get; set; }

    [JsonPropertyName("total_active_users")]
    public int TotalActiveUsers { get; set; }

    [JsonPropertyName("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }
    
    [JsonPropertyName("copilot_ide_code_completions")]
    public IdeCodeCompletions? CoPilotIdeCodeCompletions { get; set; }
    
    [JsonPropertyName("copilot_ide_chat")]
    public IdeChat? IdeChat { get; set; }
    
    [JsonPropertyName("copilot_dotcom_chat")]
    public DotComChat? DotComChat { get; set; }
    
    [JsonPropertyName("copilot_dotcom_pull_requests")]
    public DotComPullRequest? DotComPullRequests { get; set; }

    [JsonPropertyName("enterprise")]
    public string? Enterprise { get; set; }

    [JsonPropertyName("organization")]
    public string? Organization { get; set; }

    [JsonPropertyName("team")]
    public string? Team { get; set; }

    [JsonPropertyName("last_update")]
    public DateTime LastUpdate { get; set; } = DateTime.UtcNow;

    private string GetId()
    {
        if (!string.IsNullOrWhiteSpace(this.Organization))
        {
            return $"{this.Date.ToString("yyyy-MM-d")}-ORG-{this.Organization}{(string.IsNullOrWhiteSpace(this.Team) ? "" : $"-{this.Team}")}";
        }
        else if (!string.IsNullOrWhiteSpace(this.Enterprise))
        {
            return $"{this.Date.ToString("yyyy-MM-d")}-ENT-{this.Enterprise}{(string.IsNullOrWhiteSpace(this.Team) ? "" : $"-{this.Team}")}";
        }
        return $"{this.Date.ToString("yyyy-MM-d")}-XXX";
    }
}

public class IdeCodeCompletions
{
    [JsonPropertyName("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("languages")]
    public IdeCodeCompletionLanguage[] Languages { get; set; }

    [JsonPropertyName("editors")]
    public IdeCodeCompletionEditor[] Editors { get; set; }
}

public class IdeCodeCompletionLanguage
{
    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }
}

public class IdeCodeCompletionEditor
{
    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("models")]
    public IdeCodeCompletionModel[] Models { get; set; }
}

public class IdeCodeCompletionModel {
    
    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("is_custom_model")]
    public bool IsCustomModel { get; set; }
    
    [JsonPropertyName("custom_model_training_date")]
    public DateOnly? CustomModelTrainingDate { get; set; }

    [JsonPropertyName("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("languages")]
    public IdeCodeCompletionModelLanguage[] Languages { get; set; }

}

public class IdeCodeCompletionModelLanguage
{
    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("total_code_suggestions")]
    public int TotalCodeSuggestions { get; set; }

    [JsonPropertyName("total_code_acceptances")]
    public int TotalCodeAcceptances { get; set; }

    [JsonPropertyName("total_code_lines_suggested")]
    public int TotalCodeLinesSuggested { get; set; }

    [JsonPropertyName("total_code_lines_accepted")]
    public int TotalCodeLinesAccepted { get; set; }
}

public class IdeChat
{
    [JsonPropertyName("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }
    
    [JsonPropertyName("editors")]
    public IdeChatEditor[] Editors { get; set; }
}

public class IdeChatEditor
{
    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("models")]
    public IdeChatModel[] Models { get; set; }
}

public class IdeChatModel {
    
    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("is_custom_model")]
    public bool IsCustomModel { get; set; }
    
    [JsonPropertyName("custom_model_training_date")]
    public DateOnly? CustomModelTrainingDate { get; set; }
    
    [JsonPropertyName("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("total_chats")]
    public int TotalChats { get; set; }

    [JsonPropertyName("total_chat_insertion_events")]
    public int TotalChatInsertionEvents { get; set; }

    [JsonPropertyName("total_chat_copy_events")]
    public int TotalChatCopyEvents { get; set; }
}

public class DotComChat
{
    [JsonPropertyName("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }
    
    [JsonPropertyName("models")]
    public DotComChatModel[] Models { get; set; }
}

public class DotComChatModel {
    
    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("is_custom_model")]
    public bool IsCustomModel { get; set; }
    
    [JsonPropertyName("custom_model_training_date")]
    public DateOnly? CustomModelTrainingDate { get; set; }
    
    [JsonPropertyName("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("total_chats")]
    public int TotalChats { get; set; }
}

public class DotComPullRequest
{
    [JsonPropertyName("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }
    
    [JsonPropertyName("repositories")]
    public DotComPullRequestRepository[] Repositories { get; set; }
}

public class DotComPullRequestRepository
{
    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("models")]
    public DotComPullRequestRepositoryModel[] Models { get; set; }
}

public class DotComPullRequestRepositoryModel
{
    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("is_custom_model")]
    public bool IsCustomModel { get; set; }
    
    [JsonPropertyName("custom_model_training_date")]
    public DateOnly? CustomModelTrainingDate { get; set; }

    [JsonPropertyName("total_engaged_users")]
    public int TotalEngagedUsers { get; set; }

    [JsonPropertyName("total_pr_summaries_created")]
    public int TotalPrSummariesCreated { get; set; }
}