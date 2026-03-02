# CI/CD Setup Guide

This guide provides instructions for setting up the CI/CD pipeline for the AI Video Scene Creator.

## 1. Google Cloud Platform Setup

### Create Artifact Registry
Ensure a repository named `genai` exists in your project.
```bash
gcloud artifacts repositories create genai --repository-format=docker --location=us-central1
```

### Create a Service Account for GitHub Actions
Create a service account (e.g., `github-actions-deployer`) and grant it the necessary roles.

**Roles for GitHub Actions SA:**
- `Cloud Build Editor` (`roles/cloudbuild.builds.editor`)
- `Storage Admin` (`roles/storage.admin`)

**Download JSON Key:**
Create and download a JSON key for this service account to be used in GitHub Secrets.

### Configure Cloud Build Service Account
The default Cloud Build service account (`PROJECT_NUMBER@cloudbuild.gserviceaccount.com`) needs permissions to deploy to Cloud Run.

**Roles for Cloud Build SA:**
- `Cloud Run Admin` (`roles/run.admin`)
- `Service Account User` (`roles/iam.serviceAccountUser`)

## 2. GitHub Configuration

### Add Secrets
In your GitHub repository settings, add the following **Actions Secrets**:
- `GCP_PROJECT_ID`: Your Google Cloud Project ID.
- `GCP_SA_KEY`: The contents of the service account JSON key downloaded earlier.

## 3. Workflow Trigger
Pushing any changes to the `main` branch will now automatically:
1. Trigger the GitHub Action.
2. Submit a Cloud Build job.
3. Build and push the container to Artifact Registry.
4. Deploy the new version to Cloud Run.
