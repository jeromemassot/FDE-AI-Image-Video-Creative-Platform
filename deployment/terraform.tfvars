# GCP Project Configuration
project_id = "terraform-dev-487502"
region     = "us-central1"

# GCP Services Configuration
gcp_service_list = [
  "cloudresourcemanager.googleapis.com",
  "iam.googleapis.com",
  "artifactregistry.googleapis.com",
  "run.googleapis.com",
  "cloudbuild.googleapis.com",
  "aiplatform.googleapis.com",
  "iap.googleapis.com"
]

# Artifact Registry Configuration
artifact_repository_id          = "ai-video-creator"
artifact_repository_description = "Docker repository for AI Video Scene Creator"

# Cloud Run Service Account Configuration
cloud_run_sa_account_id   = "cloud-run-sa"
cloud_run_sa_display_name = "Cloud Run Service Account"
cloud_run_sa_description  = "Used by Cloud Run to invoke the Cloud Run service"
cloud_run_sa_roles = [
  "roles/aiplatform.user"
]

# GitHub Actions Configuration
github_actions_sa_account_id   = "github-actions-deployer"
github_actions_sa_display_name = "GitHub Actions Deployer Service Account"
github_actions_sa_description  = "Used by GitHub Actions to build and deploy the application"
github_actions_sa_roles = [
  "roles/artifactregistry.writer",
  "roles/run.admin",
  "roles/iam.serviceAccountUser"
]

# Workload Identity Pool Configuration
wip_id                    = "github-actions-pool"
wip_display_name          = "GitHub Actions Pool"
wip_description           = "Workload Identity Pool for GitHub Actions"
wip_provider_id           = "github-actions-provider"
wip_provider_display_name = "GitHub Actions Provider"
wip_provider_description  = "OIDC Identity Provider for GitHub Actions"
github_repo               = "jeromemassot/FDE-AI-Image-Video-Creative-Platform"

