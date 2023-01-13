#!/usr/bin/env node
const { program } = require('commander')
const axios = require('axios')
const { btAccount, getBfAccId, btSubscription } = require('./btCalls')

require('dotenv').config({
  path: __dirname + '/.env'
})

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

// query BF api to obtain latest active sub id 
async function getSubId() {
  const bfId = await getBfAccId(orgName)
  const bfUrl = `https://app.billforward.net:443/v1/subscriptions/account/${bfId}?records=20`
  try {
    const response = await axios.get(bfUrl, {
      headers: { 'Authorization': `Bearer ${BF_TOKEN}` }
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

async function makeTemplate() {
  const btResponse = await Promise.all([btAccount(orgName), btSubscription(orgName)])
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