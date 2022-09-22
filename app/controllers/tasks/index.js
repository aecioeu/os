const express = require("express");
const router = express.Router();

var pool = require("../../config/pool-factory");
var {
  makeid,
  rand,
  delay,
  capitalizeFirstLetter,
} = require("../../config/functions");
var db = require("../../config/db");

var moment = require("moment"); // require

const { isLoggedIn } = require("../../config/functions");

//whatsapp client
const client = require("../../config/wpp");
const { sendMsg } = require("../../config/senderHelper");

//AGENDAMENTOS
const schedule = require("node-schedule");


async function lembrete() {
  var start = moment().format("YYYY-MM-DD 00:00:00"),
    end = moment().format("YYYY-MM-DD 23:59:59");

  //19/09 00:00 ate 19/09 23:59
  var completeTasks = await db.getCompleteTask(start, end);
  //console.log('completed' , completeTasks)
  if (completeTasks) {
    var date = new Date();

    for (const task of completeTasks) {
    
      var solicitante = task.name.split(" ");
      const task_patrimonio = await db.getTaskPatrimoniobyIdTask(task.task_id);

      try {
        if (task_patrimonio) {
          let tpl = "";
          task_patrimonio.forEach(function (patrimonio, index) {
            tpl += `_- ${patrimonio.registration} - ${patrimonio.name}_\n`;
          });

          date.setSeconds(date.getSeconds() + 60);

          schedule.scheduleJob(`${task.task_id}`, date, async function () {
            console.log(`Executando o Job da task ${task.task_id}`);

           await db.updateTaskDate(task.task_id, `${moment(date).add(1, 'days').format("YYYY-MM-DD HH:mm:ss")}`)

            await sendMsg(
              {
                type: "text",
                message: `*${capitalizeFirstLetter(
                  solicitante[0].toLowerCase()
                )}*, você ainda não buscou os itens 😅 aqui no CPD.
                    \n${tpl}
                    \nJá estão prontos 🥳, aguardando sua retirada.
                    \n*Providencie a retirada o mais breve possivel.*
                    \n\n_👉Mensagem automática, não é necessario responder._
                    `,
                from: task.whatsapp,
              },
              client
            );


            
          });
        }
      } catch (error) {
        console.log("erro ao enviar", error);
      }
      // console.log(task.task_id)
    } // fim do for
  }
}


/*

“At minute 0 past hour 8, 10, and 14 on Monday, Tuesday, Wednesday, Thursday, and Friday.”
*/
var cron = require("node-cron");

cron.schedule("0 8,10,14 * * 1,2,3,4,5", async () => {
  console.log("Lembrando o pessoal a cada 2 horas");
 // lembrete()
});

// Estrutura /TASKS

async function history(id_task, type, description, id_tecnico) {
  // função que vai realizar a historia das tasks no banco de dados
  // id_task = id que está vinculado
  // type se é historio de tasks, sistema, usuarios
  // id_tecnico - tecnico que gerou o historio que estava logado
}




global.io.on("connection", async function (socket) {
  
  console.log('👾 New socket connected! >>', socket.id)

  const data = await db.getTaskCount();
  io.sockets.emit('getCountTasks', data);  

})



router.get("/test", function (req, res) {
  res.send("Service home page");

  io.sockets.emit('getCountTasks', [
    {
        "status": "archive",
        "count": 99
    },
    {
        "status": "complete",
        "count": 99
    }
]);

});

router.get("/count", isLoggedIn, async function (req, res) {
  //res.send('Service home page');
  const data = await db.getTaskCount();
  res.json(data);
});



router.get("/create", isLoggedIn, function (req, res) {
  //res.send('Service home page');
  res.render("admin/tasks/create.ejs", { user: req.user });
});

