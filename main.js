const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1hv-NzuCEbHF0H5mnTHFOCmqKLVvrwhBaW8hJ419L8Hw/gviz/tq?tqx=out:csv&sheeh2t=Listado'
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/'
let global_list = []
$(document).ready(function(){
    getCorsAuth()
    loadWords()
})

function loadWords(){
    $('#modal-loading').modal('show')
    $.get(PROXY_URL + SHEET_URL, function(data){
        parseDoc(data)
        $('#modal-loading').modal('hide')
    });
}

function parseDoc(csvContent){
    let rows = []
    Papa.parse(csvContent, {
        complete: function(results) {
            rows = results.data;
        }
    });
    rows.shift()
    rows.sort((a, b) => a[0].localeCompare(b[0]))
    global_list = rows
    drawRows(rows)
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getCorsAuth(){
    try{
        $("iframe").contents().find("form")[0].submit()
    }catch{
        console.log("Access already granted")
    }
    $("iframe").remove();
}

function drawRows(rows){
    let lastLetter = ''
    for(row of rows){
        if(row[0] != ''){
            if(row[0].charAt(0).toUpperCase() != lastLetter){
                lastLetter = row[0].charAt(0).toUpperCase()
                let container = `<div class="container" id="${lastLetter}_container"></div>`
                $("body").append(container)
                $(`#${lastLetter}_container`).append(`<h2 id="${lastLetter}">${lastLetter}</h2>`)
            }
            let word = capitalizeFirstLetter(row[0])
            let type = row[1]
            let def = capitalizeFirstLetter(row[2])
            let trans = capitalizeFirstLetter(row[3])
            let result = 
                `<div class="entry">`+
                    `<h3>${word}</h3>`+
                    `<small>Tipo: ${type}</small>`+
                    `<p>${def}</p>`+
                    `<p class="translation">Traducción más cercana: ${trans}</p>`+
                `</div>`
            $(`#${lastLetter}_container`).append(result)
        }
    }
}

function search(goal){
    $(".container").each(function(index, element) {
        $(element).remove();
    });
    drawRows(global_list.filter((row) => row[0].toUpperCase().startsWith(goal.toUpperCase())))
}