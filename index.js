#!/usr/bin/env node
const { program } = require('commander')
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const axios = require('axios')

require('dotenv').config({ 
  path : __dirname + '/.env'
})
console.log(process.env.BILLFORWARD_TOKEN)

const BF_TOKEN = process.env.BILLFORWARD_TOKEN

// command line arguments
program
  .arguments('<org>')
  .option('-o, --owner <owner>', 'Docker ID for the owner')
  .option('-d, --date <yyyy-mm-dd>', 'Contract start date')
  .option('-s, --seats <amount>', 'Amount of seats to provision')
  .action(function (org) {
    console.log('org: %s owner: %s CSD: %s seats: %s', org, program.opts().owner, program.opts().date, program.opts().seats)
  })

if (process.argv.length < 3) {
  program.help()
}

program.parse(process.argv)


// User Input
const orgName = program.args
const ownerName = program.opts().owner
const contractStartDate = program.opts().date
const provisionSeats = program.opts().seats

// bt base command
const btCommand = 'docker run --rm -e BT_DOCKER_AUTH_TOKEN -e BT_DOCKER_ENVIRONMENT docker/bt:latest'

// bt account lookup to get json data
async function btAccount() {
  try {
    const { stdout, stderr } = await exec(`${btCommand} account lookup ${orgName} | sed '1,5d' | jq '.'`);
    return JSON.parse(stdout);
  } catch (e) {
    console.error(e);
  }
}

async function btSubscription() {
  try {
    const { stdout, stderr } = await exec(`${btCommand} subscription list ${orgName} | jq '.'`);
    return JSON.parse(stdout);
  } catch (e) {
    console.error(e);
  }
}

// check if owner given in command exists in array of owners provided by bt
function isOwner(ownersArray) {
  let isOwner = false
  ownersArray.forEach(owner => {
    if (owner.username == ownerName) {
      isOwner = true
    }
  });
  return isOwner
}

// bt account lookup to get BF account id
async function getBfAccId() {
  try {
    const { stdout, stderr } = await exec(`${btCommand} account lookup ${orgName} | grep -o -P '.{0}ACC.{0,33}'`);
    return stdout;
  } catch (e) {
    console.error(e);
  }
}

// query BF api to obtain latest sub id
async function getSubId() {
  const bfId = await getBfAccId()
  const bfUrl = 'https://app.billforward.net:443/v1/subscriptions/account/' + bfId
  try {
    const response = await axios.get(bfUrl, {
      headers: { 'Authorization': `Bearer ${BF_TOKEN}` }
    })
    const subId = response.data.results[0].id;
    return subId
  } catch (error) {
    console.log(error);
  }
}

async function makeTemplate() {
  const btResponse = await Promise.all([btAccount(), btSubscription()])
  const currentSub = btResponse[1][0].name
  const owners = btResponse[0].owners
  const subData = btResponse[1][0]
  const currentSeats = subData.pricing_components[0].value
  const subId = await getSubId()
  const subUrl = 'https://app.billforward.net/#/subscriptions/view/' + subId
  console.log(' ');
  console.log(`'${orgName}' org exists`);
  if (isOwner(owners)) {
    console.log(`'${ownerName}' is part of the owners team`);
  } else {
    console.log(`'${ownerName}' is not part of the owners team`);
  }
  console.log(`canceled ${currentSub} (${currentSeats} seats) subscription: ${subUrl}`);
  console.log(`provisioned Docker Business - Annual (${provisionSeats} seats) subscription: `);
  console.log(' ');
  console.log('# add provided owner to owners team');
  console.log(`bt account add-user-to-group ${orgName} owners ${ownerName}`);
  console.log('# create business subscription');
  console.log(`bt billing plans change --seats ${provisionSeats} --cycle annual --offline-payment --start-date ${contractStartDate}T00:00:01Z --commit ${orgName} business && bt subscription list ${orgName}`);
}

makeTemplate()