router.post("/create", isLoggedIn, async function (req, res) {
  const dados = req.body;
  const task_id = makeid(5);

  console.log(dados);

  let user = req.user.id;

  var data = {
    task_id: task_id,
    id_servidor: dados.servidor,
    location: dados.destiny,
    contato: dados.contato,
    whatsapp: dados.whatsapp,
    notification: dados.notify ? dados.notify : "off",
    description: dados.problem,
    priority: dados.priority,
    id_tecnicos: user.id,
    status: "new",
    type: dados.tipo,
  };

  await pool.query(
    "UPDATE servidores SET phone = ? , whatsapp = ? WHERE id = ?",
    [dados.contato, dados.whatsapp, dados.servidor]
  );

  await pool.query(
    "INSERT INTO tasks SET ?",
    data,
    async function (err, result) {
      //atualizar o servidor como o telefone

      if (err) console.log(err);

      const data = await db.getTaskData(task_id);
      var solicitante = data[0].name.toString().split(" ");
      if (dados.tipo == "in") {
        try {
          await sendMsg(
            {
              type: "text",
              message: `Oi 👋 *${capitalizeFirstLetter(
                solicitante[0].toLowerCase()
              )}* tudo bem ? \nAqui é do CPD da Prefeitura.
       \nFoi gerada uma nova tarefa do equipamento que *chegou para manutenção*.
       \nFique atento pois as notificações desta tarefa vão chegar por aqui.
       \n
       \n_👉Mensagem automática, não é necessario responder._
       `,
              from: data[0].whatsapp,
            },
            client
          );
        } catch (error) {
          console.log("erro ao enviar");
        }
      }

      db.insertHistory(
        "task",
        `Tarefa Criada por ${req.user.name} em ${moment().format(
          "DD/MM/YYYY"
        )} às ${moment().format("HH:mm")}.`,
        ``,
        req.user.id,
        task_id
      );
      let tasksCount = await db.getTaskCount();
      io.sockets.emit('getCountTasks', tasksCount);  

      res.redirect("/tasks/view/" + task_id);
    }
  );
});

router.get("/create", isLoggedIn, function (req, res) {
  //res.send('Service home page');
  res.render("admin/tasks/create.ejs", { user: req.user });
});

router.post("/edit", isLoggedIn, async function (req, res) {
  const dados = req.body;

  let user = req.user.id;
  let task_id = dados.task_id;

  var data = {
    task_id: task_id,
    id_servidor: dados.servidor,
    location: dados.destiny,
    contato: dados.contato,
    whatsapp: dados.whatsapp,
    notification: dados.notify ? dados.notify : "off",
    description: dados.problem,
    priority: dados.priority,
    type: dados.tipo,
  };

  if (dados.arquived == "on") {
    data.status = "pendding";
  }

  await pool.query("UPDATE servidores SET phone = ? WHERE id = ?", [
    dados.contato,
    dados.servidor,
  ]);

  await pool.query(
    "UPDATE tasks SET ? WHERE task_id = ?",
    [data, task_id],
    function (err, result) {
      //atualizar o servidor como o telefone

      if (err) console.log(err);

      if (dados.arquived == "on") {
        db.insertHistory(
          "task",
          `Tarefa Desarquivada`,
          `${req.user.name} desarquivou esta tarefa em ${moment().format(
            "DD/MM/YYYY"
          )} às ${moment().format("HH:mm")}.`,
          req.user.id,
          task_id
        );
        db.insertHistory(
          "task",
          `Edição na tarefa`,
          `${req.user.name} editou informações desta tarefa ${moment().format(
            "DD/MM/YYYY"
          )} às ${moment().format("HH:mm")}.`,
          req.user.id,
          task_id
        );
      } else {
        db.insertHistory(
          "task",
          `Edição na tarefa`,
          `${req.user.name} editou informações desta tarefa ${moment().format(
            "DD/MM/YYYY"
          )} às ${moment().format("HH:mm")}.`,
          req.user.id,
          task_id
        );
      }

      res.redirect("/tasks/view/" + task_id);
    }
  );

});

router.post("/note", async function (req, res) {
  const dados = req.body;
  var data = {
    task_id: dados.task_id,
    description: dados.description,
    tecnico_name: req.user.name,
    id_tecnicos: req.user.id,
  };

  await pool.query(
    "INSERT INTO task_notes SET ?",
    data,
    function (err, result) {
      if (err) console.log(err);
      //atualizar o servidor como o telefone

      //res.redirect('/tasks/edit/' + task_id);
      res.send({ status: "added" });
    }
  );
});

