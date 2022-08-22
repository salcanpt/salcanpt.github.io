const fs = require('fs');
const { google } = require('googleapis');

const keys = {
  customer: process.env.GOOGLE_CUSTOMER,
  subject: process.env.GOOGLE_SUBJECT,
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replaceAll("\\n","\n")
};

function convertFromTemplate(signature, userListItem) {
  let phone = null;
  if (userListItem.phones && userListItem.phones.length > 0) {
    for (let j = 0; phone = null && j < userListItem.phones.length; j++)if (userListItem.phones[j].type == "work") phone = value;
    for (let j = 0; phone = null && j < userListItem.phones.length; j++)phone = value;
  }
  if (phone == null) phone = userListItem.recoveryPhone || "n/a";
  if (phone.startsWith("04")) phone = "+61" + phone.substring(2);
  if (phone.startsWith("61")) phone = "+61" + phone.substring(2);
  if (phone.startsWith("+61 ")) phone = "+61" + phone.substring(4);

  signature = signature.replaceAll("Firstname", userListItem.name.givenName);
  signature = signature.replaceAll("Lastname", userListItem.name.familyName);
  signature = signature.replaceAll("email@salcanpt.com", userListItem.primaryEmail);
  signature = signature.replaceAll("+61400000000", phone);
  if (userListItem.locations && userListItem.locations.length > 0 && userListItem.locations[0] && userListItem.locations[0].floorSection) {
    signature = signature.replaceAll("Floor Section", userListItem.locations[0].floorSection);
  }
  else {
    signature = signature.replaceAll("Floor Section", "");
  }
  if (userListItem.organizations && userListItem.organizations.length > 0 && userListItem.organizations[0] && userListItem.organizations[0].title) {
    signature = signature.replaceAll("Job Title", userListItem.organizations[0].title);
  }
  else {
    signature = signature.replaceAll("Job Title", "");
  }
  return signature;
}

async function getUserList() {
  try {
    const JWT = google.auth.JWT;
    const authClient1 = new JWT({
      email: keys.client_email,
      key: keys.private_key,
      scopes: ["https://www.googleapis.com/auth/admin.directory.user.readonly"],
      subject: keys.subject
    });
    await authClient1.authorize();
    const admin = google.admin({ auth: authClient1, version: "directory_v1" });
    let response = await admin.users.list({ 'customer': keys.customer });
    let userList = response.data.users;
    return userList;

  } catch (err) {
    console.log(err);
    return [];
  }
}

function updateAll({ accessToken, userList, template }) {
  let isAdmin=true;
  if (isAdmin) {
    for (let i = 0; i < userList.length; i++) {
      let userListXX = userList[i];
      let timeoutTime = 2000;
      console.log(userListXX.primaryEmail);
      /*
      setTimeout(async () => {
        try {
          let x = convertFromTemplate(template, userListXX);
          if (userListXX.primaryEmail && (userListXX.primaryEmail.startsWith("craig") || userListXX.primaryEmail.startsWith("luke"))) {
            console.log("Update:" + userListXX.primaryEmail);
            if (accessToken) {
              try {
                const response = await fetch('https://3ufadbfj3b.execute-api.ap-southeast-2.amazonaws.com/default/gmail_signature', {
                  method: 'POST',
                  body: JSON.stringify({
                    'accessToken': accessToken,
                    'emailAddress': userListXX.primaryEmail,
                    'sendAsEmail': userListXX.primaryEmail,
                    "signature": x
                  }), // string or object
                  headers: {
                    'Content-Type': 'application/json',
                    "x-api-key": "yVxNbw7K3y4IS94BDKtMh9hAUiL0Y5oP6NdQEBs2"
                  }
                });
                const myJson = await response.json();
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

      }, (timeoutTime * i) + 30);
      */
    }
  }
}

if (process.argv.length > 3 && process.argv[2] == "--token" || process.argv[2] == "-t") {
  fs.readFile('template.html', 'utf8', async (err, data) => {
    if (err) { console.error(err); return; }
    let userList = await getUserList();
    updateAll({ accessToken: process.argv[3], userList: userList, template: data })
  });
}
else {
  console.log("usage: node index.js --token XXXXXX");
}