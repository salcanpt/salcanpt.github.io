const CLIENT_ID = '476074850902-2e2dqah57jr9c4jiqs21ufdas2uj4d4e.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAIvYn1fzrCAxsuEDEgVYO-3mnpruZd2Cg';
const DISCOVERY_DOCs = ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest', 'https://identitytoolkit.googleapis.com/$discovery/rest?version=v1', 'https://admin.googleapis.com/$discovery/rest?version=directory_v1'];
const SCOPES = 'openid https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/admin.directory.user.readonly';




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
let accessToken = null;

function handleAuthClick() {
  tokenClient.callback = async (resp) => {

    if (resp.error !== undefined) {
      throw (resp);
    }
    document.getElementById('signout_button').style.visibility = 'visible';
    document.getElementById('authorize_button').innerText = 'Refresh';
    accessToken = resp.access_token;
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

        document.getElementById("updateallgmail_button").removeAttribute("disabled");
        setTimeout(async () => {

          try {
            let response = await gapi.client.directory.users.list({ 'customer': 'C03lw6py0' });
            console.log(response);
            userList = response.result.users;
            for (let i = 0; i < userList.length; i++) {
              if (emailAddress && userList && userList.length > 0 && emailAddress == userList[i].primaryEmail) {
                userListMe = userList[i];
              }
            }
            getMySignature({ primaryEmail: emailAddress });

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

function handlePreviewAllClick() {
  if (isAdmin) {
    if (!exampleSelected) exampleSelected = "example1";
    document.getElementById('rightPanelContent').innerText = '';
    for (let i = 0; i < userList.length; i++) {
      try {

        let x = document.getElementById(exampleSelected).innerHTML;
        x = convertFromTemplate(x,userListMe);
        
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
    document.getElementById("updateallgmail_button").removeAttribute("disabled");
  }
}

async function handleUpdateAllClick() {

  document.getElementById("updateallgmail_button").setAttribute("disabled","true");
  if (isAdmin) {
    if (!exampleSelected) exampleSelected = "example1";
    document.getElementById('rightPanelContent').innerText = '';
    for (let i = 0; i < userList.length; i++) {
      try {


        let x = document.getElementById(exampleSelected).innerHTML;
        x = convertFromTemplate(x,userList[i]);
        
        let x2 = document.createElement("div");
        x2.style.margin = "2px";
        x2.style.padding = "2px";
        x2.style.backgroundColor = "white";
        x2.innerHTML = x;
        document.getElementById('rightPanelContent').appendChild(x2);

        if (userList[i].primaryEmail && (userList[i].primaryEmail.startsWith("craig"))) {
          console.log("Update:"+userList[i].primaryEmail);
          if (accessToken) {
            try {
              const response = await fetch('https://3ufadbfj3b.execute-api.ap-southeast-2.amazonaws.com/default/gmail_signature', {
                method: 'POST',
                body: JSON.stringify({
                  'accessToken': accessToken,
                  'emailAddress': userList[i].primaryEmail,
                  'sendAsEmail': userList[i].primaryEmail,
                  "signature": x
                }), // string or object
                headers: {
                  'Content-Type': 'application/json',
                  "x-api-key": "yVxNbw7K3y4IS94BDKtMh9hAUiL0Y5oP6NdQEBs2"
                }
              });
              const myJson = await response.json();
              console.log(myJson);
            }
            catch (e) {
              console.log(e);
            }
          }
        }




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
let exampleSelected = null;


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
    inHtml.innerText = convertToTemplate(signature,userListMe);
  }
  console.log(allAlias);
}

function convertFromTemplate(signature, userListItem)
{
  let phone=null;
  if(userListItem.phones && userListItem.phones.length>0)
  {
    for(let j=0;phone=null && j<userListItem.phones.length;j++)if(userListItem.phones[j].type=="work")phone=value;
    for(let j=0;phone=null && j<userListItem.phones.length;j++)phone=value;
  }
  if(phone==null) phone=userListItem.recoveryPhone || "n/a";
  if(phone.startsWith("04"))phone="+61"+phone.substring(2);
  if(phone.startsWith("61"))phone="+61"+phone.substring(2);
  if(phone.startsWith("+61 "))phone="+61"+phone.substring(4);

  signature = signature.replaceAll("Firstname", userListItem.name.givenName);
  signature = signature.replaceAll("Lastname", userListItem.name.familyName);
  signature = signature.replaceAll("email@salcanpt.com", userListItem.primaryEmail);
  signature = signature.replaceAll("+61400000000", phone);
  return signature;
}


function convertToTemplate(signature, userListItem)
{

  let phone=null;
  if(userListItem.phones && userListItem.phones.length>0)
  {
    for(let j=0;phone=null && j<userListItem.phones.length;j++)if(userListItem.phones[j].type=="work")phone=value;
    for(let j=0;phone=null && j<userListItem.phones.length;j++)phone=value;
  }
  if(phone==null) phone=userListItem.recoveryPhone || "n/a";
  if(phone.startsWith("04"))phone="+61"+phone.substring(2);
  if(phone.startsWith("61"))phone="+61"+phone.substring(2);
  if(phone.startsWith("+61 "))phone="+61"+phone.substring(4);

  signature = signature.replaceAll( userListMe.name.givenName,"Firstname");
  signature = signature.replaceAll(userListMe.name.familyName,"Lastname",);
  signature = signature.replaceAll(userListMe.primaryEmail,"email@salcanpt.com",);
  signature = signature.replaceAll(phone,"+61400000000");
  return signature;
}

async function handleSaveUpdateClick() {

  console.log("signature:" + sendAsEmail);
  if (sendAsEmail) {
    if (accessToken) {
      try {
        const response = await fetch('https://3ufadbfj3b.execute-api.ap-southeast-2.amazonaws.com/default/gmail_signature', {
          method: 'POST',
          body: JSON.stringify({
            'accessToken': accessToken,
            'emailAddress': emailAddress,
            'sendAsEmail': sendAsEmail,
            "signature": document.getElementById('htmlContent').innerText
          }), // string or object
          headers: {
            'Content-Type': 'application/json',
            "x-api-key": "yVxNbw7K3y4IS94BDKtMh9hAUiL0Y5oP6NdQEBs2"
          }
        });
        const myJson = await response.json();
        console.log(myJson);
      }
      catch (e) {
        console.log(e);
      }
    }
  }
}
async function handleExampleClick(id) {
  if (userListMe) {
    exampleSelected = id;
    let x = document.getElementById(exampleSelected).innerHTML;
    x = convertFromTemplate(x,userListMe);
    document.getElementById('htmlContent').innerText = x;
    document.getElementById('htmlContentOut').innerHTML = x;
  }
}

async function handleSaveTemplateClick()
{
  var count=parseInt(localStorage.getItem("templateCount") || "0" );
  localStorage.setItem(count,""+(count+1));
  localStorage.setItem("template-"+(count+4),btoa(document.getElementById('htmlContent').innerText));
}

async function loadCachedTemplates()
{
  var count=parseInt(localStorage.getItem("templateCount") || "0" );
  if(count>0)
  {
    for(let i=0;i<count;i++)
    {
      let b64html=localStorage.getItem("template-"+(i+4));
      let b1=document.createElement("button");
      b1.id="example"+(i+4)+"Button";
      b1.onclick=handleExampleClick('example'+(i+4));
      b1.innerText="Use Example "+(i+4);
      let d1=document.createElement("div");
      d1.id="example"+(i+4);
      d1.innerHTML=atob(b64html);
      document.getElementById('examples').appendChild(b1);
      document.getElementById('examples').appendChild(d1);  
      document.getElementById('examples').appendChild(document.createElement("br"));   
      document.getElementById('examples').appendChild(document.createElement("br"));      
    }
  }
}


loadCachedTemplates();