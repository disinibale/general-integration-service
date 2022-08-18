require('dotenv').config()

const { WA_CLOUD_ENDPOINT, TWITTER_ENDPOINT, FACEBOOK_ENDPOINT, INSTAGRAM_ENDPOINT } = process.env

module.exports = {
    waCloud: WA_CLOUD_ENDPOINT,
    twitter: TWITTER_ENDPOINT,
    facebook: FACEBOOK_ENDPOINT,
    instagram: INSTAGRAM_ENDPOINT,
}