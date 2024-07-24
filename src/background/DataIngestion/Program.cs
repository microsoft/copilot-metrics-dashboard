using Microsoft.DevOpsDashboard.DataIngestion.Functions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var host = new HostBuilder()
    .ConfigureFunctionsWebApplication()
    .ConfigureServices(services =>
    {
        services.AddHttpClient<GitHubCopilotUsageClient>();
    })
    .Build();

host.Run();
