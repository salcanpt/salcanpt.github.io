const CLIENT_ID = '476074850902-2e2dqah57jr9c4jiqs21ufdas2uj4d4e.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAIvYn1fzrCAxsuEDEgVYO-3mnpruZd2Cg';
const DISCOVERY_DOCs = ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest', 'https://identitytoolkit.googleapis.com/$discovery/rest?version=v1', 'https://admin.googleapis.com/$discovery/rest?version=directory_v1'];
const SCOPES = 'openid https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.settings.basic https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/admin.directory.user.readonly';




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
document.getElementById('signedInPanel').style.display = 'none';



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

let emailAddress = null;
let isAdmin = null;
let userList = null;
let userListMe = null;

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
      getMySignature({ primaryEmail: emailAddress });
      if (isAdmin) {
        
        document.getElementById("updateallgmail_button").removeAttribute("disabled");
        setTimeout(async () => {  

          try {
            let response = await gapi.client.directory.users.list({ 'customer': 'C03lw6py0' });
            console.log(response);
            userList = response.result.users;
            for (let i = 0; i < userList.length; i++) {
              if(emailAddress && userList && userList.length>0 && emailAddress==userList[i].primaryEmail){
                userListMe=userList[i];
              }
            }
            
          } catch (err) {
            console.log(err);
            return;
          }

        }, 100);
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

function handleUpdateAllClick() {
  if (isAdmin) {
    if(!exampleSelected)exampleSelected="example1";
    document.getElementById('rightPanelContent').innerText = '';
    for (let i = 0; i < userList.length; i++) {
      try {
        let x = document.getElementById(exampleSelected).innerHTML;
        x = x.replaceAll("Firstname", userList[i].name.givenName);
        x = x.replaceAll("Lastname", userList[i].name.familyName);
        x = x.replaceAll("email@salcanpt.com", userList[i].primaryEmail);
        x = x.replaceAll("+61400000000", userList[i].recoveryPhone);
        let x2 = document.createElement("div");
        x2.style.margin = "2px";
        x2.style.padding = "2px";
        x2.style.backgroundColor = "white";
        x2.innerHTML = x;
        document.getElementById('rightPanelContent').appendChild(x2);
      }
      catch (e) {
        console.log("-------------");
        console.log(e);
        console.log("-------------");
      }
    }
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
    document.getElementById('signedInPanel').style.display = 'none';
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
let exampleSelected=null;


/* MAIN THING */
async function getMySignature({ primaryEmail, name, phones }) {

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
    document.getElementById('signedInPanel').style.display = '';
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
        'userId': emailAddress,
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
  if(userListMe)
  {
    exampleSelected=id;
    let x = document.getElementById(id).innerHTML;
    x = x.replaceAll("Firstname", userListMe.name.givenName);
    x = x.replaceAll("Lastname", userListMe.name.familyName);
    x = x.replaceAll("email@salcanpt.com", userListMe.primaryEmail);
    x = x.replaceAll("+61400000000", userListMe.recoveryPhone);
    document.getElementById('htmlContent').innerText = x;
    document.getElementById('htmlContentOut').innerHTML = x;
  }
}