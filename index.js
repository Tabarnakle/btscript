#!/usr/bin/env node
const { program } = require('commander')
const { btAccount, btSubscription, getBfAccId } = require('./btCalls')
const { getSubId } = require('./apiCalls')

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

async function makeTemplate() {
  const btResponse = await Promise.all([btAccount(orgName), btSubscription(orgName)])
  const owners = btResponse[0].owners
  
  
  let currentSub
  let currentSeats
  let subUrl
  
  
  if (btResponse[1].length == 0) {
    currentSub = []
  } else {
    const subData = btResponse[1][0]
    currentSub = subData.name
    currentSeats = subData.pricing_components[0].value
    const bfId = await getBfAccId(orgName)
    const subId = await getSubId(bfId, BF_TOKEN)
    subUrl = 'https://app.billforward.net/#/subscriptions/view/' + subId
  }


  console.log(' ');
  console.log(`'${orgName}' org exists`);

  if (isOwner(owners)) {
    console.log(`'${ownerName}' is part of the owners team`);
  } else {
    console.log(`'${ownerName}' is not part of the owners team`);
  }

  if (currentSub.length == 0) {
    console.log('no active subscriptions');
  } else {
    console.log(`canceled ${currentSub} (${currentSeats} seats) subscription: ${subUrl}`);    
  }
  console.log(`provisioned Docker Business - Annual (${provisionSeats} seats) subscription: `);
  console.log(' ');
  console.log('# add provided owner to owners team');
  console.log(`bt account add-user-to-group ${orgName} owners ${ownerName}`);
  console.log('# create business subscription');
  console.log(`bt billing plans change --seats ${provisionSeats} --cycle annual --offline-payment --start-date ${contractStartDate}T00:00:01Z --commit ${orgName} business && bt subscription list ${orgName}`);
}

makeTemplate()