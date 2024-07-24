const $doc = document;     //simbolo dolar p/señalizar que esta constante pertenece a un elemento del DOM

const $selectProvincias = $doc.getElementById("selectProvincias");
const $selectDepartamento = $doc.getElementById("selectDepartamento");
const $selectLocalidad = $doc.getElementById("selectLocalidad");

const container = $doc.getElementsByClassName('container')  //no funciona
const $mapa = $doc.getElementById("mi_mapa");



//---Funcion para llamar a las provincias---
function provincia(){
    fetch("https://apis.datos.gob.ar/georef/api/provincias")
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(json => {
        let $opciones = `<option value="Elige una provincia">Elige una provincia</option>`;

        json.provincias.forEach(eleme => $opciones += `<option value="${eleme.nombre}">${eleme.nombre}</option>`);
        
        $selectProvincias.innerHTML = $opciones;
    })
    .catch(error => {
        let message = error.statusText ||"ocurrio un error al conectar con la API";

        $selectProvincias.nextElementSibling.innerHTML = `Errorx ${error.status}: ${message}`;
    })
}

$doc.addEventListener("DOMContentLoaded", provincia)

function departamento(provincia){
    fetch(`https://apis.datos.gob.ar/georef/api/departamentos?provincia=${provincia}&max=25`)
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(json =>{
        let $opciones = `<option value="Elige un departamento>Elige un departamento</option>`;

        json.departamentos.forEach(eleme => $opciones += `<option value="${eleme.id}">${eleme.nombre}</option>`)

        $selectDepartamento.innerHTML = $opciones;
    })
    .catch(error => {
        let message = error.statusText ||"ocurrio un error al conectar con la API";

        $selectDepartamento.nextElementSibling.innerHTML = `Error ${error.status}: ${message}`;
    })
}

$selectProvincias.addEventListener("change", e =>{
    departamento(e.target.value);
})


function localidad(departamento){
    fetch(`https://apis.datos.gob.ar/georef/api/localidades?departamento=${departamento}`)
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(json => {
        let $opciones = `<option value="Elige una localidad">Elige una localidad</option>`;

        json.localidades.forEach(eleme => $opciones += `<option value="${eleme.id}">${eleme.nombre}</option>`)

        $selectLocalidad.innerHTML = $opciones;
    })
    .catch(error =>{})
}

$selectDepartamento.addEventListener("change",e =>{  //cuando se selecciona un dpto, se llama a la funcion localidad
    localidad(e.target.value);                      //la funcion localidad recibe el parametro departamento, "e.target.value"
})


function coordenadas(localidad){
    
    fetch(`https://apis.datos.gob.ar/georef/api/localidades-censales?id=${localidad}`)
    .then(res => res.json())
    .then(data =>{

        var latitud = data.localidades_censales[0].centroide.lat
        var longitud = data.localidades_censales[0].centroide.lon

        console.log(`Las coordenadas son: ${latitud} y ${longitud}`)
       

        if(!document.getElementById("mi_mapa")){    //si no existe el mapa, lo crea
    
            var container_map = document.createElement('div');
            container_map.id = 'mi_mapa'
    
            container[0].appendChild(container_map)
            
        }else{
            mi_mapa.remove();      //si ya existe un mapa, lo borra, despues crea uno
            var container_map = document.createElement('div');
            container_map.id = 'mi_mapa'
            
            container[0].appendChild(container_map)
        }

        iniciarMap(latitud,longitud)   //inicializa el mapa con LeafLet

    
    }).catch(error =>{
        console.log(error)
        let message = error.statusText || "<p>Ocurrio un error al obtener coordenadas</p>";
        $mapa.innerHTML = message;
    })    
}


function iniciarMap(latitud,longitud){

    var map = L.map('mi_mapa').setView([latitud, longitud], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    
}).addTo(map);

    L.marker([latitud,longitud]).addTo(map)   //marker in the map

}


//----Esto se ejecuta solo cuando detecta cambio de localidad------
$selectLocalidad.addEventListener("change",e =>{
    coordenadas(e.target.value)  //con el valor de la localidad_censal seleccionada, se llama a la funcion coordenadas
    
})