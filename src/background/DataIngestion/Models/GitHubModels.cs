using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Microsoft.CopilotDashboard.DataIngestion.Models
{
    public class Organization
    {
        /// <summary>
        /// Gets or sets the login name of the organization.
        /// </summary>
        [JsonPropertyName("login")]
        public string Login { get; set; }

        /// <summary>
        /// Gets or sets the ID of the organization.
        /// </summary>
        [JsonPropertyName("id")]
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the node ID of the organization.
        /// </summary>
        [JsonPropertyName("node_id")]
        public string NodeId { get; set; }

        /// <summary>
        /// Gets or sets the URL of the organization.
        /// </summary>
        [JsonPropertyName("url")]
        public string Url { get; set; }

        /// <summary>
        /// Gets or sets the repositories URL of the organization.
        /// </summary>
        [JsonPropertyName("repos_url")]
        public string ReposUrl { get; set; }

        /// <summary>
        /// Gets or sets the events URL of the organization.
        /// </summary>
        [JsonPropertyName("events_url")]
        public string EventsUrl { get; set; }

        /// <summary>
        /// Gets or sets the hooks URL of the organization.
        /// </summary>
        [JsonPropertyName("hooks_url")]
        public string HooksUrl { get; set; }

        /// <summary>
        /// Gets or sets the issues URL of the organization.
        /// </summary>
        [JsonPropertyName("issues_url")]
        public string IssuesUrl { get; set; }

        /// <summary>
        /// Gets or sets the members URL of the organization.
        /// </summary>
        [JsonPropertyName("members_url")]
        public string MembersUrl { get; set; }

        /// <summary>
        /// Gets or sets the public members URL of the organization.
        /// </summary>
        [JsonPropertyName("public_members_url")]
        public string PublicMembersUrl { get; set; }

        /// <summary>
        /// Gets or sets the avatar URL of the organization.
        /// </summary>
        [JsonPropertyName("avatar_url")]
        public string AvatarUrl { get; set; }

        /// <summary>
        /// Gets or sets the description of the organization.
        /// </summary>
        [JsonPropertyName("description")]
        public string Description { get; set; }
    }

    public class Team
    {
        /// <summary>
        /// Gets or sets the ID of the team.
        /// </summary>
        [JsonPropertyName("id")]
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the node ID of the team.
        /// </summary>
        [JsonPropertyName("node_id")]
        public string NodeId { get; set; }

        /// <summary>
        /// Gets or sets the URL of the team.
        /// </summary>
        [JsonPropertyName("url")]
        public string Url { get; set; }

        /// <summary>
        /// Gets or sets the HTML URL of the team.
        /// </summary>
        [JsonPropertyName("html_url")]
        public string HtmlUrl { get; set; }

        /// <summary>
        /// Gets or sets the name of the team.
        /// </summary>
        [JsonPropertyName("name")]
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the slug of the team.
        /// </summary>
        [JsonPropertyName("slug")]
        public string Slug { get; set; }

        /// <summary>
        /// Gets or sets the description of the team.
        /// </summary>
        [JsonPropertyName("description")]
        public string Description { get; set; }

        /// <summary>
        /// Gets or sets the privacy setting of the team.
        /// </summary>
        [JsonPropertyName("privacy")]
        public string Privacy { get; set; }

        /// <summary>
        /// Gets or sets the notification setting of the team.
        /// </summary>
        [JsonPropertyName("notification_setting")]
        public string NotificationSetting { get; set; }

        /// <summary>
        /// Gets or sets the permission level of the team.
        /// </summary>
        [JsonPropertyName("permission")]
        public string Permission { get; set; }

        /// <summary>
        /// Gets or sets the members URL of the team.
        /// </summary>
        [JsonPropertyName("members_url")]
        public string MembersUrl { get; set; }

        /// <summary>
        /// Gets or sets the repositories URL of the team.
        /// </summary>
        [JsonPropertyName("repositories_url")]
        public string RepositoriesUrl { get; set; }

        /// <summary>
        /// Gets or sets the parent team.
        /// </summary>
        [JsonPropertyName("parent")]
        public object Parent { get; set; }
    }
    public class User
    {
        /// <summary>
        /// Gets or sets the ID of the user.
        /// </summary>
        [JsonPropertyName("id")]
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the login name of the user.
        /// </summary>
        [JsonPropertyName("login")]
        public string Login { get; set; }

        /// <summary>
        /// Gets or sets the name of the user.
        /// </summary>
        [JsonPropertyName("name")]
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the node ID of the user.
        /// </summary>
        [JsonPropertyName("node_id")]
        public string NodeId { get; set; }

        /// <summary>
        /// Gets or sets the avatar URL of the user.
        /// </summary>
        [JsonPropertyName("avatar_url")]
        public string AvatarUrl { get; set; }

        /// <summary>
        /// Gets or sets the gravatar ID of the user.
        /// </summary>
        [JsonPropertyName("gravatar_id")]
        public string GravatarId { get; set; }

        /// <summary>
        /// Gets or sets the URL of the user.
        /// </summary>
        [JsonPropertyName("url")]
        public string Url { get; set; }

        /// <summary>
        /// Gets or sets the HTML URL of the user.
        /// </summary>
        [JsonPropertyName("html_url")]
        public string HtmlUrl { get; set; }

        /// <summary>
        /// Gets or sets the followers URL of the user.
        /// </summary>
        [JsonPropertyName("followers_url")]
        public string FollowersUrl { get; set; }

        /// <summary>
        /// Gets or sets the following URL of the user.
        /// </summary>
        [JsonPropertyName("following_url")]
        public string FollowingUrl { get; set; }

        /// <summary>
        /// Gets or sets the gists URL of the user.
        /// </summary>
        [JsonPropertyName("gists_url")]
        public string GistsUrl { get; set; }

        /// <summary>
        /// Gets or sets the starred URL of the user.
        /// </summary>
        [JsonPropertyName("starred_url")]
        public string StarredUrl { get; set; }

        /// <summary>
        /// Gets or sets the subscriptions URL of the user.
        /// </summary>
        [JsonPropertyName("subscriptions_url")]
        public string SubscriptionsUrl { get; set; }

        /// <summary>
        /// Gets or sets the organizations URL of the user.
        /// </summary>
        [JsonPropertyName("organizations_url")]
        public string OrganizationsUrl { get; set; }

        /// <summary>
        /// Gets or sets the repositories URL of the user.
        /// </summary>
        [JsonPropertyName("repos_url")]
        public string ReposUrl { get; set; }

        /// <summary>
        /// Gets or sets the events URL of the user.
        /// </summary>
        [JsonPropertyName("events_url")]
        public string EventsUrl { get; set; }

        /// <summary>
        /// Gets or sets the received events URL of the user.
        /// </summary>
        [JsonPropertyName("received_events_url")]
        public string ReceivedEventsUrl { get; set; }

        /// <summary>
        /// Gets or sets the type of the user.
        /// </summary>
        [JsonPropertyName("type")]
        public string Type { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether the user is a site admin.
        /// </summary>
        [JsonPropertyName("site_admin")]
        public bool SiteAdmin { get; set; }
    }
}