# CI/CD Setup Guide

This guide details the CI/CD pipeline architecture for the AI Video Scene Creator. The pipeline uses **GitHub Actions** to build a Docker container and deploy it to **Google Cloud Run**, utilizing **Workload Identity Federation** for secure, keyless authentication. All underlying Google Cloud Platform (GCP) resources are provisioned via **Terraform**.

## 1. Infrastructure via Terraform

The entire GCP infrastructure required for CI/CD is defined in the `deployment/` directory.

### Resources Provisioned
Running `terraform apply` provisions the following:
1. **Enabled APIs**: Essential APIs explicitly enabled (e.g., `run.googleapis.com`, `artifactregistry.googleapis.com`).

2. **Artifact Registry Repository**: A Docker repository (by default `ai-video-creator`) to store the built container images.

3. **GitHub Actions Service Account**: A dedicated service account (`github-actions-deployer`) granted exactly three roles:
    - `Artifact Registry Writer`: To push built images.
    - `Cloud Run Admin`: To execute deploys to Cloud Run.
    - `Service Account User`: To assign itself as the runtime identity for the Cloud Run service.
    
4. **Workload Identity Pool & Provider**: An OIDC provider mapping GitHub Actions tokens to the GCP Service Account. This eliminates the need to download or store long-lived JSON keys maliciously. It is strictly scoped to allow authentication *only* from your specific GitHub repository.

## 2. GitHub Configuration

Instead of storing a sensitive JSON key, you only need to provide GitHub Actions with the public names of your Terraform-created resources.

### Add GitHub Variables
In your GitHub repository, navigate to **Settings > Secrets and variables > Actions > Variables**, and add the following:
- `WIP_PROVIDER_NAME`: The full identifier of your Workload Identity Provider.
  - *You can get this by running `terraform output workload_identity_provider_name` inside your `deployment/` folder.*

*(Note: There are no GitHub "Secrets" used in this workflow, only standard Variables, increasing security.)*

## 3. GitHub Actions Workflow (`.github/workflows/deploy.yaml`)

Pushing any changes to the `cicd` branch (specifically modifying the `app/` folder) automatically triggers an end-to-end pipeline:

1. **Google Auth (Workload Identity Federation)**: Exchanges the short-lived GitHub OIDC token for a GCP access token using the provider name stored in `WIP_PROVIDER_NAME`. It provisions the `github-actions-deployer` service account identity.

2. **Configure Docker**: Sets up `gcloud` to authenticate Docker requests destined for `REGION-docker.pkg.dev`.

3. **Build Docker Image**: Builds the lightweight Dockerfile locally on the GitHub runner.

4. **Push Docker Image**: Pushes the newly built container straight to the Terraform-provisioned Artifact Registry.

5. **Deploy to Cloud Run**: Calls the official GCP action to deploy the newly pushed image onto Cloud Run, updating the live service.
