// const passport = require('passport')
// const { BearerStrategy } = require('passport-azure-ad');


// const options = {
//     identityMetadata: `https://login.microsoftonline.com/18f871cf-4992-4b0a-83b9-20c2b9043d00/.well-known/openid-configuration`,
//     clientID: 'ec682dd0-bb6e-463e-a8f7-082d1fc95803',
//     validateIssuer: true,
//     issuer: `https://sts.windows.net/18f871cf-4992-4b0a-83b9-20c2b9043d00/`,
//     loggingLevel: 'info',
//     passReqToCallback: false
// };

// const bearerStrategy = new BearerStrategy(options, (token, done) => {
//     done(null, token);
// });

// passport.use(bearerStrategy);

// module.exports = passport;