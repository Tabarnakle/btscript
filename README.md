# btscript

Internal CLI tool to optimize the account provisioning process for Docker Hub.

## Prerequisites

This tool uses calls from bt and the BillForward API as a source of data. Make sure you check all the requirements before using.

- **Docker**: Docker Desktop must be running and configured for use through your terminal
- **bt**: make sure you have pulled the bt image from the Docker support repo, or have access to it.
- **BillForward API token**: Configure your API token as an environment variable, either in a .env file or in your terminal profile.
- **Nodejs**: runtime for Javascript, the tool is written in this language.

## Setup

Make sure to run `node --version` before trying this, you  might already have node installed.

1. Install nvm
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
```
2. Install node
```
nvm install --lts
```
3. Clone the repo
```
git clone git@github.com:Tabarnakle/btscript.git && cd btscript
```
4. Install globally with npm
```
npm install -g
```
## Syntax
```
btscript orgName -o <owner> -d <yyyy-mm-dd> -s <amount>
```
This tool accepts one obligatory argument (orgName) and up to 3 different options

-o, --owner <owner>', 'Docker ID for the owner'
-d, --date <yyyy-mm-dd>', 'Contract start date'
-s, --seats <amount>', 'Amount of seats to provision'
