# Docker Deployment Guide

This guide will help you set up the full development environment using Docker.

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) must be **installed** and **running**.
  - You should see the Docker whale icon in your system tray.
  - If Docker isn't running, the commands below won't work.

---

## Starting the Environment

Open a terminal in this `/deployment` folder and run the following command:

```bash
docker compose up -d --build
```
- `-d` runs the containers in the background ("detached" mode).
- `--build` ensures any changes to the Dockerfile or services are applied. 
This will spin up all necessary services (e.g., backend, database, etc.) for local development. 

## View Running Containers
You can view and manage the running containers in Docker Desktop:

Open Docker Desktop.

You’ll see a list of running containers grouped under your project name.

Click on any container to view its logs, status, and other details.

## Accessing Services
In Docker Desktop, you can:

Click on the "\<number\>:\<number\>" (port) next to a container to open its exposed port in your browser.

This makes it easy to view web UIs or APIs being served by your containers.

📸 Example interface: ![Docker Desktop showing ports](./img/ports.jpg)


## Stopping the Environment
To stop the running containers, you can use:

```bash
docker compose down
```
This will cleanly shut everything down.

## Clean Build (Optional)
If you're running into issues, try rebuilding everything from scratch:

```bash
docker compose down --volumes --remove-orphans
docker compose up -d --build
```
This removes volumes and unused containers before rebuilding.