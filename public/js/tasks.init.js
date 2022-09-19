$(document).ready(function() {
    $('.parsley-examples').parsley();
});








        $(document).on('select2:open', () => {
            document.querySelector('.select2-search__field').focus();
        });


  var select = $('[data-plugin="select_servidores"]').select2({
    ajax: {
      url: '/api/servidores/search?',
      dataType: 'json',
      data: function (params) {
        var query = {
          term: params.term
        }

        // Query parameters will be ?search=[term]&type=public
        return query;
      },
      type: "GET",
      placeholder: "Buscar ...",
      minimumInputLength: 3,
 
      processResults: function (data) {
        return {
          results: data
        };
      },
    },
    templateResult: formatRepo,
    templateSelection: function (data) {
        if (!data.id) {
          return data.text;
        }
        return $(`<span>${data.registration} - ${data.name}</span>`);
      },
  })

  .on('select2:open', function (e) {
    document.querySelector('.select2-search__field').focus();
  })


  .on('select2:select', function (e) {
      var data = e.params.data;
     
      $("#destiny").text(data.location)
       var contato = $("#contato").val(data.phone).mask("(99) 99999-999?9")
       checkWhatsapp(data.phone)
  });


$(document).ready(function() {

if($(".contato")){

$(".contato").mask("(99) 9999-9999?9").focusout(function(event) {
  var target, phone, element;
  target = (event.currentTarget) ? event.currentTarget : event.srcElement;
  phone = target.value.replace(/\D/g, '');
  element = $(target);
  element.unmask();
  if (phone.length > 10) {
      element.mask("(99) 99999-999?9");
      checkWhatsapp(phone)
  } else {
      element.mask("(99) 9999-9999?9");
  }
});
}

});

  


 





  function formatRepo(data) {

    //console.log(data)
    if (data.loading) {
      return data.text;
    }



    var $tpl = $(`
                <div class="p-1">
                    <span class="location"><i class="uil uil-map-pin-alt text-dark"></i><span class="badge badge-soft-primary" style="margin-left:5px;">${data.location}</span></span>
                    <h5 class="mt-1 mb-1"><span class="text-dark bold repository__name">${data.registration} ${data.name}</span>
                    <br><span class="badge badge-soft-secondary mt-1">${data.role}</span> </h5>                                   
                </div>
        `)



    return $tpl;
  }



  

function priority(priority) {

    if (priority == "1") {
        text = ['danger', 'Alta']
    } else if (priority == "2") {
        text = ['success', 'Normal']

    } else {
        text = ['primary', 'Baixa']
    }
    var tpl = `<div class="badge bg-${text[0]} float-end">Prioridade ${text[1]}</div>`
    return tpl
}

function tecnicos(tecnicos) {
    var tpl = ''
    
    if(tecnicos != false){
        tpl = `<hr class="mt-2 mb-2"><span class="fs-12 mt-2 mb-1 bold text-dark">${(tecnicos.length> 1) ? `Técnicos atendendo:`:`Técnico atendendo:` } </span>`
        tecnicos.forEach(function (tecnico, index) {
            tpl += `<span class="badge badge-soft-secondary fs-13">${tecnico.name}</span>`
        })
        
    }

    return tpl
}



var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;

};


function tplte(row) {

    return `<div class="col-xl-4 col-lg-6">
    <div class="card">
        <a href="/tasks/view/${row.task_id}" >
        <div class="card-body">
            
            ${priority(row.priority)}
        
            <p class="text-success text-uppercase  mb-2"><i class="uil uil-map-pin-alt text-dark"></i><span class="badge badge-soft-primary" style="margin-left:5px;">${row.location}</span></p>
            <h5 class="mt-1 mb-1"><span class="text-dark fs-17 dots">${row.registration} - ${row.name}</span></h5>
            <span class="badge badge-soft-secondary mt-1">${row.role}</span> </h5>
            <p class="text-muted mb-1 mt-2  ">${row.description}</p>
             
            ${tecnicos(row.tecnico)}
             
         
        </div>
        <div class="card-body border-top">
            <div class="row align-items-center">
                <div class="col-sm-auto">
                    <ul class="list-inline mb-0">
                        <li class="list-inline-item pe-2">
                            <span class="text-muted d-inline-block" data-bs-toggle="tooltip" data-bs-placement="top" title="Due date">
                                <i class="uil uil-calender me-1"></i> ${moment(row.created_task).fromNow()}
                            </span>
                        </li>
                       
                        <li class="list-inline-item">
                            <span class="text-muted d-inline-block" data-bs-toggle="tooltip" data-bs-placement="top" title="Comments">
                                <i class="uil uil-clipboard-alt"></i> #${row.task_id} 
                            </span>
                        </li>
                    </ul>
                </div>
                <div class="col offset-sm-1">
                    
                </div>
            </div>
        </div>
        </a>
    </div>
    <!-- end card -->
</div>`

}

function showTasks(data){

    $('.load').hide()

        if(data){

            var tpl = ""
            data.forEach(function (row, index) {
                tpl += tplte(row)
            })
        
            $(".tarefas").empty().append(tpl)

        }else{

            $(".tarefas").empty().append(`
            
            <div class="col-12 text-center">
                                
                                        <h4 class="header-title mt-3 pt-3 mb-3" style="font-size:50px !important">😅</h4>
                                        <p class="sub-header">
                                           Não há nenhuma tarefa.
                                        </p>

                                 
                            </div>
            `)
        }

   
 

}



function initTasks(date){
    $(".tarefas").empty()

    var data = {
        show: getUrlParameter('show'),
        start: date[0],
        end:date[1],
        term: $('#busca').val()
      }

    $.ajax({
        type: "POST",
        url: `/api/tasks/all`,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        success: function (data) {
            showTasks(data)
        },
        error: function (errMsg) {
            alert(errMsg);
        }
    
    })


}



$('#busca').on("input", function() {
   
    var dInput = this.value;
    console.log(dInput);

    initTasks(flatpickr.selectedDates)
    //$(".dDimension:contains('" + dInput + "')").css("display","block");

});

    const flatpickr = $('#range-datepicker').flatpickr({
        locale: "pt",
        mode: "range",
        dateFormat: "d/m/Y",
        defaultDate : [moment(new Date()).subtract(7, 'days').format("DD/MM/YYYY"), moment(new Date()).format("DD/MM/YYYY")],
        onChange: function(selectedDates, dateStr, instance) {
            initTasks(selectedDates)
        },
        onReady: function(selectedDates, dateStr, instance) {
         console.log(selectedDates[0],selectedDates[1])

        initTasks(selectedDates)
        },
         
    });

