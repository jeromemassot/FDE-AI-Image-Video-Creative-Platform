# Enable required GCP APIs
resource "google_project_service" "enabled_apis" {
  for_each           = var.gcp_service_list
  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

# Artifact Registry Repository
resource "google_artifact_registry_repository" "genai_repo" {
  location      = var.region
  repository_id = var.artifact_repository_id
  description   = var.artifact_repository_description
  format        = "DOCKER"
}

# Service Account for GitHub Actions
resource "google_service_account" "github_actions" {
  account_id   = var.github_actions_sa_account_id
  display_name = var.github_actions_sa_display_name
  description  = var.github_actions_sa_description
}

# Roles for GitHub Actions SA
resource "google_project_iam_member" "github_actions_roles" {
  for_each = var.github_actions_sa_roles

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

