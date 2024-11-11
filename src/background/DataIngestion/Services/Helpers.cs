using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace Microsoft.CopilotDashboard.DataIngestion.Services
{
    public class Helpers
    {
        public static string? GetNextPageUrl(HttpResponseHeaders headers)
        {
            if (headers.TryGetValues("Link", out var values))
            {
                var linkHeader = values.FirstOrDefault();
                if (linkHeader != null)
                {
                    var links = linkHeader.Split(',');
                    foreach (var link in links)
                    {
                        var parts = link.Split(';');
                        if (parts.Length == 2 && parts[1].Contains("rel=\"next\""))
                        {
                            var urlPart = parts[0].Trim();
                            return urlPart.Trim('<', '>');
                        }
                    }
                }
            }
            return null;
        }
    }
}
