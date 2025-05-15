using GitHub.Models;
using Microsoft.CopilotDashboard.DataIngestion.Models;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Microsoft.CopilotDashboard.DataIngestion.Services
{
    public class GitHubCopilotSeatsClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger _logger;
        public GitHubCopilotSeatsClient(HttpClient httpClient, ILogger<GitHubCopilotSeatsClient> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<CopilotSeats> GetEnterpriseAssignedSeatsAsync(string enterprise)
        {
            var token = Environment.GetEnvironmentVariable("GITHUB_TOKEN")!;
            return await GetEnterpriseAssignedSeatsAsync(enterprise, token);

        }

        public async Task<CopilotSeats> GetEnterpriseAssignedSeatsAsync(string enterprise, string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                _logger.LogError("Token is null or empty");
                throw new ArgumentNullException(nameof(token));
            }

            if (_httpClient.DefaultRequestHeaders.Contains("Authorization"))
            {
                _httpClient.DefaultRequestHeaders.Remove("Authorization");
            }
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");

            var url = $"/enterprises/{enterprise}/copilot/billing/seats?per_page=100";
            var allSeats = new List<Seat>(); 
            while (url != null)
            {
                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"Error fetching data: {response.StatusCode}", response.Content);
                    throw new HttpRequestException($"Error fetching data: {response.StatusCode}");
                }
                var content = await response.Content.ReadAsStringAsync();
                var data = JsonSerializer.Deserialize<CopilotSeats>(content)!;
                allSeats.AddRange(data.Seats!); 

                url = Helpers.GetNextPageUrl(response.Headers);
            }

            return new CopilotSeats
            {
                TotalSeats = allSeats.Count,
                Enterprise = enterprise,
                LastUpdate = DateTime.UtcNow,
                Date = DateOnly.FromDateTime(DateTime.UtcNow),
                Seats = allSeats
            };
           
        }

        public async Task<CopilotSeats> GetOrganizationAssignedSeatsAsync(string organization)
        {
            var token = Environment.GetEnvironmentVariable("GITHUB_TOKEN")!;
            return await GetOrganizationAssignedSeatsAsync(organization, token);
        }

        public async Task<CopilotSeats> GetOrganizationAssignedSeatsAsync(string organization, string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                _logger.LogError("Token is null or empty");
                throw new ArgumentNullException(nameof(token));
            }

            if (_httpClient.DefaultRequestHeaders.Contains("Authorization"))
            {
                _httpClient.DefaultRequestHeaders.Remove("Authorization");
            }
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");

            var url = $"/orgs/{organization}/copilot/billing/seats?per_page=100";
            var allSeats = new List<Seat>();
            while (!string.IsNullOrEmpty(url))
            {
                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"Error fetching data: {response.StatusCode}", response.Content);
                    throw new HttpRequestException($"Error fetching data: {response.StatusCode}");
                }
                var content = await response.Content.ReadAsStringAsync();
                var data = JsonSerializer.Deserialize<CopilotSeats>(content)!;
                allSeats.AddRange(data.Seats!);

                url = Helpers.GetNextPageUrl(response.Headers);
            }

            return new CopilotSeats
            {
                TotalSeats = allSeats.Count,
                Organization = organization,
                LastUpdate = DateTime.UtcNow,
                Date = DateOnly.FromDateTime(DateTime.UtcNow),
                Seats = allSeats
            };

        }

        public async Task<List<CopilotSeats>> GetEnterpriseAssignedSeatsPagesAsync(string enterprise, string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                _logger.LogError("Token is null or empty");
                throw new ArgumentNullException(nameof(token));
            }
            if (_httpClient.DefaultRequestHeaders.Contains("Authorization"))
            {
                _httpClient.DefaultRequestHeaders.Remove("Authorization");
            }
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");

            var url = $"/enterprises/{enterprise}/copilot/billing/seats?per_page=100";
            var page = 1;
            var seatPages = new List<CopilotSeats>();
            while (!string.IsNullOrEmpty(url))
            {
                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"Error fetching data: {response.StatusCode}", response.Content);
                    throw new HttpRequestException($"Error fetching data: {response.StatusCode}");
                }
                url = Helpers.GetNextPageUrl(response.Headers);
                var content = await response.Content.ReadAsStringAsync();
                var seatPage = JsonSerializer.Deserialize<CopilotSeats>(content)!;
                seatPage.Enterprise = enterprise;
                seatPage.Page = page;
                seatPage.HasNextPage = !string.IsNullOrEmpty(url);
                seatPage.LastUpdate = DateTime.UtcNow;
                seatPage.Date = DateOnly.FromDateTime(DateTime.UtcNow);
                seatPages.Add(seatPage);
                page++;
            }

            var totalActiveSeats = seatPages.SelectMany(s => s.Seats).Count(seat => seat.LastActivityAt != null && seat.LastActivityAt > DateTime.UtcNow.AddDays(-30));
            seatPages.ForEach(seatPage =>
            {
                seatPage.TotalActiveSeats = totalActiveSeats;
            });

            return seatPages;
        }

        public async Task<List<CopilotSeats>> GetOrganizationAssignedSeatsPagesAsync(string organization, string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                _logger.LogError("Token is null or empty");
                throw new ArgumentNullException(nameof(token));
            }
            if (_httpClient.DefaultRequestHeaders.Contains("Authorization"))
            {
                _httpClient.DefaultRequestHeaders.Remove("Authorization");
            }
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");

            var url = $"/orgs/{organization}/copilot/billing/seats?per_page=100";
            var page = 1;
            var seatPages = new List<CopilotSeats>();
            while (!string.IsNullOrEmpty(url))
            {
                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"Error fetching data: {response.StatusCode}", response.Content);
                    throw new HttpRequestException($"Error fetching data: {response.StatusCode}");
                }
                url = Helpers.GetNextPageUrl(response.Headers);
                var content = await response.Content.ReadAsStringAsync();
                var seatPage = JsonSerializer.Deserialize<CopilotSeats>(content)!;
                seatPage.Organization = organization;
                seatPage.Page = page;
                seatPage.HasNextPage = !string.IsNullOrEmpty(url);
                seatPage.LastUpdate = DateTime.UtcNow;
                seatPage.Date = DateOnly.FromDateTime(DateTime.UtcNow);
                seatPages.Add(seatPage);
                page++;
            }

            var totalActiveSeats = seatPages.SelectMany(s => s.Seats).Count(seat => seat.LastActivityAt != null && seat.LastActivityAt > DateTime.UtcNow.AddDays(-30));
            seatPages.ForEach(seatPage =>
            {
                seatPage.TotalActiveSeats = totalActiveSeats;
            });

            return seatPages;
        }
    }
}