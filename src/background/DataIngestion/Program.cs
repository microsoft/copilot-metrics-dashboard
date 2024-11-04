using System.Net.Http.Headers;
using Microsoft.CopilotDashboard.DataIngestion.Functions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices(services =>
    {
        services.AddHttpClient<GitHubCopilotUsageClient>(client => 
        {
            var apiVersion = Environment.GetEnvironmentVariable("GITHUB_API_VERSION");
            var token = Environment.GetEnvironmentVariable("GITHUB_TOKEN");

            client.BaseAddress = new Uri("https://api.github.com/");
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github+json"));
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            client.DefaultRequestHeaders.Add("X-GitHub-Api-Version", apiVersion);
            client.DefaultRequestHeaders.Add("User-Agent", "GitHubCopilotDataIngestion");
        });
    })
    .Build();

host.Run();
