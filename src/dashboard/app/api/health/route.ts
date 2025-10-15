import { NextResponse } from "next/server";
import packageJson from "@/package.json";

export const dynamic = "force-dynamic";

interface HealthCheckResult {
  name: string;
  status: "Healthy" | "Unhealthy";
  description: string;
}

interface HealthStatus {
  status: "Healthy" | "Unhealthy";
  timestamp: string;
  service: string;
  version: string;
  checks: HealthCheckResult[];
}

export function GET() {
  const checks: HealthCheckResult[] = [];

  // Check required environment variables for GitHub API access
  const requiredEnvVars = [
    { name: "GITHUB_TOKEN", displayName: "GitHub Token" },
    { name: "GITHUB_API_VERSION", displayName: "GitHub API Version" },
    { name: "GITHUB_ORGANIZATION", displayName: "GitHub Organization" },
    { name: "GITHUB_ENTERPRISE", displayName: "GitHub Enterprise" },
  ];

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.name];
    const isHealthy = value !== undefined && value.trim() !== "";
    checks.push({
      name: envVar.displayName,
      status: isHealthy ? "Healthy" : "Unhealthy",
      description: isHealthy
        ? `${envVar.displayName} is configured`
        : `${envVar.displayName} is missing or empty`,
    });
  }

  // Determine overall status
  const overallStatus = checks.every((check) => check.status === "Healthy")
    ? "Healthy"
    : "Unhealthy";

  const healthStatus: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    service: "CopilotMetrics Dashboard",
    version: packageJson.version,
    checks,
  };

  const statusCode = overallStatus === "Healthy" ? 200 : 503;

  return NextResponse.json(healthStatus, { status: statusCode });
}

