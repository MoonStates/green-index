document.addEventListener("DOMContentLoaded", functions);

function functions(){
    eventsDOM();
}

function eventsDOM(){
    //var accueil = document.getElementById("accueil");
    //var resultat = document.getElementById("resultat");
    //var multipleSites = document.getElementById("multipleSites");

    //multipleSites.style.display="none";
    //resultat.style.display="none";

    /*document.getElementById('d').addEventListener('click', function() {
        //multipleSites.style.display="block";
        //accueil.style.display="none";
        //var site =document.getElementById("linkToAnalyse").value;

        var httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function(data) {
            if(httpRequest.responseText){
                chargeResultat(JSON.parse(httpRequest.responseText))
            }
        };
        httpRequest.open("POST", '/result/historique/');
        httpRequest.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
        httpRequest.send(JSON.stringify({site:"test"}));
        
    })*/
}

function historique(id){
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function(data) {
        if(httpRequest.responseText){
            chargeResultat(JSON.parse(httpRequest.responseText),id)
        }
    };
    httpRequest.open("GET", '/result/historique/'+id);
    httpRequest.send();
}
function chargeResultat(data,id){
    let tbody = document.getElementById('toAppend'+id)
    while(tbody.firstChild) tbody.removeChild(tbody.firstChild)
    data.forEach((item) =>{
        let date = new Date(item.date_analyse)
        tbody.innerHTML +=
            '<tr>' +
            '<td>'+date.getDay()+'/'+date.getMonth()+1+'/'+date.getFullYear()+'</td>' +
            '<td>'+item.ecoindex+'</td>' +
            '<td>'+item.complexite+' elements</td>' +
            '<td>'+item.empreinte_ges_mobile_4g+' gCO2eq</td>' +
            '<td>'+item.empreinte_ges_desktop_wifi+' gCO2eq</td>' +
            '<td>'+item.empreinte_eau+' ml</td>' +
            '</tr>'
    })

}

function gauge(inverted, max_value, value, idCanvas, idTextField) {
    var startColor = '#00cc00';
    var endColor = '#ff0000';
    let v = max_value
    if (inverted) {
        startColor = '#ff0000';
        endColor = '#00cc00';
        console.log('if')
    }
    console.log(startColor);
    var opts = {
        angle: -0.25,
        lineWidth: 0.14,
        radiusScale: 1,
        pointer: {
            length: 0.6,
            strokeWidth: 0.035,
            color: '#000000'
        },
        limitMax: false,
        limitMin: false,
        colorStart: '#ff0000',
        colorStop: '#00cc00',
        strokeColor: '#8FC0DA',
        generateGradient: true,
        highDpiSupport: true,
        staticLabels: {
            font: "90% sans-serif",  // Specifies font
            labels: [0, max_value],  // Print labels at these values
            color: "black",
        },
        strokeColor: 'red',   // to see which ones work best for you
        staticZones: [
            {strokeStyle: startColor, min: 0, max: max_value / 3},
            {strokeStyle: "#ffcc00", min: max_value / 3, max: (max_value / 3) * 2},
            {strokeStyle: endColor, min: (max_value / 3) * 2, max: max_value},
        ],
        generateGradient: true
    };
    var target3 = document.getElementById(idCanvas);
    var gauge3 = new Gauge(target3).setOptions(opts);
    gauge3.maxValue = max_value;
    gauge3.setMinValue(0);
    gauge3.animationSpeed = 50;
    gauge3.set(value);
    gauge3.setTextField(document.getElementById(idTextField));
}
//fonctions pour l'affichage du CO2
function getValuekmByCar(gesDeskWifi,idObjToAppend) {

    //const kmByCar = Math.round(1000 * gCO2Total / GESgCO2ForOneKmByCar) / 1000;
    var gCO2Total =  gesDeskWifi* 10000;
    var GESgCO2ForOneKmByCar = 220;
    var kmByCar = Math.round((1000 * gCO2Total / GESgCO2ForOneKmByCar) / 1000);
    console.log(kmByCar)

    var span = document.getElementById(idObjToAppend);
    span.append(kmByCar)

}
function getValuekmByCar2(gesMob4G,idObjToAppend) {

    //const kmByCar = Math.round(1000 * gCO2Total / GESgCO2ForOneKmByCar) / 1000;
    var gCO2Total = gesMob4G * 10000;
    var GESgCO2ForOneKmByCar = 127;
    var kmByCar2 = Math.round((1000 * gCO2Total / GESgCO2ForOneKmByCar) / 1000);
    console.log(kmByCar2)

    var span = document.getElementById(idObjToAppend);
    span.append(kmByCar2)
}
function OneChargedSmartphone(gesDeskWifi,idObjToAppend) {

    //const chargedSmartphones = Math.round(gCO2Total / GESgCO2ForOneChargedSmartphone);
    //GESgCO2ForOneChargedSmartphone = 8.3
    var gCO2Total = gesDeskWifi * 10000;
    var GESgCO2ForOneChargedSmartphone = 8.3;
    var OneChargedSmartphone = Math.round((1000 * gCO2Total / GESgCO2ForOneChargedSmartphone) / 1000);
    console.log(OneChargedSmartphone)

    var span = document.getElementById(idObjToAppend);
    span.append(OneChargedSmartphone)

}
function OneChargedSmartphone2(gesMob4G,idObjToAppend) {

    //const kmByCar = Math.round(1000 * gCO2Total / GESgCO2ForOneKmByCar) / 1000;
    var gCO2Total = gesMob4G * 10000;
    var GESgCO2ForOneChargedSmartphone = 8.3;
    var OneChargedSmartphone2 = Math.round((1000 * gCO2Total / GESgCO2ForOneChargedSmartphone) / 1000);
    console.log(OneChargedSmartphone2)

    var span = document.getElementById(idObjToAppend);
    span.append(OneChargedSmartphone2)

}