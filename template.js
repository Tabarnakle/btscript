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
	console.log(`'${orgName}' org exists`);

	// check if owner exists
	if (isOwner(query.owners)) {
		console.log(`'${query.orgOwner}' is part of the owners team`);
	} else {
		console.log(`'${query.orgOwner}' is not part of the owners team`);
	}

	// check for active subscriptions

	// check ticket type



/* 	if (btResponse[1].length == 0) {
		currentSub = []
	} else {
		const subData = btResponse[1][0]
		currentSub = subData.name
		currentSeats = subData.pricing_components[0].value
		const subId = await getSubId(bfId, BF_TOKEN)
		subUrl = 'https://app.billforward.net/#/subscriptions/view/' + subId
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
	console.log(`bt billing plans change --seats ${provisionSeats} --cycle annual --offline-payment --start-date ${contractStartDate}T00:00:01Z --commit ${orgName} business && bt subscription list ${orgName}`); */
}

module.exports = makeTemplate