# Piazza-SaaS

This repository contains a containerized Node.js backend and a React + Vite frontend. Below is an overview of essential development tasks, setup steps, and deployment practices.

## Development Tasks

- Build Docker images: `task build`
- Start services: `task up`
- Stop services: `task down`
- View logs: `task logs`
- Run backend tests: `task test-backend`
- Run frontend tests: `task test-frontend`
- Run linters: `task lint`

## Setting Up Development Environment

1. Install Devbox: `curl -fsSL https://get.jetpack.io/devbox | bash`  
2. Launch the Devbox shell: `devbox shell`  
3. Use the Task commands (e.g., `task build`, `task up`, etc.) to manage the application lifecycle.

## Project Architecture

The backend (Node.js) is built for containerization and the frontend (React + Vite) uses modern tooling and bundling. Continuous integration runs tests and builds automatically on key branches. Kubernetes and Docker images are used for deployment.

## Folder Structure

- backend/ – Node.js services  
- frontend/ – UI code with React  
- .github/workflows/ – CI pipelines

## Deployment

Merges to the main branch trigger automated Docker builds and image pushes. You can also run containers locally. Adjust the environment variables in `.env` to match your deployment needs.

## Contributing

- Fork this repository  
- Create a new branch for your changes  
- Submit a pull request once you are ready

## Further Notes

Set environment variables in `.env` or GitHub secrets. Modify Task definitions for additional custom tasks or extended workflows. Follow best practices for security and code readability.