router.post("/services", async function (req, res) {
  const dados = req.body;
  var data = {
    task_id: dados.task_id,
    registration: dados.id_patrimonio,
    description: dados.description,
    service: dados.id_service,
    tecnico_name: req.user.name,
    id_tecnicos: req.user.id,
  };

  await pool.query(
    "INSERT INTO task_service SET ?",
    data,
    function (err, result) {
      if (err) console.log(err);
      //atualizar o servidor como o telefone

      //res.redirect('/tasks/edit/' + task_id);
      res.send({ status: "added" });
    }
  );
});


router.post("/sign", async function (req, res) {
  const dados = req.body;
  var data = {
    task_id: dados.task_id,
          id_servidor : dados.id_servidor,
          sign_registration: dados.sign_registration, 
          sign_name: dados.sign_name, 
          sign_phone: dados.sign_phone,
          sign_whatsapp: dados.sign_whatsapp,
          sign_type: 'papper',
          tecnico_name: req.user.name,
  };

  await pool.query(
    "INSERT INTO task_sign SET ?",
    data,
    function (err, result) {
      if (err) console.log(err);
      //atualizar o servidor como o telefone

      //res.redirect('/tasks/edit/' + task_id);
      res.send({ status: "signed" });
    }
  );
});

router.get("/takeaway/:task_id", isLoggedIn, async function (req, res) {
  //res.send('Service home page');
  const task_id = req.params.task_id;
  const data = await db.getTaskData(task_id);
  const taskHistory = await db.getTaskHistory(task_id);
  const taskTecnico = await db.getTasktecnicos(task_id);
  const taskSign = await db.getTaskSign(task_id);
  console.log(taskSign)

  var assingned = false;
  if (taskTecnico) {
    var tecnico_assingned = taskTecnico.map((el) => el.id_tecnico);
    assingned = tecnico_assingned.includes(req.user.id.toString());
  }

  res.render("admin/tasks/takeaway.ejs", {
    user: req.user,
    data: data[0],
    task_history: taskHistory,
    task_tecnico: taskTecnico,
    taskSign: taskSign,
    assigned: assingned,
    
  });
});

router.get("/invite/:task_id", isLoggedIn, async function (req, res) {
  //res.send('Service home page');

  const task_id = req.params.task_id;
  const data = await db.getTaskData(task_id);

  if (data[0]) {
    var tecnico = {
      id_tecnico: req.user.id,
      name: req.user.name,
      task_id: data[0].task_id,
    };

    await pool.query("UPDATE tasks SET status = ? WHERE task_id = ?", [
      "pendding",
      data[0].task_id,
    ]);

    await pool.query(
      "INSERT INTO task_tecnico SET ?",
      tecnico,
      function (err, result) {
        //atualizar o servidor como o telefone
        db.insertHistory(
          "task",
          `${req.user.name} assumiu a tarefa ${moment().format(
            "DD/MM/YYYY"
          )} às ${moment().format("HH:mm")}.`,
          ``,
          req.user.id,
          task_id
        );
        res.redirect("/tasks/view/" + task_id);
      }
    );
  }
});

router.get("/complete/:task_id", isLoggedIn, async function (req, res) {
  //res.send('Service home page');

  const task_id = req.params.task_id;
  const data = await db.getTaskData(task_id);
  const task_patrimonio = await db.getTaskPatrimoniobyIdTask(task_id);

  var solicitante = data[0].name.toString().split(" ");

  if(task_patrimonio){

  let tpl = "";
  task_patrimonio.forEach(function (patrimonio, index) {
    tpl += `_- ${patrimonio.registration} - ${patrimonio.name}_\n`;
  });

  if (data[0]) {
    var tecnico = {
      id_tecnico: req.user.id,
      name: req.user.name,
      task_id: data[0].task_id,
    };

    try {
      sendMsg(
        {
          type: "text",
          message: `*${capitalizeFirstLetter(
            solicitante[0].toLowerCase()
          )}*, o CPD da Prefeitura tem um recado importante para você.
        \nOs itens:
        \n${tpl}
        \nJá estão prontos 🥳, aguardando sua retirada.
        \n*Providencie a retirada o mais breve possivel.*
        \n\n_👉Mensagem automática, não é necessario responder._
        `,
          from: data[0].whatsapp,
        },
        client
      );
    } catch (error) {
      console.log("erro ao enviar");
    }
  }
}
    var date = new Date();
    await db.updateTaskDate(data[0].task_id, `${moment(date).add(1, 'days').format("YYYY-MM-DD HH:mm:ss")}`)

    await pool.query("UPDATE tasks SET status = ? WHERE task_id = ?", [
      "complete",
      data[0].task_id,
    ]);

    db.insertHistory(
      "task",
      `${req.user.name} concluiu a tarefa ${moment().format(
        "DD/MM/YYYY"
      )} às ${moment().format("HH:mm")}.`,
      ``,
      req.user.id,
      task_id
    );

    let tasksCount = await db.getTaskCount();
    io.sockets.emit('getCountTasks', tasksCount);  

    res.redirect("/tasks/view/" + task_id);
  
});

