const CLIENT_ID = '476074850902-2e2dqah57jr9c4jiqs21ufdas2uj4d4e.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAIvYn1fzrCAxsuEDEgVYO-3mnpruZd2Cg';
const DISCOVERY_DOCs = ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest', 'https://identitytoolkit.googleapis.com/$discovery/rest?version=v1', 'https://admin.googleapis.com/$discovery/rest?version=directory_v1'];
const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.settings.basic https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/admin.directory.user.readonly';

const debugUserList=[{
    "id": "110843103607480050516",
    "etag": "\"_ZVRqe-BUDYcYeOIPo-gm6Eh1QaGne4ACjHHI6qsr6A/fBy2TUCzCY4_vdPMnJng2-nwjDI\"",
    "primaryEmail": "craiggormantest@salcanpt.com",
    "name": { "givenName": "Craig", "familyName": "Gorman", "fullName": "Craig Gorman" },
    "isAdmin": false,
    "isDelegatedAdmin": false,                
    "emails": [
      {
        "address": "craiggormantest@salcanpt.com",
        "primary": true
      },
      {
        "address": "craiggormantest@salcanpt.com.au"
      },
      {
        "address": "craiggormantest@salcanpt.com.test-google-a.com"
      }
    ],
    "agreedToTerms": true,
    "suspended": false,
    "archived": false,
    "customerId": "C03lw6py0",
    "recoveryPhone": "+61447680379",
    "phones": [
      {
        "value": "+61 447680379",
        "type": "home"
      }
    ]
  }, {
    "kind": "admin#directory#user",
    "id": "112810684662894356592",
    "etag": "\"_ZVRqe-BUDYcYeOIPo-gm6Eh1QaGne4ACjHHI6qsr6A/raH4MjpXwJNIetZexmv3eTRoQKs\"",
    "primaryEmail": "craig@salcanpt.com",
    "name": {
      "givenName": "Craig",
      "familyName": "Gorman",
      "fullName": "Craig Gorman"
    },
    "isAdmin": true,
    "isDelegatedAdmin": false,
    "lastLoginTime": "2022-08-15T10:23:32.000Z",
    "creationTime": "2014-11-09T22:40:26.000Z",
    "agreedToTerms": true,
    "suspended": false,
    "archived": false,
    "changePasswordAtNextLogin": false,
    "ipWhitelisted": false, 
    "emails": [
      {
        "address": "craig@salcanpt.com",
        "primary": true
      },
      {
        "address": "craig@salcanpt.com.au"
      },
      {
        "address": "craig@salcanpt.com.test-google-a.com"
      }
    ],
    "phones": [
      {
        "value": "+61 447680379",
        "type": "home"
      }
    ],
    "customerId": "C03lw6py0",
    "orgUnitPath": "/",
    "isMailboxSetup": true,
    "isEnrolledIn2Sv": true,
    "isEnforcedIn2Sv": true,
    "includeInGlobalAddressList": true,
    "thumbnailPhotoUrl": "https://www.google.com/s2/photos/private/AIbEiAIAAABECPDQ86q7uqzksQEiC3ZjYXJkX3Bob3RvKig4NmY4ZDQwYTJlMzcwZDllNmI2ZWNhZDY3MDA5NGQxNzA0NDY4OWEzMAExYSdTBtU9vx2W2cVGWqQjC8LtgA",
    "thumbnailPhotoEtag": "\"_ZVRqe-BUDYcYeOIPo-gm6Eh1QaGne4ACjHHI6qsr6A/TZ06FWoqGXXu30ZAW9Or7Og9MzM\"",
    "recoveryEmail": "craig@gormantec.com",
    "recoveryPhone": "+61447680379"
  }];

let tokenClient;
let gapiInited = false;
let gisInited = false;


document.getElementById('authorize_button').style.visibility = 'hidden';
document.getElementById('signout_button').style.visibility = 'hidden';
document.getElementById('saveupdate_button').style.visibility = 'hidden';
document.getElementById('update_button').style.visibility = 'hidden';
document.getElementById('htmlContent').style.display = 'none';
document.getElementById('htmlContentOut').style.display = 'none';
document.getElementById('examples').style.display = 'none';

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  gapi.load('client', intializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function intializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: DISCOVERY_DOCs,
  });
  gapiInited = true;
  maybeEnableButtons();
}



