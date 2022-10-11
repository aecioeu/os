console.log('funcoes whats')

const sendMessage = async (data) => {
    const response = await fetch("/api/whatsapp/send", {
      method: "POST",
      body: JSON.stringify(data), // string or object
      headers: {
        "Content-Type": "application/json",
      },
    });
    let respData = await response.json(); //extract JSON from the http response
    //console.log(data);
  };
  
  const sendButtonMessage = async (data) => {
    const response = await fetch("/api/whatsapp/send-button", {
      method: "POST",
      body: JSON.stringify(data), // string or object
      headers: {
        "Content-Type": "application/json",
      },
    });
    let respData = await response.json(); //extract JSON from the http response
    console.log(data);
  };
  
  const checkWhatsapp = async (number) => {
    $(".input-group-text").text("🗙");
    $("#whatsapp").val()
    const response = await fetch("/api/whatsapp/check", {
      method: "POST",
      body: JSON.stringify({ number: number }), // string or object
      headers: {
        "Content-Type": "application/json",
      },
    });
    let respData = await response.json(); //extract JSON from the http response

    console.log(respData)
  if(respData){

  
    if (respData.status.exists == true) {
      $(".input-group-text").text("✔️");
      $("#whatsapp").val(respData.status.jid)
    } else {
      $(".input-group-text").text("🗙");
      $("#whatsapp").val()
    }
  };
}
  
  export {
    sendButtonMessage,
    checkWhatsapp
  }
  
  