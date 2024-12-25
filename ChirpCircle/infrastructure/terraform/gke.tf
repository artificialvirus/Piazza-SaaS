# infrastructure/terraform/gke.tf
resource "google_container_cluster" "primary" {
  name               = var.cluster_name
  location           = var.zone
  initial_node_count = var.cluster_node_count

  node_config {
    machine_type = "e2-medium"
    oauth_scopes = ["https://www.googleapis.com/auth/devstorage.read_only", "https://www.googleapis.com/auth/logging.write"]
  }
}

resource "google_container_node_pool" "default_pool" {
  name       = "default-pool"
  cluster    = google_container_cluster.primary.name
  location   = var.zone
  node_count = var.cluster_node_count

  node_config {
    machine_type = "e2-medium"
  }
}

