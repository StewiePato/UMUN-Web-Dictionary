const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1hv-NzuCEbHF0H5mnTHFOCmqKLVvrwhBaW8hJ419L8Hw/gviz/tq?tqx=out:csv&sheeh2t=Listado'
const PROXY_URL = '
https://corsproxy.io/? '
let global_list = []
$(document).ready(function(){
    document.getElementById("autoFocusSearchCB").checked = localStorage.getItem('autoFocusSearch') == 'true'
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
            if(row[4] != null && row[4] != '' && row[4] != 'Sin Derivaciones'){
                let firstDerivationUmun = capitalizeFirstLetter(row[4])
                let firstDerivationType = row[5]
                let firstDerivationEsp = capitalizeFirstLetter(row[6])
                global_list.push([firstDerivationUmun, firstDerivationType, `<b>Deriva de:</b>${word}\n${def}`, firstDerivationEsp])
            }
            if(row[7] != null && row[7] != ''&& row[7] != 'Sin Derivaciones'){
                let secondDerivationUmun = capitalizeFirstLetter(row[7])
                let secondDerivationType = row[8]
                let secondDerivationEsp = capitalizeFirstLetter(row[9])
                global_list.push([secondDerivationUmun, secondDerivationType, `<b>Deriva de:</b>${word}\n${def}`, secondDerivationEsp])
            }
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

function search(){
    let goal = $("#search").val()
    let type = $("#menu").val()
    $(".container").each(function(index, element) {
        $(element).remove();
    });
    let filteredList = global_list.filter((row) => row[0].toUpperCase().startsWith(goal.toUpperCase()) || row[3].split("/").some(function(e){return e.toUpperCase().startsWith(("<span>" + goal).toUpperCase())}))
    if(type != ''){
        drawRows(filteredList.filter((row) => row[1].includes(type)))
    }else{
        drawRows(filteredList)
    }
    $("span").each(function(index, element) {
        if($(element).html().toUpperCase().startsWith(goal.toUpperCase()) && goal != ''){
            $(element).addClass("highlighted")
        }
    });
}

let isSearchFocused = false;
document.addEventListener("keyup", (event) => {
    if(localStorage.getItem('autoFocusSearch') == 'false'){
        return
    }
    if(isSearchFocused){
        return 
    }
    if(event.keyCode >= 65 && event.keyCode <= 122){
        $("#search").focus()
        $("#search").val($("#search").val() + event.key)
    }
});