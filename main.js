const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1hv-NzuCEbHF0H5mnTHFOCmqKLVvrwhBaW8hJ419L8Hw/gviz/tq?tqx=out:csv&sheeh2t=Listado'
const PROXY_URL = 'https://corsproxy.io/?'
let global_list = []
$(document).ready(function(){
    loadWords()
})

function loadWords(){
    $('#modal-loading').modal('show')
    $.get(PROXY_URL + encodeURIComponent(SHEET_URL), function(data){
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
    for(row of rows){
        if(row[0] != ''){
            let word = capitalizeFirstLetter(row[0])
            let type = row[1]
            let def = capitalizeFirstLetter(row[2])
            let translations = ''
            row[3].split("/").flat().forEach(element => {
                translations += `<span>${capitalizeFirstLetter(element)}</span>/`
            });
            translations = translations.substring(0, translations.length-1)
            global_list.push([word, type, def, translations])
        }
    }
    drawRows(global_list)
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function drawRows(rows){
    let lastLetter = ''
    for(row of rows){
        if(row[0].charAt(0).toUpperCase() != lastLetter){
            lastLetter = row[0].charAt(0).toUpperCase()
            let container = `<div class="container" id="${lastLetter}_container"></div>`
            $("body").append(container)
            $(`#${lastLetter}_container`).append(`<h2 id="${lastLetter}">${lastLetter}</h2>`)
        }
        let result = 
            `<div class="entry">`+
                `<h3><span>${row[0]}</span></h3>`+
                `<small>Tipo: ${row[1]}</small>`+
                `<p>${row[2]}</p>`+
                `<p class="translation">Traducción más cercana: ${row[3]}</p>`+
            `</div>`
        $(`#${lastLetter}_container`).append(result)
    }
}

function search(goal){
    $(".container").each(function(index, element) {
        $(element).remove();
    });
    drawRows(global_list.filter((row) => row[0].toUpperCase().startsWith(goal.toUpperCase()) || row[3].split("/").some(function(e){return e.toUpperCase().startsWith(("<span>" + goal).toUpperCase())})))
    $("span").each(function(index, element) {
        if($(element).html().toUpperCase().startsWith(goal.toUpperCase()) && goal != ''){
            $(element).addClass("highlighted")
        }
    });
}