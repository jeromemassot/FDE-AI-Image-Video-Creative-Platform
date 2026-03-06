# GCP Project Configuration
variable "project_id" {
  description = "The GCP Project ID"
  type        = string
}

variable "region" {
  description = "The GCP region for resources"
  type        = string
  default     = "us-central1"
}

# GCP Services Configuration
variable "gcp_service_list" {
  description = "The list of APIs to enable in the GCP project"
  type        = set(string)
}

# Artifact Registry Configuration
variable "artifact_repository_id" {
  description = "The ID of the Artifact Registry repository"
  type        = string
}

variable "artifact_repository_description" {
  description = "The description of the Artifact Registry repository"
  type        = string
}

# Cloud Run Service Account Configuration
variable "cloud_run_sa_account_id" {
  description = "The account ID for the Cloud Run service account"
  type        = string
}

variable "cloud_run_sa_display_name" {
  description = "The display name for the Cloud Run service account"
  type        = string
}

variable "cloud_run_sa_description" {
  description = "The description for the Cloud Run service account"
  type        = string
}

variable "cloud_run_sa_roles" {
  description = "A set of IAM roles to assign to the Cloud Run service account"
  type        = set(string)
}

# GitHub Actions Service Account Configuration
variable "github_actions_sa_account_id" {
  description = "The account ID for the GitHub Actions service account"
  type        = string
}

variable "github_actions_sa_display_name" {
  description = "The display name for the GitHub Actions service account"
  type        = string
}

variable "github_actions_sa_description" {
  description = "The description for the GitHub Actions service account"
  type        = string
}

variable "github_actions_sa_roles" {
  description = "A set of IAM roles to assign to the GitHub Actions service account"
  type        = set(string)
}

# Workload Identity Pool Configuration
variable "wip_id" {
  description = "The ID for the Workload Identity Pool"
  type        = string
}

variable "wip_display_name" {
  description = "The display name for the Workload Identity Pool"
  type        = string
}

variable "wip_description" {
  description = "The description for the Workload Identity Pool"
  type        = string
}

variable "wip_provider_id" {
  description = "The ID for the Workload Identity Provider"
  type        = string
}

variable "wip_provider_display_name" {
  description = "The display name for the Workload Identity Provider"
  type        = string
}

variable "wip_provider_description" {
  description = "The description for the Workload Identity Provider"
  type        = string
}

variable "github_repo" {
  description = "The GitHub repository to allow access from, e.g., my-org/my-repo"
  type        = string
}
