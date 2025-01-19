param name string = 'azurechat-demo'
param resourceToken string

param location string = resourceGroup().location

@secure()
param githubToken string

param githubEnterpriseName string

param githubOrganizationName string

param githubAPIVersion string

param githubAPIScope string

param useTestData bool = false

param teamNames array = []

param tags object = {}

var shortName = take(toLower(replace(name, '-', '')), 5)

var cosmosName = toLower('${name}-metrics-${resourceToken}')
var webappName = toLower('${name}-dashboard-${resourceToken}')
var storageName = toLower('${shortName}${resourceToken}')
var functionAppName = toLower('${name}-ingest-${resourceToken}')
var appserviceName = toLower('${name}-dashboard-${resourceToken}')

// keyvault name must be less than 24 chars - token is 13
var keyVaultName = toLower('${shortName}-kv-${resourceToken}')
var logWorkspaceName = toLower('${name}-la-${resourceToken}')
var appinsightsName = toLower('${name}-appi-${resourceToken}')
var diagnosticSettingName = 'AppServiceConsoleLogs'

var keyVaultSecretsOfficerRole = subscriptionResourceId(
  'Microsoft.Authorization/roleDefinitions',
  'b86a8fe4-44ce-4948-aee5-eccb2c155cd7'
)
var storageDataWriterRole = subscriptionResourceId(
  'Microsoft.Authorization/roleDefinitions',
  'ba92f5b4-2d11-453d-a403-e96b0029c9fe'
)

var databaseName = 'platform-engineering'
var orgContainerName = 'history'
var metricsContainerName = 'metrics_history'
var seatsContainerName = 'seats_history'

resource appServicePlan 'Microsoft.Web/serverfarms@2020-06-01' = {
  name: appserviceName
  location: location
  tags: tags
  properties: {
    reserved: true
  }
  sku: {
    name: 'P0v3'
    tier: 'Premium0V3'
    size: 'P0v3'
    family: 'Pv3'
    capacity: 1
  }
  kind: 'linux'
}

var teamNameAppSettings = [
  for (teamName, idx) in teamNames: {
    name: 'GITHUB_METRICS__Teams__${idx}'
    value: teamName
  }
]

resource copilotDataFunction 'Microsoft.Web/sites@2023-12-01' = {
  name: functionAppName
  tags: union(tags, { 'azd-service-name': 'ingestion' })
  kind: 'functionapp'
  identity: { type: 'SystemAssigned' }
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      alwaysOn: true
      linuxFxVersion: 'DOTNET-ISOLATED|8.0'
      appSettings: union(teamNameAppSettings, [
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'AzureWebJobsStorage__accountname'
          value: storage.name
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'dotnet-isolated'
        }
        {
          name: 'AZURE_COSMOSDB_ENDPOINT__accountEndpoint'
          value: cosmosDbAccount.properties.documentEndpoint
        }
        {
          name: 'GITHUB_TOKEN'
          value: '@Microsoft.KeyVault(VaultName=${kv.name};SecretName=${kv::GITHUB_TOKEN.name})'
        }
        {
          name: 'GITHUB_ENTERPRISE'
          value: githubEnterpriseName
        }
        {
          name: 'GITHUB_ORGANIZATION'
          value: githubOrganizationName
        }
        {
          name: 'GITHUB_API_VERSION'
          value: githubAPIVersion
        }
        {
          name: 'GITHUB_API_SCOPE'
          value: githubAPIScope
        }
        {
          name: 'GITHUB_METRICS__UseTestData'
          value: '${useTestData}'
        }
      ])
    }
  }
}

resource webApp 'Microsoft.Web/sites@2020-06-01' = {
  name: webappName
  location: location
  tags: union(tags, { 'azd-service-name': 'frontend' })
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'node|20-lts'
      alwaysOn: true
      appCommandLine: 'next start'
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      appSettings: [
        {
          name: 'AZURE_KEY_VAULT_NAME'
          value: keyVaultName
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
        {
          name: 'AZURE_COSMOSDB_ENDPOINT'
          value: cosmosDbAccount.properties.documentEndpoint
        }
        {
          name: 'GITHUB_TOKEN'
          value: '@Microsoft.KeyVault(VaultName=${kv.name};SecretName=${kv::GITHUB_TOKEN.name})'
        }
        {
          name: 'GITHUB_ENTERPRISE'
          value: githubEnterpriseName
        }
        {
          name: 'GITHUB_ORGANIZATION'
          value: githubOrganizationName
        }
        {
          name: 'GITHUB_API_VERSION'
          value: githubAPIVersion
        }
        {
          name: 'GITHUB_API_SCOPE'
          value: githubAPIScope
        }
      ]
    }
  }
  identity: { type: 'SystemAssigned' }

  resource configLogs 'config' = {
    name: 'logs'
    properties: {
      applicationLogs: { fileSystem: { level: 'Verbose' } }
      detailedErrorMessages: { enabled: true }
      failedRequestsTracing: { enabled: true }
      httpLogs: { fileSystem: { enabled: true, retentionInDays: 1, retentionInMb: 35 } }
    }
  }
}

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2021-12-01-preview' = {
  name: logWorkspaceName
  location: location
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appinsightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    RetentionInDays: 30
    WorkspaceResourceId: logAnalyticsWorkspace.id
  }
}

