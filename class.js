const util = require('util');
const exec = util.promisify(require('child_process').exec);


class Query {
    constructor(ticketType, orgName, orgOwner, contractStartDate, seatsAmount) {
        this.ticketType = ticketType
        this.orgName = orgName
        this.orgOwner = orgOwner
        this.contractStartDate = contractStartDate
        this.seatsAmount = seatsAmount
    }
    // fields
    btCommand = 'docker run --rm -e BT_DOCKER_AUTH_TOKEN -e BT_DOCKER_ENVIRONMENT docker/bt:latest'
    BF_TOKEN = process.env.BILLFORWARD_TOKEN
    owners
    currentSub
    currentSeats
    currentPeriodEnd
    bfId


    // methods
    btAccount = async () => {
        try {
            const { stdout, stderr } = await exec(`${this.btCommand} account lookup ${this.orgName} | sed '1,5d' | jq '.'`);
            const result = JSON.parse(stdout);
            this.owners = result.owners
            return result;
        } catch (e) {
            console.error(e);
        }
    }
    getBfAccId = async function () {
        try {
            const { stdout, stderr } = await exec(`${this.btCommand} account lookup ${this.orgName} | grep -o -P '.{0}ACC.{0,33}'`);
            if (stdout) {
                this.bfId = stdout
            }
            return stdout;
        } catch (e) {
            console.error(e);
        }
    }
    btSubscription = async function () {
        try {
            const { stdout, stderr } = await exec(`${this.btCommand} subscription list ${this.orgName} | jq '.'`);
            const result = JSON.parse(stdout);
            return result
        } catch (e) {
            console.error(e);
        }
    }
    getActiveSubId = async function () {
        try {
            const bfUrl = `https://app.billforward.net:443/v1/subscriptions/account/${this.bfId}?records=20`
            const response = await axios.get(bfUrl, {
                headers: { 'Authorization': `Bearer ${this.BF_TOKEN}` }
            })
            const bfSubs = response.data.results
            const activeSub = bfSubs.filter(obj => {
                return obj.active == true
            })
            return activeSub[0].id
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = Query