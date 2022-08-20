require('dotenv').config()

const { WA_CLOUD_ENDPOINT, TWITTER_ENDPOINT, FACEBOOK_ENDPOINT, INSTAGRAM_ENDPOINT } = process.env

module.exports = [
    {
        name: 'WA_CLOUD',
        endpoint: WA_CLOUD_ENDPOINT
    },
    {
        name: 'TWITTER',
        endpoint: TWITTER_ENDPOINT
    },
    {
        name: 'FACEBOOK',
        endpoint: FACEBOOK_ENDPOINT
    },
    {
        name: 'INSTAGRAM',
        endpoint: INSTAGRAM_ENDPOINT
    },
]