resource webDiagnosticSettings 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: diagnosticSettingName
  scope: webApp
  properties: {
    workspaceId: logAnalyticsWorkspace.id
    logs: [
      {
        category: 'AppServiceConsoleLogs'
        enabled: true
      }
    ]
    metrics: []
  }
}

resource kvFunctionAppPermissions 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = {
  name: guid(kv.id, copilotDataFunction.name, keyVaultSecretsOfficerRole)
  scope: kv
  properties: {
    principalId: copilotDataFunction.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: keyVaultSecretsOfficerRole
  }
}

resource kvWebAppPermissions 'Microsoft.Authorization/roleAssignments@2020-04-01-preview' = {
  name: guid(kv.id, webApp.name, keyVaultSecretsOfficerRole)
  scope: kv
  properties: {
    principalId: webApp.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: keyVaultSecretsOfficerRole
  }
}

resource kv 'Microsoft.KeyVault/vaults@2021-06-01-preview' = {
  name: keyVaultName
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enabledForDeployment: false
    enabledForDiskEncryption: true
    enabledForTemplateDeployment: false
  }

  resource GITHUB_TOKEN 'secrets' = {
    name: 'GITHUB-TOKEN'
    properties: {
      contentType: 'text/plain'
      value: githubToken
    }
  }
}

resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: cosmosName
  location: location
  tags: tags
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
      }
    ]
    disableKeyBasedMetadataWriteAccess: true
  }
}

resource database 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2022-05-15' = {
  name: databaseName
  parent: cosmosDbAccount
  properties: {
    resource: {
      id: databaseName
    }
  }
}

resource historyContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2022-05-15' = {
  name: orgContainerName
  parent: database
  properties: {
    resource: {
      id: orgContainerName
      partitionKey: {
        paths: [
          '/Month'
        ]
        kind: 'Hash'
      }
    }
  }
}

resource metricsHistoryContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2022-05-15' = {
  name: metricsContainerName
  parent: database
  properties: {
    resource: {
      id: metricsContainerName
      partitionKey: {
        paths: [
          '/date'
        ]
        kind: 'Hash'
      }
    }
  }
}

resource seatsHistoryContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2022-05-15' = {
  name: seatsContainerName
  parent: database
  properties: {
    resource: {
      id: seatsContainerName
      partitionKey: {
        paths: [
          '/date'
        ]
        kind: 'Hash'
      }
    }
  }
}

resource cosmosDbDataContributor 'Microsoft.DocumentDB/databaseAccounts/sqlRoleAssignments@2024-05-15' = {
  name: guid(cosmosDbAccount.id, copilotDataFunction.name, 'DataContributor')
  parent: cosmosDbAccount
  properties: {
    principalId: copilotDataFunction.identity.principalId
    roleDefinitionId: '/${subscription().id}/resourceGroups/${resourceGroup().name}/providers/Microsoft.DocumentDB/databaseAccounts/${cosmosDbAccount.name}/sqlRoleDefinitions/00000000-0000-0000-0000-000000000002'
    scope: cosmosDbAccount.id
  }
}

resource cosmosDbDataReader 'Microsoft.DocumentDB/databaseAccounts/sqlRoleAssignments@2024-05-15' = {
  name: guid(cosmosDbAccount.id, webApp.name, 'DataReader')
  parent: cosmosDbAccount
  properties: {
    principalId: webApp.identity.principalId
    roleDefinitionId: '/${subscription().id}/resourceGroups/${resourceGroup().name}/providers/Microsoft.DocumentDB/databaseAccounts/${cosmosDbAccount.name}/sqlRoleDefinitions/00000000-0000-0000-0000-000000000001'
    scope: cosmosDbAccount.id
  }
}

resource storage 'Microsoft.Storage/storageAccounts@2023-04-01' = {
  name: storageName
  kind: 'StorageV2'
  sku: { name: 'Standard_LRS' }
  location: location
  properties: {
    allowBlobPublicAccess: false
  }
}

resource storageDataContributor 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storage.id, copilotDataFunction.name, 'DataContributor')
  scope: storage
  properties: {
    principalId: copilotDataFunction.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: storageDataWriterRole
  }
}

output url string = 'https://${webApp.properties.defaultHostName}'
