const axios = require('axios')

const apiCalls = {
    // query BF api to obtain latest active sub id 
    getSubId: async function (bfId, BF_TOKEN) {
        try {
            const bfUrl = `https://app.billforward.net:443/v1/subscriptions/account/${bfId}?records=20`
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
}

module.exports = apiCalls