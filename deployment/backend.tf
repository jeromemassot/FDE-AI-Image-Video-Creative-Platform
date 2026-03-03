terraform {
  backend "gcs" {
    bucket = "jm_terraform_states"
    prefix = "ai-video-creator-cicd"
  }
}
