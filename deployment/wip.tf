# Workload Identity Pool
resource "google_iam_workload_identity_pool" "github_actions" {
  workload_identity_pool_id = var.wip_id
  project                   = var.project_id
  display_name              = var.wip_display_name
  description               = var.wip_description
}

# Workload Identity Provider
resource "google_iam_workload_identity_pool_provider" "github_actions" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_actions.workload_identity_pool_id
  workload_identity_pool_provider_id = var.wip_provider_id
  display_name                       = var.wip_provider_display_name
  description                        = var.wip_provider_description
  disabled                           = false
  attribute_condition                = <<EOT
    assertion.repository_owner == "jeromemassot" &&
    attribute.repository == "jeromemassot/FDE-AI-Image-Video-Creative-Platform" &&
    assertion.ref == "refs/heads/main" &&
    assertion.ref_type == "branch"
EOT
  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.aud"        = "assertion.aud"
    "attribute.repository" = "assertion.repository"
  }
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

# Allow authenticating from GitHub Actions to the Service Account
resource "google_service_account_iam_member" "github_actions_oidc" {
  service_account_id = google_service_account.github_actions.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_actions.name}/attribute.repository/${var.github_repo}"
}
