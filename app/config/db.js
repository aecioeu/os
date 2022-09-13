
var pool = require("../config/pool-factory");


const getTask = async (status) => {

  if(status == 'false') status = 'new'

  let rows = await pool.query(`Select
  *,
  tasks.created as created_task
  From
  tasks Inner Join
  servidores On servidores.id = tasks.id_servidor WHERE status = ? ORDER BY tasks.created DESC`, [status]);
 
  if (rows.length > 0) return rows;
  return false;
 
 /* if (rows.length > 0) return   res.json(rows);
  return res.json({status: "Sorry! Not found."});*/

};

const getTaskCount = async () => {

  let rows = await pool.query(`Select
    tasks.status As status,
    Count(tasks.status) As count
From
    tasks
Group By
    tasks.status`);

  if (rows.length > 0) return rows;
  return false;

};


const getTaskData = async (task_id) => {

    let rows = await pool.query(`Select
    *,
    tasks.created as created_task
    From
    tasks Inner Join
    servidores On servidores.id = tasks.id_servidor WHERE task_id = ?`, [task_id]);

    if (rows.length > 0) return rows;
    return false;
   
   /* if (rows.length > 0) return   res.json(rows);
    return res.json({status: "Sorry! Not found."});*/
 
  };

  const getTaskPatrimonio = async (id) => {
    let rows = await pool.query(`SELECT * FROM task_patrimonio WHERE id = ?`, [id]);
    if (rows.length > 0) return rows;
    return false;
   
   /* if (rows.length > 0) return   res.json(rows);
    return res.json({status: "Sorry! Not found."});*/
 
  };



  const getTaskHistory = async (task_id) => {

    let rows = await pool.query(`SELECT * FROM history WHERE task_id = ? ORDER BY created DESC`, [task_id]);
    if (rows.length > 0) return rows;
    return false;
   
   /* if (rows.length > 0) return   res.json(rows);
    return res.json({status: "Sorry! Not found."});*/
 
  };

  const getTasktecnicos = async (task_id) => {

    let rows = await pool.query(`SELECT * FROM task_tecnico WHERE task_id = ? ORDER BY created DESC`, [task_id]);
    if (rows.length > 0) return rows;
    return false;
   
   /* if (rows.length > 0) return   res.json(rows);
    return res.json({status: "Sorry! Not found."});*/
 
  };


  const getNotesHistory = async (task_id) => {

    let rows = await pool.query(`SELECT * FROM task_notes WHERE task_id = ? ORDER BY created DESC`, [task_id]);
    if (rows.length > 0) {

    const data = rows
    // this gives an object with dates as keys
    const groups = data.reduce((groups, game) => {
    
      const date = game.created.toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(game);
      return groups;
    }, {});
    
    // Edit: to add it in the array format instead
    const groupArrays = Object.keys(groups).map((date) => {
      return {
        date,
        notes: groups[date]
      };
    });
    


    return groupArrays;

    }else{
      return false;
    }
   


   
   
   /* if (rows.length > 0) return   res.json(rows);
    return res.json({status: "Sorry! Not found."});*/
 
  };
  

const getServidor = async (id_servidor) => {

    let rows = await pool.query("SELECT * FROM servidores WHERE id = ?", [id_servidor]);
    if (rows.length > 0) return rows;
    return false;
   
   /* if (rows.length > 0) return   res.json(rows);
    return res.json({status: "Sorry! Not found."});*/
 
  };


  const getTecnico = async (id_tecnico) => {

    let rows = await pool.query("SELECT * FROM tecnicos WHERE id = ?", [id_servidor]);
    if (rows.length > 0) return rows;
    return false;
   
   /* if (rows.length > 0) return   res.json(rows);
    return res.json({status: "Sorry! Not found."});*/
 
  };



  const insertHistory = async (type, title, description, id_tecnicos, task_id) => {

    var data = {
      task_id: task_id,
      id_tecnicos:id_tecnicos,
      type: type, 
      title: title, 
      description : description};
  
      await pool.query("INSERT INTO history SET ?", data, function (err, result) {
        if(err){
          console.log(err)
        }
  
      });

  }

  

  module.exports = {
  getTaskCount,
  getTasktecnicos,
  getTask,
  getNotesHistory,
  getTecnico,
  getTaskPatrimonio,
  getTaskData,
  getTaskHistory,
  getServidor,
  insertHistory
  
  };