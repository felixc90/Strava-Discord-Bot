

// for(var x=0; x<data.length; x++){

//     console.log(data[x].map.summary_polyline)
//     var coordinates = L.Polyline.fromEncoded(data[x].map.summary_polyline).getLatLngs()
//     console.log(coordinates)

//     L.polyline(

//         coordinates,
//         {
//             color:"green",
//             weight:5,
//             opacity:.7,
//             lineJoin:'round'
//         }

//     ).addTo(map)
// }
async function createMap() {
    const url = 'http://localhost:3000/routes'
  
    fetch(url)
      .then(response => response.json())
      .then(json => {
        console.log(json)
        var map = L.map('map').setView([-33.8688, 151.2093], 11);
        console.log(map)
        L.tileLayer('	https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        const routes = json.routes
        for (let i = 0; i < routes.length; i++) {
            for (let j = 0; j < routes[i].polylines.length; j++) {
                console.log(routes[i].polylines[j])
                var coordinates = L.Polyline.fromEncoded(routes[i].polylines[j]).getLatLngs()
                L.polyline(coordinates,
                {color:"red",
                    weight:5,
                    opacity:.7,
                    lineJoin:'round'
                }).addTo(map)
            }
        }

      })
      .catch(error => console.log('Authorization failed : ' + error.message));
}
createMap()