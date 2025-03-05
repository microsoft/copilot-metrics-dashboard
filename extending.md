# Extending the Solution with a New Data Source/API Endpoint

## Data Ingestion

1. **Add Model**
   - Create a model that describes the API integration model in `DataIngestion.Models`.
   - This model should define the structure of the data you expect to receive from the API.
   - **Example:**
     ```csharp
     public class PullRequestModel {
         public int Id { get; set; }
         public string Title { get; set; }
         public string State { get; set; }
         public string Url { get; set; }
         // ...other properties...
     }
     ```

2. **Add Service for API Integration**
   - Implement a service for GitHub API integration in `DataIngestion.Services`.
   - This service should handle the communication with the GitHub API, including authentication and data retrieval.
   - **Example:**
     ```csharp
     public class GitHubService {
         private readonly HttpClient _httpClient;

         public GitHubService(HttpClient httpClient) {
             _httpClient = httpClient;
         }

         public async Task<List<PullRequestModel>> GetPullRequestsAsync(string repo) {
             var response = await _httpClient.GetAsync($"https://api.github.com/repos/{repo}/pulls");
             response.EnsureSuccessStatusCode();
             var content = await response.Content.ReadAsStringAsync();
             return JsonConvert.DeserializeObject<List<PullRequestModel>>(content);
         }
     }
     ```

3. **Add Test Data**
   - Create test data in `DataIngestion.TestData`.
   - This data will be used for testing the integration and ensuring that the service works as expected.
   - **Example:**
     ```json
     [
         {
             "Id": 1,
             "Title": "Fix bug",
             "State": "open",
             "Url": "https://api.github.com/repos/owner/repo/pulls/1"
         },
         {
             "Id": 2,
             "Title": "Add feature",
             "State": "closed",
             "Url": "https://api.github.com/repos/owner/repo/pulls/2"
         }
     ]
     ```

4. **Add Data Retrieval Function**
   - Implement a function that uses the service created in step #2 to pull data from the GitHub API.
   - The function should return the retrieved data and push it to the database based on the `CosmosDBOutput` attribute configuration.
   - **Example:**
     ```csharp
     public static class PullRequestFunction {
         [FunctionName("PullRequestFunction")]
         [CosmosDBOutput(databaseName: "platform-engineering", containerName: "pull_requests", Connection = "AZURE_COSMOSDB_ENDPOINT", CreateIfNotExists = true)]
         public static async Task<List<PullRequestModel>> Run(
             [TimerTrigger("0 */5 * * * *")] TimerInfo myTimer) {
             var service = new GitHubService(new HttpClient());
             var pullRequests = await service.GetPullRequestsAsync("owner/repo");
             return pullRequests;
         }
     }
     ```

## Dashboard

1. **Add Model**
   - Create a model in `dashboard/features/common/models.tsx`.
   - This model should define the structure of the data that will be displayed on the dashboard.
   - **Example:**
     ```typescript
     export interface PullRequest {
         id: number;
         title: string;
         state: string;
         url: string;
         // ...other properties...
     }
     ```

2. **Add Data Service**
   - Implement a data service in `dashboard/services`.
   - This service should handle the retrieval of data from the database and provide it to the dashboard components.
   - **Example:**
     ```typescript
     import { PullRequest } from '../features/common/models';

     export class PullRequestService {
         async getPullRequests(): Promise<PullRequest[]> {
            if (isCosmosConfig) {
                 return getPullRequestsFromDatabase();
            }

            const response = await fetch('/api/pullrequests');
            return await response.json();
         }
     }
     ```

3. **Add UI Element**
   - Create a new UI element to display the data on the dashboard.
   - Ensure that the UI element is integrated with the data service to dynamically display the retrieved data.
   - **Example:**
     ```typescript
     import React, { useEffect, useState } from 'react';
     import { PullRequestService } from '../services/PullRequestService';
     import { PullRequest } from '../features/common/models';

     const PullRequestList: React.FC = () => {
         const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);

         useEffect(() => {
             const service = new PullRequestService();
             service.getPullRequests().then(setPullRequests);
         }, []);

         return (
             <div>
                 <h2>Pull Requests</h2>
                 <ul>
                     {pullRequests.map(pr => (
                         <li key={pr.id}>
                             <a href={pr.url}>{pr.title}</a> - {pr.state}
                         </li>
                     ))}
                 </ul>
             </div>
         );
     };

     export default PullRequestList;
     ```
# Infra
1. Add a new collection to the existing Cosmos DB database

# Metrics

1. Number of pull request
2. Number of comments per pull request
3. PR Merge Time
4. Issue Resolution Rate
5. Number of lines per PR
