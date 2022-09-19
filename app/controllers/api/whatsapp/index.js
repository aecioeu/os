const express = require('express');
const router = express.Router();
const moment = require('moment')
var db = require('../../../config/db')


var pool = require("../../../config/pool-factory");

// Estrutura /API/Tasks

//whatsapp
var client = require("../../../config/wpp");
const { sendMsg }  = require('../../../config/senderHelper')
  

router.post('/check', async function (req, res) {

  const body = req.body
  const number = body.number.toString().replace(/\D/g, "")

 const [result] = await client.onWhatsApp("55" + number);

  if (typeof result !== 'undefined') {
   console.log(result);

   return res.status(200).json({
    status: result,
    message: "404 - Não existe",
  });

 }else{
  console.log('algum erro ocorreu ao buscar 55' + number)
 }

})



router.post("/send", async function (req, res, next) {

    const body = req.body
    console.log(body)

        await sendMsg(
                {
                type: body.type,
                message: body.message,
                from: body.from
                },
                client
            );

  

    return res.status(200).json({
      status: false,
      message: "404 - Não existe",
    });

  })

module.exports = router;