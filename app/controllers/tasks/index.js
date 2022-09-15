const express = require('express');
const router = express.Router();

var pool = require("../../config/pool-factory");
var {makeid, rand, delay} = require("../../config/functions");
var db = require('../../config/db')

var moment = require('moment'); // require


const { isLoggedIn } = require('../../config/functions')

// Estrutura /TASKS

async function history(id_task, type, description, id_tecnico){
// função que vai realizar a historia das tasks no banco de dados
// id_task = id que está vinculado
// type se é historio de tasks, sistema, usuarios
// id_tecnico - tecnico que gerou o historio que estava logado

}


router.get('/', function (req, res) {
  res.send('Service home page');
})


router.get('/count', isLoggedIn, async function (req, res) {
  //res.send('Service home page');
  const data = await db.getTaskCount()
  res.json(data)

})

router.get('/create', isLoggedIn, function (req, res) {
  //res.send('Service home page');
  res.render("admin/tasks/create.ejs", { user : req.user});

})

router.post('/create', isLoggedIn, async function (req, res) {

const dados = req.body
const task_id = makeid(5)

let user = req.user.id


var data = {
  task_id: task_id,
  id_servidor: dados.servidor,
  location: dados.destiny,
  contato: dados.contato,
  whatsapp: "",
  description: dados.problem,
  priority: dados.priority,
  id_tecnicos : user.id,
  status : "new",
  type: dados.tipo
};


await pool.query(
  "UPDATE servidores SET phone = ? WHERE id = ?",
  [dados.contato, dados.servidor]
);

await pool.query("INSERT INTO tasks SET ?", data, function (err, result) {
  //atualizar o servidor como o telefone

  if(err) console.log(err)

  db.insertHistory("task", `Tarefa Criada por ${req.user.name} em ${moment().format('DD/MM/YYYY')} às ${moment().format('HH:mm')}.` , ``, req.user.id, task_id)

  res.redirect('/tasks/view/' + task_id);
});
})



router.get('/create', isLoggedIn, function (req, res) {
  //res.send('Service home page');
  res.render("admin/tasks/create.ejs", { user : req.user});

})

router.post('/edit', isLoggedIn, async function (req, res) {

const dados = req.body


let user = req.user.id
let task_id = dados.task_id

console.log(dados)


var data = {
  id_servidor: dados.servidor,
  location: dados.destiny,
  contato: dados.contato,
  whatsapp: "",
  description: dados.problem,
  priority: dados.priority,
  id_tecnicos : user.id,
  type: dados.tipo
};

if(dados.arquived == 'on'){
  data.status = 'pendding'
}

await pool.query(
  "UPDATE servidores SET phone = ? WHERE id = ?",
  [dados.contato, dados.servidor]
);

await pool.query("UPDATE tasks SET ? WHERE task_id = ?", [data , task_id], function (err, result) {
  //atualizar o servidor como o telefone

  if(err) console.log(err)

  if(dados.arquived == 'on'){
    db.insertHistory("task", `Tarefa Desarquivada`, `${req.user.name} desarquivou esta tarefa em ${moment().format('DD/MM/YYYY')} às ${moment().format('HH:mm')}.` , req.user.id, task_id)
    db.insertHistory("task", `Edição na tarefa`, `${req.user.name} editou informações desta tarefa ${moment().format('DD/MM/YYYY')} às ${moment().format('HH:mm')}.` , req.user.id, task_id)

  }else{

    db.insertHistory("task", `Edição na tarefa`, `${req.user.name} editou informações desta tarefa ${moment().format('DD/MM/YYYY')} às ${moment().format('HH:mm')}.` , req.user.id, task_id)

  }

  
  res.redirect('/tasks/view/' + task_id);
});
})



router.post('/note', async function (req, res) {

  const dados = req.body
    var data = {
      task_id: dados.task_id,
      description : dados.description,
      tecnico_name: req.user.name,
      id_tecnicos: req.user.id
    
    };

    

  

  await pool.query("INSERT INTO task_notes SET ?", data, function (err, result) {
    if(err) console.log(err)
        //atualizar o servidor como o telefone
      
        //res.redirect('/tasks/edit/' + task_id);
        res.send({status: "added"})
      
      });

      
})

