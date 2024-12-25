# infrastructure/terraform/variables.tf
variable "project_id" {}
variable "region" {}
variable "zone" {}
variable "google_credentials_file" {}
variable "cluster_name" {}
variable "environment" {}
variable "service_account_email" {}
variable "cluster_node_count" {
  default = 3
}


variable "vm_machine_type" {
  default = "e2-medium"
}

