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

The GitHub Copilot Metrics Dashboard is a solution accelerator designed to visualize metrics from GitHub Copilot using the [GitHub Copilot Metrics API](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-metrics?apiVersion=2022-11-28) and [GitHub Copilot User Management API](https://docs.github.com/en/enterprise-cloud@latest/rest/copilot/copilot-user-management?apiVersion=2022-11-28).

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

You will be required to enter the following information in an **.env** file:

```
- GitHub Enterprise name
- GitHub Organization name
- GitHub Token
- GitHub API Scope
```

You can use the **.env.example** file as a reference. GitHub API Scope defines the GITHUB_API_SCOPE environment variable and can be set to either "enterprise" or "organization". It is used to define at which level the GitHub APIs will gather data. If not specified, the default value is "organization".

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

> **Note on `node_modules` patches**
> The dashboard ships a small patch (under `src/dashboard/patches/`) that
> `patch-package` applies automatically during the `postinstall` script. It works
> around an upstream bug in `buffer-equal-constant-time` (a transitive
> dependency of `@azure/identity`) that makes the dashboard crash on
> recent Node.js versions where `Buffer.SlowBuffer` has been removed. See
> [`src/dashboard/patches/README.md`](src/dashboard/patches/README.md) for
> details.

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

```
- GitHub Enterprise name
- GitHub Organization name
- GitHub Token
- GitHub API Scope
```

> More details here for the [GA Metrics API](https://github.blog/changelog/2024-10-30-github-copilot-metrics-api-ga-release-now-available/)

GitHub API Scope defines the GITHUB_API_SCOPE environment variable and can be set to either "enterprise" or "organization". It is used to define at which level the GitHub APIs will gather data. If not specified, the default value is "organization".

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