router.get('/invite/:task_id', isLoggedIn, async function (req, res) {
  //res.send('Service home page');

  const task_id = req.params.task_id
  const data = await db.getTaskData(task_id)


  if(data[0]){

    

   var tecnico = {
    id_tecnico : req.user.id,
    name : req.user.name,
    task_id : data[0].task_id

   }

   await pool.query(
    "UPDATE tasks SET status = ? WHERE task_id = ?",
    ['pendding', data[0].task_id]
  );


await pool.query("INSERT INTO task_tecnico SET ?", tecnico, function (err, result) {



  
      //atualizar o servidor como o telefone
      db.insertHistory("task", `${req.user.name} assumiu a tarefa ${moment().format('DD/MM/YYYY')} às ${moment().format('HH:mm')}.` , ``, req.user.id, task_id)
      res.redirect('/tasks/view/' + task_id);
});
  


  }




})



router.get('/complete/:task_id', isLoggedIn, async function (req, res) {
  //res.send('Service home page');

  const task_id = req.params.task_id
  const data = await db.getTaskData(task_id)


  if(data[0]){

  var tecnico = {
    id_tecnico : req.user.id,
    name : req.user.name,
    task_id : data[0].task_id

   }

   await pool.query(
    "UPDATE tasks SET status = ? WHERE task_id = ?",
    ['complete', data[0].task_id]
  );

  db.insertHistory("task", `${req.user.name} concluiu a tarefa ${moment().format('DD/MM/YYYY')} às ${moment().format('HH:mm')}.` , ``, req.user.id, task_id)
  res.redirect('/tasks/view/' + task_id);

}

})


router.get('/view/:task_id', async function (req, res) {
  //res.send('Service home page');
  const task_id = req.params.task_id
  const data = await db.getTaskData(task_id)
  const taskHistory = await db.getTaskHistory(task_id)
  const taskTecnico = await db.getTasktecnicos(task_id)


  var assingned = false
  if(taskTecnico){

    var tecnico_assingned = taskTecnico.map(el => el.id_tecnico);
    assingned = tecnico_assingned.includes(req.user.id.toString())
   
  }

  res.render('admin/tasks/view.ejs', {
     user : req.user, 
     data: data[0],
     task_history : taskHistory,
     task_tecnico: taskTecnico,
     assigned : assingned
    }
  
  );

})


router.get('/edit/:task_id', async function (req, res) {
  //res.send('Service home page');
  const task_id = req.params.task_id
  const data = await db.getTaskData(task_id)
  const taskHistory = await db.getTaskHistory(task_id)
  const taskTecnico = await db.getTasktecnicos(task_id)

  console.log(data)


  var assingned = false
  if(taskTecnico){

    var tecnico_assingned = taskTecnico.map(el => el.id_tecnico);
    assingned = tecnico_assingned.includes(req.user.id.toString())
   
  }

  res.render('admin/tasks/edit.ejs', {
     user : req.user, 
     data: data[0],
     task_history : taskHistory,
     task_tecnico: taskTecnico,
     assigned : assingned
    }
  
  );

})




router.post('/create/patrimonio', async function (req, res) {

  const dados = req.body

  var data = {

    registration: dados.registration,
    name: dados.name,
    location: dados.location,
    data_aquisicao: moment(dados.data_aquisicao).format("YYYY-MM-DD"),
    orgao: dados.orgao,
    responsavel: dados.responsavel,
    natureza: dados.natureza,
    valor_aquisicao: dados.valor_aquisicao,
    valor_atualizado: dados.valor_atualizado,
    centro_custo: dados.centro_custo,
    situacao: dados.situacao,
    task_id: dados.task_id
   
  };
  
   pool.query("INSERT INTO task_patrimonio SET ?", data, function (err, result) {
    //console.log(data)
    //inserir a history de task criada pelo usuario x
    db.insertHistory("task", `Novo Patrimônio adicionado a tarefa` , `${req.user.name} adicionou o patrimônio nº ${dados.registration} - ${dados.name} na tarefa.`, req.user.id, dados.task_id)
    console.log(err)
  });
  
 
  res.json(req.body)
    /* const term = req.query.term  ? req.query.term : ' '
    let rows = await pool.query("SELECT * FROM servidores WHERE registration LIKE ? OR name LIKE ? LIMIT 10", [`%${term}%`, `%${term}%`]);
      if (rows.length > 0) return   res.json(rows);
      return res.json({status: "Sorry! Not found."});*/
  
  })
  

router.get('/about', function (req, res) {
  res.send('About this order of service');
})

module.exports = router;