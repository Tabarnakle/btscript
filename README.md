# btscript

Internal CLI tool to optimize the account provisioning process for Docker Hub.

## Prerequisites

This tool uses calls from bt and the BillForward API as a source of data. Make sure you check all the requirements before using.

- Docker: Docker Desktop must be running and configured for use through your terminal
- bt: make sure you have pulled the bt image from the Docker support repo, or have access to it.
- BillForward API token: Configure your API token as an environment variable, either in a .env file or in your terminal profile.
- Nodejs: runtime for Javascript, the tool is written in this language.
