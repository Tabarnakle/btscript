#!/usr/bin/env node

const { program } = require('commander')
const Query = require('./class')
const makeTemplate = require('./template')

require('dotenv').config({
  path: __dirname + '/.env'
})

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

// run all calls
Promise.all([
  mainQuery.btAccount(),
  mainQuery.getBfAccId(),
  mainQuery.btSubscription()])
  .then(() => mainQuery.getActiveSubId())
  .then(() => console.log('mainQuery: ', mainQuery))
  .then(() => makeTemplate(mainQuery))



