
var pool = require("../config/pool-factory");


const getTask = async (data) => {

  if(data.show == 'false') data.show = 'new'

  let rows = await pool.query(`Select
  *,
  tasks.created as created_task
  From
  tasks Inner Join
  servidores On servidores.id = tasks.id_servidor WHERE status = ? AND task_id LIKE ? AND (tasks.created BETWEEN ? AND ?) ORDER BY tasks.priority ASC, tasks.created DESC`, 
  [data.show, `%${data.term}%`, data.start, data.end]);
 
  if (rows.length > 0) {

    const tasks = [] 

    for (const row of rows) {
      var tecnico = await getTasktecnicos(row.task_id)
      row.tecnico = tecnico
      tasks.push(row)
    }
  
  return tasks

  }else return false;
 
 /* if (rows.length > 0) return   res.json(rows);
  return res.json({status: "Sorry! Not found."});*/

};


const getMyTask = async (data) => {

  var consulta = `SELECT * From tasks_tecnico
  INNER JOIN tasks ON tasks.task_id = tasks_tecnico.task_is
  INNER JOIN servidores ON servidores.id = tasks.id_servidor`


/*SELECT * FROM TB_ContratoCotista
INNER JOIN TB_Contrato ON TB_Contrato.id_contrato = TB_ContratoCotista.id_contrato
INNER JOIN TB_Cotista ON TB_Cotista = TB_ContratoCotista.id_cotista */


  let rows = await pool.query(`SELECT  *,
  tasks.created as created_task From task_tecnico
  INNER JOIN tasks ON tasks.task_id = task_tecnico.task_id
  INNER JOIN servidores ON servidores.id = tasks.id_servidor
  WHERE task_tecnico.id_tecnico = ?
  AND tasks.status = ?
  AND tasks.task_id LIKE ? 
  AND (tasks.created BETWEEN ? AND ?) 
  ORDER BY tasks.priority ASC, tasks.created DESC`, 
  [data.tecnico_id, `pendding`,`%${data.term}%`, data.start, data.end]);
 
  if (rows.length > 0) {

    const tasks = [] 

    for (const row of rows) {
      var tecnico = await getTasktecnicos(row.task_id)
      row.tecnico = tecnico
      tasks.push(row)
    }

  return tasks

  }else return false;
 
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
 
   let rows = await pool.query(`Select * , task_notes.created as note_created
    From
    task_notes Inner Join
    tecnicos On tecnicos.id = task_notes.id_tecnicos WHERE task_notes.task_id = ? ORDER BY task_notes.created DESC`, [task_id]);
    if (rows.length > 0) {

    const data = rows

    console.log
    // this gives an object with dates as keys
    const groups = data.reduce((groups, game) => {
    
      const date = game.note_created.toLocaleDateString();
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
  getMyTask,
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