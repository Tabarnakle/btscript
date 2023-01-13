const util = require('util');
const exec = util.promisify(require('child_process').exec);

// bt base command
const btCommand = 'docker run --rm -e BT_DOCKER_AUTH_TOKEN -e BT_DOCKER_ENVIRONMENT docker/bt:latest'

const btCalls = {
    // bt account lookup to get json data
    btAccount: async function (orgName) {
        try {
            const { stdout, stderr } = await exec(`${btCommand} account lookup ${orgName} | sed '1,5d' | jq '.'`);
            return JSON.parse(stdout);
        } catch (e) {
            console.error(e);
        }
    },

    // bt account lookup to get BF account id
    getBfAccId: async function (orgName) {
        try {
            const { stdout, stderr } = await exec(`${btCommand} account lookup ${orgName} | grep -o -P '.{0}ACC.{0,33}'`);
            return stdout;
        } catch (e) {
            console.error(e);
        }
    },

    // bt subscription list to get json data
    btSubscription: async function (orgName) {
        try {
            const { stdout, stderr } = await exec(`${btCommand} subscription list ${orgName} | jq '.'`);
            return JSON.parse(stdout);
        } catch (e) {
            console.error(e);
        }
    }
}

module.exports = btCalls