export interface GitHubUser {
    id: number;
    login: string;
    name: string | null;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
}

export interface GitHubTeam {
    id: number;
    node_id: string;
    url: string;
    html_url: string;
    name: string;
    slug: string;
    description: string;
    privacy: string;
    notification_setting: string;
    permission: string;
    members_url: string;
    repositories_url: string;
    parent: string | null;
}

export interface GitHubOrganization {
    login: string;
    id: number;
    node_id: string;
    url: string;
    repos_url: string;
    events_url: string;
    hooks_url: string;
    issues_url: string;
    members_url: string;
    public_members_url: string;
    avatar_url: string;
    description: string | null;
}

export interface SeatAssignment {
    created_at: Date;
    updated_at: Date;
    pending_cancellation_date: Date | null;
    last_activity_at: Date;
    last_activity_editor: string;
    plan_type: string;
    assignee: GitHubUser;
    assigning_team: GitHubTeam;
    organization: GitHubOrganization;
}

export interface CopilotSeatsData {
    id: string;
    date: string;
    total_seats: number;
    seats: SeatAssignment[];
    enterprise: string | null;
    organization: string | null;
    last_update: string | null;
}

export interface CopilotSeatManagementData {
    id: string;
    date: string;
    total_seats: number;
    seats: SeatManagement;
    enterprise: string | null;
    organization: string | null;
    last_update: string | null;
}

export interface SeatBreakdown {
    total: number;
    added_this_cycle: number;
    pending_invitation: number;
    pending_cancellation: number;
    active_this_cycle: number;
    inactive_this_cycle: number;
  }
  
  export interface SeatManagement {
    seat_breakdown: SeatBreakdown;
    seat_management_setting: string;
    public_code_suggestions: string;
    ide_chat: string;
    platform_chat: string;
    cli: string;
    plan_type: string;
  }

  export interface CopilotUsage {
    total_active_users: number;
    total_engaged_users: number;
    total_ide_engaged_users: number;
    total_code_suggestions: number;
    total_code_acceptances: number;
    total_code_lines_suggested: number;
    total_code_lines_accepted: number;
    total_chat_engaged_users: number;
    total_chats: number;
    total_chat_insertion_events: number;
    total_chat_copy_events: number;
    day: string;
    breakdown: Breakdown[];
  }
  
  export interface Breakdown {
    language: string;
    editor: string;
    model: string;
    suggestions_count: number;
    acceptances_count: number;
    lines_suggested: number;
    lines_accepted: number;
    active_users: number;
  }

  export interface CopilotUsageOutput extends CopilotUsage {
    time_frame_week: string;
    time_frame_month: string;
    time_frame_display: string;
  }

  export interface Languages {
    name: string;
    total_engaged_users: number;
  }

  export interface LanguageMetrics {
    name: string;
    total_engaged_users: number;
    total_code_suggestions?: number;
    total_code_acceptances?: number;
    total_code_lines_suggested?: number;
    total_code_lines_accepted?: number;
  }
  
  export interface ModelMetrics {
    name: string;
    is_custom_model: boolean;
    custom_model_training_date: string | null;
    total_engaged_users: number;
    languages?: LanguageMetrics[];
    total_chats?: number;
    total_chat_insertion_events?: number;
    total_chat_copy_events?: number;
    total_pr_summaries_created?: number;
  }
  
  export interface EditorMetrics {
    name: string;
    total_engaged_users: number;
    models: ModelMetrics[];
  }
  
  export interface RepositoryMetrics {
    name: string;
    total_engaged_users: number;
    models: ModelMetrics[];
  }
  
  export interface CopilotIDEMetrics {
    total_engaged_users: number;
    languages: Languages[];
    editors: EditorMetrics[];
  }
  
  export interface CopilotIDEChatMetrics {
    total_engaged_users: number;
    editors: EditorMetrics[];
  }
  
  export interface CopilotDotcomChatMetrics {
    total_engaged_users: number;
    models: ModelMetrics[];
  }
  
  export interface CopilotDotcomPullRequestsMetrics {
    total_engaged_users: number;
    repositories: RepositoryMetrics[];
  }
  
  export interface CopilotMetrics {
    date: string;
    total_active_users: number;
    total_engaged_users: number;
    copilot_ide_code_completions: CopilotIDEMetrics;
    copilot_ide_chat: CopilotIDEChatMetrics;
    copilot_dotcom_chat: CopilotDotcomChatMetrics;
    copilot_dotcom_pull_requests: CopilotDotcomPullRequestsMetrics;
  }
