# infrastructure/terraform/vm.tf

resource "google_compute_address" "app_vm_address" {
  name = "chirpcircle-app-vm-address"
}

resource "google_compute_instance" "app_vm" {
  name         = "chirpcircle-app-vm"
  machine_type = var.vm_machine_type
  zone         = var.zone
  labels = {
    environment = var.environment
    app         = "chirpcircle"
  }
  tags = ["chirpcircle", "web-server"]

  boot_disk {
    initialize_params {
      image = "ubuntu-1804-bionic-v20220131" # Stable OS image
      size  = 25                             # 25 GB disk size
      type  = "pd-ssd"                       # SSD for better performance
    }
  }

  network_interface {
    # Using default VPC
    network       = "default"
    # Attach a static external IP for stable access
    access_config {
      nat_ip = google_compute_address.app_vm_address.address
    }
  }

  # Startup script for installing Docker
  metadata_startup_script = <<-EOT
    #!/bin/bash
    apt-get update -y
    apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io
    systemctl enable docker
    systemctl start docker
    # Additional commands:
    sudo docker pull alperond/chirpcircle-backend:latest
    sudo docker run -d -p 80:3000 alperond/chirpcircle-backend:latest
  EOT

  # Service account for GCP APIs access from the VM
  service_account {
     email  = var.service_account_email
     scopes = ["https://www.googleapis.com/auth/cloud-platform"]
   }
}

resource "google_compute_firewall" "app_vm_firewall" {
  name    = "chirpcircle-app-vm-firewall"
  network = "default"

  allow {
    protocol = "tcp"
    ports    = ["80", "443"]
  }

  # SSH access, add port 22:
  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  # Restrict SSH in a prod environment
  source_ranges = ["0.0.0.0/0"]
}

