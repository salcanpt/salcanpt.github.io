function updateAll()
{
    if (isAdmin) {
        if (!exampleSelected) exampleSelected = "example1";
        document.getElementById('rightPanelContent').innerText = '';
        for (let i = 0; i < userList.length; i++) {
          let userListXX=userList[i];
          let timeoutTime=2000;
          //if (userListXX.primaryEmail && (userListXX.primaryEmail.startsWith("craig")))timeoutTime=5000;
          setTimeout(async ()=>{
            try {
              let x = document.getElementById(exampleSelected).innerHTML;
              x = convertFromTemplate(x,userListXX);
              
              let x2 = document.createElement("div");
              x2.style.position = "relative";
              x2.style.margin = "2px";
              x2.style.padding = "2px";
              x2.style.backgroundColor = "white";
              x2.innerHTML = x;
              document.getElementById('rightPanelContent').appendChild(x2);
      
              if (userListXX.primaryEmail && (userListXX.primaryEmail.startsWith("craig") || userListXX.primaryEmail.startsWith("luke"))) {
                console.log("Update:"+userListXX.primaryEmail);
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
                    console.log(myJson);
                    if(myJson.status==200)
                    {
                      let tick=document.createElement("div");
                      tick.style.position="absolute";
                      tick.style.top="5px";
                      tick.style.left="5px";
                      tick.style.width="20px";
                      tick.style.height="20px";
                      tick.style.backgroundImage="url(/images/check-tick-icon-14141.png)"
                      x2.appendChild(tick);
                    }
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
    
          },(timeoutTime*i)+30);
    
        }
      }
}