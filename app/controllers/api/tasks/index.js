const express = require('express');
const router = express.Router();
const moment = require('moment')
var db = require('../../../config/db')



var pool = require("../../../config/pool-factory");


// Estrutura /API/Tasks


router.get('/all', async function (req, res) {

 var show = req.query.show
 var rows = await db.getTask((show))
 res.json(rows);

})


router.get('/patrimonio/:task_id', async function (req, res) {

  const task_id = req.params.task_id
  let rows = await pool.query("SELECT * FROM task_patrimonio WHERE task_id = ?", [task_id]);
  // if (rows.length > 0) return   res.json(rows);
  // return res.json({status: "Sorry! Not found."});
   res.json({
        "data": rows
      });

})





router.get('/history/:task_id', async function (req, res) {

  const task_id = req.params.task_id
  var data = await db.getTaskHistory(task_id)
  res.json(data);

})



router.get('/notes/:task_id', async function (req, res) {

  const task_id = req.params.task_id
  var data = await db.getNotesHistory(task_id)
  res.json(data);

})



router.get('/about', function (req, res) {
  res.send('About this Api');

})

module.exports = router;