/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined later
  });


  gisInited = true;
  maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById('authorize_button').style.visibility = 'visible';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw (resp);
    }
    document.getElementById('signout_button').style.visibility = 'visible';
    document.getElementById('authorize_button').innerText = 'Refresh';


    console.log(resp);
    console.log("gapi.client");
    console.log(gapi.client);
    //curl -X GET "https://www.googleapis.com/oauth2/v1/userinfo?alt=json" -H"Authorization: Bearer accessTokenHere"
    //let r=(await gapi.client.oauth2.userinfo.get()).result;
    //console.log(r);
    let emailAddress = null;
    let isAdmin = null;
    let userList = null;
    try {
      let response = await gapi.client.gmail.users.getProfile({
        'userId': 'me'
      });
      console.log(response);
      emailAddress = response.result.emailAddress;
    } catch (err) {
      console.log(err);
      return;
    }
    if (emailAddress) {
      try {
        let response = await gapi.client.directory.users.get({ 'userKey': emailAddress });
        console.log(response);
        isAdmin = response.result.isAdmin;

      } catch (err) {
        console.log(err);
        return;
      }
      if (isAdmin) {
        try {
          let response = await gapi.client.directory.users.list({ 'customer': 'C03lw6py0' });
          console.log(response);
          userList = response.result.users;
          /* HACK TO FOR TESTING!!!!!!!! */
          userList = debugUserList;
        } catch (err) {
          console.log(err);
          return;
        }
        for(let i=0;i<userList.length;i++)
        {
            try{
              if(emailAddress==userList[i].primaryEmail)
              {
                await listAlias(userList[i]);
              }
            }
            catch(e)
            {
                console.log("-------------");
                console.log(e);
                console.log("-------------");
            }
            document.getElementById('rightPanel').innerText = '';
            
        }
        
      }
    }
  };

  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({ prompt: '' });
  }



}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
    document.getElementById('content').innerText = '';
    document.getElementById('authorize_button').innerText = 'Authorize';
    document.getElementById('signout_button').style.visibility = 'hidden';
    document.getElementById('saveupdate_button').style.visibility = 'hidden';
    document.getElementById('update_button').style.visibility = 'hidden';
    document.getElementById('htmlContent').style.display = 'none';
    document.getElementById('htmlContentOut').style.display = 'none';
    document.getElementById('examples').style.display = 'none';
  }
}
function handleUpdateClick() {
  document.getElementById('htmlContent').innerText;
  let s = document.createElement("div");
  s.innerHTML = document.getElementById('htmlContent').innerText;
  let out = document.getElementById('htmlContentOut');
  out.innerText = "";
  out.appendChild(s);
}

let sendAsEmail = null;
let signature = null;


/* MAIN THING */
async function listAlias({primaryEmail,name,phones}) {

  let response;
  try {
    response = await gapi.client.gmail.users.settings.sendAs.list({
      'userId': primaryEmail
    });
  } catch (err) {
    console.log(err);   
    return;
  }
  const allAlias = response.result.sendAs;
  if (!allAlias || allAlias.length == 0) {
    document.getElementById('content').innerText = 'No labels found.';
    return;
  }
  sendAsEmail = null;
  signature = null;
  for (let i = 0; i < allAlias.length; i++)if (allAlias[i].isPrimary == true) { sendAsEmail = allAlias[i].sendAsEmail; signature = allAlias[i].signature; }
  if (signature) {
    let out = document.getElementById('htmlContentOut');
    out.innerText = "";
    let s = document.createElement("div");
    s.innerHTML = signature;
    out.appendChild(s);
    document.getElementById('saveupdate_button').style.visibility = 'visible';
    document.getElementById('update_button').style.visibility = 'visible';
    document.getElementById('htmlContent').style.display = '';
    document.getElementById('htmlContentOut').style.display = '';
    document.getElementById('examples').style.display = '';
    let inHtml = document.getElementById('htmlContent');
    inHtml.innerText = signature;
  }
  console.log(allAlias);
}

async function handleSaveUpdateClick() {

  console.log("signature:" + sendAsEmail);
  if (sendAsEmail) {
    console.log("signature!!!!");
    try {
      response = await gapi.client.gmail.users.settings.sendAs.patch({
        'userId': 'craig@salcanpt.com',
        'sendAsEmail': sendAsEmail,
        "signature": document.getElementById('htmlContent').innerText
      });
      console.log(response);
    } catch (err) {

      console.log(err);
      document.getElementById('content').innerText = err.message;
      return;
    }
  }

}
async function handleExampleClick(id) {
  let x = document.getElementById(id).innerHTML;
  x = x.replaceAll("Firstname", "Craig");
  x = x.replaceAll("Lastname", "Gorman");
  x = x.replaceAll("email@salcanpt.com", "craig@salcanpt.com");
  x = x.replaceAll("+61400000000", "+61447680379");
  document.getElementById('htmlContent').innerText = x;
  document.getElementById('htmlContentOut').innerHTML = x;
}