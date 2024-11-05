using System.Text.Json.Serialization;

namespace Microsoft.CopilotDashboard.DataIngestion.Functions.CoPilotMetricsIngestion.Models;

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