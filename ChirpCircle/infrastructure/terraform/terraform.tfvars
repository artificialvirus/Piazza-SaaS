# infrastructure/terraform/terraform.tfvars
project_id              = "piazza-saas"
region                  = "us-central1"
zone                    = "us-central1-a"
google_credentials_file = "./piazza-saas-24579ea24e45.json" # SA key path
cluster_name            = "chirpcircle-cluster"
cluster_node_count      = 3
vm_machine_type         = "e2-medium"
environment             = "dev"
service_account_email   = "805530043264-compute@developer.gserviceaccount.com"

