// const { ConfidentialClientApplication } = require("@azure/msal-node");

// const msalConfig = {
//   auth: {
//     clientId: "ec682dd0-bb6e-463e-a8f7-082d1fc95803",
//     authority:
//       "https://login.microsoftonline.com/18f871cf-4992-4b0a-83b9-20c2b9043d00",
//     clientSecret: "e20fe19b-4828-4076-aaa1-291f5f460753",
//   },
// };

// const tokenRequest = {
//   scopes: ["https://graph.microsoft.com/.default"],
// };

// const cca = new ConfidentialClientApplication(msalConfig);

// const getToken = async () => {
//   const clientCredentialRequest = {
//     scopes: ["https://graph.microsoft.com/.default"],
//   };

//   try {
//     const response = await cca.acquireTokenByClientCredential(
//       clientCredentialRequest
//     );
//     return response.accessToken;
//   } catch (error) {
//     console.error("Error acquiring token:", error);
//     throw new Error("Error acquiring token");
//   }
// };

// module.exports = getToken;
