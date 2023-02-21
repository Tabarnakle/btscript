async function makeTemplate(query) {
	function isOwner(ownersArray) {
		let isOwner = false
		ownersArray.forEach(owner => {
			if (owner.username == query.orgOwner) {
				isOwner = true
			}
		});
		return isOwner
	}

	// check if org exists (not really checking anything)
	console.log(' ');
	console.log(`'${query.orgName}' org exists`);

	// check if owner exists
	if (isOwner(query.owners)) {
		console.log(`'${query.orgOwner}' is part of the owners team`);
	} else {
		console.log(`'${query.orgOwner}' is not part of the owners team`);
	}

	// check for active subscriptions
	if (query.currentSub == undefined || query.currentSub.length == 0) {
		console.log('no active subscriptions');
	} else {
		console.log(`current ${query.currentSub} (${query.currentSeats} seats) subscription: ${query.activeSubUrl}`);
	}
	// check ticket type
	switch (query.ticketType) {
		case 'upsell':
			console.log(`Added ${query.seatsAmount} seats for a total of ${query.currentSeats + query.seatsAmount}`);
			console.log('');
			console.log(`>>> Add ${query.seatsAmount} seats to ${query.orgName}`);
			console.log(`bt billing plans add-seats ${query.orgName} ${query.seatsAmount}`);
			break;
		case 'renewal':
			console.log(`end of current period: ${query.currentPeriodEnd}`);
			if (query.seatsAmount - query.currentSeats == 0) {
				console.log('no changes made');
			} else if (query.seatsAmount - query.currentSeats > 0) {
				console.log(`we will add ${query.seatsAmount - query.currentSeats} seats on renewal`);
				console.log('');
				console.log(`>>> Schedule ${query.seatsAmount - query.currentSeats} seat increase on renewal`);
				console.log(`Not yet available through bt`);
				console.log(`>>> Add ${query.seatsAmount - query.currentSeats} seats to ${query.orgName}`);
				console.log(`bt billing plans add-seats ${query.orgName} ${query.seatsAmount - query.currentSeats}`);
			} else {
				console.log(`we will remove ${Math.abs(query.seatsAmount - query.currentSeats)} seats on renewal`);
				console.log('');
				console.log(`>>> Schedule ${Math.abs(query.seatsAmount - query.currentSeats)} seat decrease on renewal`);
				console.log(`bt billing plans remove-seats ${query.orgName} ${Math.abs(query.seatsAmount - query.currentSeats)}`);
			}
			break;
		default: // new business is default
			console.log(`provisioned Docker Business - Annual (${query.seatsAmount} seats) subscription: `);
			console.log('');
			console.log('>>> add provided owner to owners team');
			console.log(`bt account add-user-to-group ${query.orgName} owners ${query.orgOwner}`);
			console.log('>>> create business subscription');
			console.log(`bt billing plans change --seats ${query.seatsAmount} --cycle annual --offline-payment --start-date ${query.contractStartDate}T00:00:01Z --commit ${query.orgName} business && bt subscription list ${query.orgName}`);
			break;
	}
	console.log('');
}

module.exports = makeTemplate