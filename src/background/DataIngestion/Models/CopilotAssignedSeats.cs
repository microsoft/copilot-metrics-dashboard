using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Microsoft.CopilotDashboard.DataIngestion.Models;

public class CopilotAssignedSeats
{
    /// <summary>
    /// Gets or sets the ID of the seats information.
    /// </summary>
    [JsonPropertyName("id")]
    public string Id
    {
        get
        {
            return GetId();
        }
    }

    /// <summary>
    /// Gets or sets the date for which the seats information is recorded.
    /// </summary>
    [JsonPropertyName("date")]
    public DateOnly Date { get; set; }

    /// <summary>
    /// Gets or sets the total number of seats.
    /// </summary>
    [JsonPropertyName("total_seats")]
    public int TotalSeats { get; set; }

    /// <summary>
    /// Gets or sets the list of seats.
    /// </summary>
    [JsonPropertyName("seats")]
    public List<Seat> Seats { get; set; }

    /// <summary>
    /// Gets or sets the enterprise name.
    /// </summary>
    [JsonPropertyName("enterprise")]
    public string Enterprise { get; set; }

    /// <summary>
    /// Gets or sets the organization name.
    /// </summary>
    [JsonPropertyName("organization")]
    public string Organization { get; set; }

    /// <summary>
    /// Gets or sets the date and time of the last update.
    /// </summary>
    [JsonPropertyName("last_update")]
    public DateTime LastUpdate { get; set; } = DateTime.UtcNow;

    private string GetId()
    {
        if (!string.IsNullOrWhiteSpace(this.Organization))
        {
            return $"{this.Date.ToString("yyyy-MM-d")}-ORG-{this.Organization}";
        }
        else if (!string.IsNullOrWhiteSpace(this.Enterprise))
        {
            return $"{this.Date.ToString("yyyy-MM-d")}-ENT-{this.Enterprise}";
        }
        return $"{this.Date.ToString("yyyy-MM-d")}-XXX";
    }
}

/// <summary>
/// Represents a seat assigned to a user within GitHub Copilot.
/// </summary>
public class Seat
{
    /// <summary>
    /// Gets or sets the date and time when the seat was created.
    /// </summary>
    [JsonPropertyName("created_at")]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the seat was last updated.
    /// </summary>
    [JsonPropertyName("updated_at")]
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Gets or sets the pending cancellation date.
    /// </summary>
    [JsonPropertyName("pending_cancellation_date")]
    public string PendingCancellationDate { get; set; }

    /// <summary>
    /// Gets or sets the date and time of the last activity.
    /// </summary>
    [JsonPropertyName("last_activity_at")]
    public DateTime? LastActivityAt { get; set; }

    /// <summary>
    /// Gets or sets the editor used during the last activity.
    /// </summary>
    [JsonPropertyName("last_activity_editor")]
    public string? LastActivityEditor { get; set; }

    /// <summary>
    /// Gets or sets the type of plan associated with the seat.
    /// </summary>
    [JsonPropertyName("plan_type")]
    public string PlanType { get; set; }

    /// <summary>
    /// Gets or sets the user assigned to the seat.
    /// </summary>
    [JsonPropertyName("assignee")]
    public User Assignee { get; set; }

    /// <summary>
    /// Gets or sets the team that assigned the seat.
    /// </summary>
    [JsonPropertyName("assigning_team")]
    public Team AssigningTeam { get; set; }

    /// <summary>
    /// Gets or sets the organization associated with the seat.
    /// </summary>
    [JsonPropertyName("organization")]
    public Organization Organization { get; set; }
}


