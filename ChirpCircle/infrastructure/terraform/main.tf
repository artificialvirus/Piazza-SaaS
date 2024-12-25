# /infrastructure/terraform/main.tf
###########################
# MAIN.TF
###########################

# main.tf orchestrates resources and potentially sets up outputs

# Ooutput referencing GKE cluster:
output "gke_cluster_name" {
  value = google_container_cluster.primary.name
}

output "gke_endpoint" {
  value = google_container_cluster.primary.endpoint
}

# Output VM external IP
output "app_vm_ip" {
  value = google_compute_instance.app_vm.network_interface[0].access_config[0].nat_ip
}

###########################
# END OF MAIN.TF
###########################

