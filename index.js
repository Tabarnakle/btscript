#!/usr/bin/env node

/* App should use a single object that encompases 
all the CLI input,
  - ticketType x
  - orgName x
  - orgOwner x
  - contractStartDate x
  - seatsAmount x

the methods for querying bt and BF API and the useful data received from them
  btAccount{
      owners array x
    }
  btSubscriptionList{
    name(currentSub),
    pricing_components[0].value (seat amount / currentSeats)
    current_period_end
  }
  getBfAccId{
    BillForward ID (ACC-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXX) x
  }
  getSubId
    active BF subscription ID
 */
const { program } = require('commander')
const { btAccount, btSubscription, getBfAccId } = require('./btCalls')
const { getSubId } = require('./apiCalls')
const Query = require('./class')

require('dotenv').config({
  path: __dirname + '/.env'
})

const BF_TOKEN = process.env.BILLFORWARD_TOKEN

// command line arguments
program
  .arguments('<org>')
  .option('-t, --type <ticketType>', 'new, upsell or renewal')
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
const mainQuery = new Query(program.opts().type, program.args, program.opts().owner, program.opts().date, program.opts().seats)


Promise.all([
  mainQuery.btAccount(),
  mainQuery.getBfAccId(),
  mainQuery.btSubscription()])
  .then(() => mainQuery.getActiveSubId())
  .then(() => console.log('mainQuery: ', mainQuery))

