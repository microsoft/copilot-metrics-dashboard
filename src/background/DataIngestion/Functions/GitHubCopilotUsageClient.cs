using Microsoft.CopilotDashboard.DataIngestion.Models;
using System.Text.Json;

namespace Microsoft.CopilotDashboard.DataIngestion.Functions
{

    public class GitHubCopilotUsageClient
    {
        private readonly HttpClient _httpClient;

        public GitHubCopilotUsageClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<CopilotUsage>> GetCopilotMetricsForOrgsAsync()
        {
            var organization = Environment.GetEnvironmentVariable("GITHUB_ORGANIZATION");
            var response = await _httpClient.GetAsync($"/orgs/{organization}/copilot/usage");
            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Error fetching data: {response.StatusCode}");
            }

            var content = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<List<CopilotUsage>>(content)!;
            return data;
        }

        public async Task<List<CopilotUsage>> GetCopilotMetricsForEnterpriseAsync()
        {
            var enterprise = Environment.GetEnvironmentVariable("GITHUB_ENTERPRISE");
            var response = await _httpClient.GetAsync($"/enterprises/{enterprise}/copilot/usage");
            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"Error fetching data: {response.StatusCode}");
            }

            var content = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<List<CopilotUsage>>(content)!;
            return data;
        }
    }
}
