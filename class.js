const util = require('util');
const exec = util.promisify(require('child_process').exec);
const axios = require('axios')


class Query {
    constructor(ticketType, orgName, orgOwner, contractStartDate, seatsAmount) {
        this.ticketType = ticketType
        this.orgName = orgName[0]
        this.orgOwner = orgOwner
        this.contractStartDate = contractStartDate
        this.seatsAmount = parseInt(seatsAmount)
    }
    // fields
    btCommand = 'docker run --rm -e BT_DOCKER_AUTH_TOKEN -e BT_DOCKER_ENVIRONMENT docker/bt:latest'
    BF_TOKEN = process.env.BILLFORWARD_TOKEN
    owners
    currentSub
    currentSeats
    currentPeriodEnd
    bfId = undefined
    activeSubUrl


    // methods
    btAccount = async () => {
        try {
            const { stdout, stderr } = await exec(`${this.btCommand} account lookup ${this.orgName} | sed '1, 5d'`);
            if (stdout) {
                const result = JSON.parse(stdout)
                this.owners = result.owners
                return result;
            }
        } catch (e) {
            console.error(e);
        }
    }
    getBfAccId = async () => {
        try {
            const { stdout, stderr } = await exec(`${this.btCommand} account lookup ${this.orgName} | grep -o -P '.{0}ACC.{0,33}'`);
            this.bfId = stdout
            console.log('bfId: ', this.bfId);
            return stdout;
        } catch (e) {
            console.error(e);
        }
    }
    btSubscription = async () => {
        try {
            const { stdout, stderr } = await exec(`${this.btCommand} subscription list ${this.orgName}`);
            if (stdout.length > 3) {
                const result = JSON.parse(stdout);
                this.currentSub = result[0].name
                this.currentSeats = result[0].pricing_components[0].value
                this.currentPeriodEnd = result[0].current_period_end.slice(0,10)
                return result
            }
        } catch (e) {
            console.error(e);
        }
    }
    bfApiCall = async () => {
        try {
            const bfUrl = `https://app.billforward.net:443/v1/subscriptions/account/${this.bfId}?records=20`
            const response = await axios.get(bfUrl, {
                headers: { 'Authorization': `Bearer ${this.BF_TOKEN}` }
            })
            return response
        } catch (error) {
            console.log(error);
        }
    }
    // this function depends on the other calls resolving first
    getActiveSubId = async () => {
        try {
            const response = await this.bfApiCall()
            const activeSub = await response.data.results.filter(obj => {
                return obj.active == true
            })
            if (activeSub.length > 0) {
                this.activeSubUrl = 'https://app.billforward.net/#/subscriptions/view/' + activeSub[0].id
            }
        } catch (error) {
            console.log(error);
        }
    }
}
module.exports = Query