targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
param name string

@minLength(1)
@description('Primary location for all resources')
param location string



@description('Name of GitHub enterprise')
@minLength(1)
param githubEnterpriseName string

@description('Name of GitHub organisation')
@minLength(1)
param githubOrganisationName string

@secure()
@description('PAT to call Github API')
param githubToken string

@description('API version for the GitHub API e.g. 2022-11-28')
@minLength(1)
param githubAPIVersion string = '2022-11-28'

param resourceGroupName string = ''

var resourceToken = toLower(uniqueString(subscription().id, name, location))
var tags = { 'azd-env-name': name }

// Organize resources in a resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(resourceGroupName) ? resourceGroupName : 'rg-${name}'
  location: location
  tags: tags
}

module resources 'resources.bicep' = {
  name: 'all-resources'
  scope: rg
  params: {
    name: name
    resourceToken: resourceToken
    tags: tags
    location: location
    githubToken: githubToken
    githubEnterpriseName: githubEnterpriseName
    githubOrganisationName: githubOrganisationName
    githubAPIVersion: githubAPIVersion
    
  }
}

output APP_URL string = resources.outputs.url
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
