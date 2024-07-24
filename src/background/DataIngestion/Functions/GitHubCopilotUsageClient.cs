using Microsoft.DevOpsDashboard.DataIngestion.Domain;
using System.Net.Http.Headers;
using System.Text.Json;

namespace Microsoft.DevOpsDashboard.DataIngestion.Functions
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
            var apiVersion = Environment.GetEnvironmentVariable("GITHUB_API_VERSION");
            var token = Environment.GetEnvironmentVariable("GITHUB_TOKEN");

            _httpClient.BaseAddress = new Uri($"https://api.github.com/orgs/{organization}/copilot/usage");
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github+json"));
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            _httpClient.DefaultRequestHeaders.Add("X-GitHub-Api-Version", apiVersion);
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "GitHubCoPilotUsageIngestion");

            var response = await _httpClient.GetAsync("");
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