router.get("/archive/:task_id", isLoggedIn, async function (req, res) {
  //res.send('Service home page');

  const task_id = req.params.task_id;
  const data = await db.getTaskData(task_id);

  if (data[0]) {
    var tecnico = {
      id_tecnico: req.user.id,
      name: req.user.name,
      task_id: data[0].task_id,
    };

    await pool.query("UPDATE tasks SET status = ? WHERE task_id = ?", [
      "archive",
      data[0].task_id,
    ]);

    db.insertHistory(
      "task",
      `${req.user.name} concluiu e arquivou a tarefa ${moment().format(
        "DD/MM/YYYY"
      )} às ${moment().format("HH:mm")}.`,
      ``,
      req.user.id,
      task_id
    );
    
  let tasksCount = await db.getTaskCount();
  io.sockets.emit('getCountTasks', tasksCount);  

    if(data[0].type == 'in'){
      res.redirect("/tasks/takeaway/" + task_id);
    }else{
      res.redirect("/tasks/view/" + task_id);
    }
    
    
  }
});

router.get("/view/:task_id", async function (req, res) {
  //res.send('Service home page');
  const task_id = req.params.task_id;
  const data = await db.getTaskData(task_id);
  const taskHistory = await db.getTaskHistory(task_id);
  const taskTecnico = await db.getTasktecnicos(task_id);

  var assingned = false;
  if (taskTecnico) {
    var tecnico_assingned = taskTecnico.map((el) => el.id_tecnico);
    assingned = tecnico_assingned.includes(req.user.id.toString());
  }

  res.render("admin/tasks/view.ejs", {
    user: req.user,
    data: data[0],
    task_history: taskHistory,
    task_tecnico: taskTecnico,
    assigned: assingned,
  });
});

router.get("/edit/:task_id", async function (req, res) {
  //res.send('Service home page');
  const task_id = req.params.task_id;
  const data = await db.getTaskData(task_id);
  const taskHistory = await db.getTaskHistory(task_id);
  const taskTecnico = await db.getTasktecnicos(task_id);

  console.log(data);

  var assingned = false;
  if (taskTecnico) {
    var tecnico_assingned = taskTecnico.map((el) => el.id_tecnico);
    assingned = tecnico_assingned.includes(req.user.id.toString());
  }

  res.render("admin/tasks/edit.ejs", {
    user: req.user,
    data: data[0],
    task_history: taskHistory,
    task_tecnico: taskTecnico,
    assigned: assingned,
  });
});

router.post("/create/patrimonio", async function (req, res) {
  const dados = req.body;

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
    task_id: dados.task_id,
  };

  pool.query("INSERT INTO task_patrimonio SET ?", data, function (err, result) {
    //console.log(data)
    //inserir a history de task criada pelo usuario x
    db.insertHistory(
      "task",
      `Novo Patrimônio adicionado a tarefa`,
      `${req.user.name} adicionou o patrimônio nº ${dados.registration} - ${dados.name} na tarefa.`,
      req.user.id,
      dados.task_id
    );
    console.log(err);
  });

  res.json(req.body);
  /* const term = req.query.term  ? req.query.term : ' '
    let rows = await pool.query("SELECT * FROM servidores WHERE registration LIKE ? OR name LIKE ? LIMIT 10", [`%${term}%`, `%${term}%`]);
      if (rows.length > 0) return   res.json(rows);
      return res.json({status: "Sorry! Not found."});*/
});

router.get("/about", function (req, res) {
  res.send("About this order of service");
});

module.exports = router;
