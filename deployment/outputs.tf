output "artifact_registry_url" {
  description = "The URL of the created Artifact Registry repository"
  value       = google_artifact_registry_repository.genai_repo.id
}

output "github_actions_sa_email" {
  description = "The email of the GitHub Actions service account"
  value       = google_service_account.github_actions.email
}

output "cloud_run_sa_email" {
  description = "The email of the Cloud Run service account"
  value       = google_service_account.cloud_run.email
}

output "workload_identity_provider_name" {
  description = "The Workload Identity Provider name to use in GitHub Actions"
  value       = google_iam_workload_identity_pool_provider.github_actions.name
}
