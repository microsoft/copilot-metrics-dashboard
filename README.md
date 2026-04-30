# GitHub Copilot Metrics - Dashboard

- [GitHub Copilot Metrics - Dashboard](#github-copilot-metrics---dashboard)
- [Introduction](#introduction)
  - [Dashboard](#dashboard)
    - [Features](#features)
    - [Getting Started Locally](#getting-started-locally)
      - [Environment Variables](#environment-variables)
      - [Install \& Run](#install--run)
  - [Seats](#seats)
- [Deploy to Azure](#deploy-to-azure)
      - [Prerequisites](#prerequisites)
- [Contributing](#contributing)
- [Trademarks](#trademarks)

# Introduction

The GitHub Copilot Metrics Dashboard is a solution accelerator designed to visualize metrics from GitHub Copilot using the [Copilot usage-metrics report API](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-metrics?apiVersion=2022-11-28) (`/copilot/metrics/reports/users-28-day/latest`) and the [GitHub Copilot User Management API](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-user-management?apiVersion=2022-11-28). See [docs/metrics-ingestion.md](docs/metrics-ingestion.md) for a detailed explanation of how raw report data is fetched and aggregated.

## Dashboard

![GitHub Copilot Metrics - Dashboard](/docs/dashboard_2025.png "GitHub Copilot Metrics - Dashboard")

### Features

The dashboard showcases a range of features:

**Filters:**
Ability to filter metrics by date range, languages, code editors, teams and visualise data by time frame (daily, weekly, monthly).

**Acceptance Average:** Percentage of suggestions accepted by users for given date range and group by time range (daily, weekly, monthly).

**Active Users:** Number of active users for the last cycle.

**Adoption Rate:** Number of active users who are using GitHub Copilot in relation to the total number of licensed users.

**Seat Information:** Number of active, inactive, and total users.

**Language:** Breakdown of languages which can be used to filter the data.

**Code Editors:** Breakdown of code editors which can be used to filter the data.

**Teams Filter:** Interactive filter available in the dashboard UI that allows you to analyze Copilot usage and adoption patterns by specific GitHub teams. This feature dynamically loads team data and provides team-level insights for more granular analysis of Copilot effectiveness across different organizational units.

### Getting Started Locally

To run the dashboard on your local machine, head to the **dashboard** folder under **src**:
```
📦copilot-metrics-dashboard
 ┣ 📂.github
 ┣ 📂docs
 ┣ 📂infra
 ┣ 📂src
 ┃ ┣  📂dashboard
 ┃ ┗ ...
 ┗ ...

```
#### Environment Variables

Copy `src/dashboard/.env.example` to `src/dashboard/.env` and fill in the following:

| Variable | Required | Description |
|---|---|---|
| `GITHUB_API_SCOPE` | No (default: `organization`) | `organization` or `enterprise` — sets the API scope. |
| `GITHUB_ORGANIZATION` | When scope is `organization` | Your GitHub org slug. |
| `GITHUB_ENTERPRISE` | When scope is `enterprise` | Your GitHub enterprise slug. |
| `GITHUB_TOKEN` | Yes | PAT with `read:org`, `read:user`, and `copilot` scopes (add `read:enterprise` for enterprise scope). |
| `GITHUB_API_VERSION` | Yes | GitHub API version — use `2022-11-28`. |

#### Install & Run

Open the terminal while in the **dashboard** directory and do the following:

First, install packages using:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```
Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Seats

Seats feature shows the list of user having a Copilot licence assigned.
This feature is can be enabled or disabled by setting the `ENABLE_SEATS_FEATURE` environment variable to `true` or `false` respectively (default value is `true`).

> Assigned seats ingestion is enabled by default, is possbile to disable by setting the `ENABLE_SEATS_INGESTION` environment variable to `false`

# Deploy to Azure

The solution accelerator is a web application that uses Azure App Service, Azure Functions, Azure Cosmos DB, Azure Storage and Azure Key Vault. The deployment template will automatically populate the required environment variables in Azure Key Vault and configure the application settings in Azure App Service and Azure Functions.
![GitHub Copilot Metrics - Architecture ](/docs/CopilotDashboard.png "GitHub Copilot Metrics - Architecture")

The following steps will automatically provision Azure resources and deploy the solution accelerator to Azure App Service and Azure Functions using the Azure Developer CLI.

> [!IMPORTANT]
> 🚨🚨🚨 You must setup [authentication](https://learn.microsoft.com/en-us/azure/app-service/overview-authentication-authorization) using the built-in authentication and authorization capabilities of Azure App Service.

#### Prerequisites

You will be prompted to provide the following information:

| Variable | Required | Description |
|---|---|---|
| `GITHUB_API_SCOPE` | No (default: `organization`) | `organization` or `enterprise`. |
| `GITHUB_ORGANIZATION` | When scope is `organization` | Your GitHub org slug. |
| `GITHUB_ENTERPRISE` | When scope is `enterprise` | Your GitHub enterprise slug. |
| `GITHUB_TOKEN` | Yes | PAT — see [Token Requirements](infra/README.md#github-token-requirements). |

> **Note:** The Azure deployment (Bicep) still prompts for **both** org and enterprise names even though only one is used at runtime. Set the unused value to a placeholder (e.g. `n/a`) if your scope doesn't require it.

> More details for the [Copilot usage-metrics API](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-metrics?apiVersion=2022-11-28) and the [GA announcement](https://github.blog/changelog/2024-10-30-github-copilot-metrics-api-ga-release-now-available/).

1. Download the [Azure Developer CLI](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/overview)
2. If you have not cloned this repo, run `azd init -t microsoft/copilot-metrics-dashboard`. If you have cloned this repo, just run 'azd init' from the repo root directory.
3. Run `azd up` to provision and deploy the application

```pwsh
azd init -t microsoft/copilot-metrics-dashboard
azd up

# if you are wanting to see logs run with debug flag
azd up --debug
```

# Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

# Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft&#39;s Trademark &amp; Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
