// this is the code

// Create the tile layers for the map backgrounds of the map
var defaultMap = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
);
  
// Grayscale layer
var grayscale = L.tileLayer(
    "https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.{ext}",
    {
      minZoom: 0,
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      ext: "png",
    }
);
  
// Watercolor layer
var waterColor = L.tileLayer(
    "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.{ext}",
    {
      minZoom: 1,
      maxZoom: 16,
      attribution:
        '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      ext: "jpg",
    }
);
  
// Topography layer
var topoMap = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 17,
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    }
);
  
// Satellite layer
var satellite = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'jpg'
});
  
// Outdoors layer
let outdoors = L.tileLayer('https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});
  
// Basemaps object
let basemaps = {
    GrayScale: grayscale,
    "Water Color": waterColor,
    "Topography": topoMap,
    Default: defaultMap,
    Satellite: satellite, 
    Outdoors: outdoors
};
  
// Create the map object
var myMap = L.map("map", {
    center: [36.7783, -119.4179], 
    zoom: 5,
    layers: [defaultMap, grayscale, waterColor, topoMap, satellite, outdoors], 
});

// add the default map to the map
defaultMap.addTo(myMap);

// Create layer groups for earthquakes and tectonic plates
let earthquakes = new L.layerGroup();
let tectonicPlates = new L.layerGroup();
  
// Fetch and plot tectonic plate data
d3.json(
    "https://raw.githubusercontent.com/fraxen/tectonicplates/refs/heads/master/GeoJSON/PB2002_boundaries.json").then(function (plateData) {
    L.geoJson(plateData, {
      color: "yellow",
      weight: 2,
    }).addTo(tectonicPlates);
});
  
// Add tectonic plates to the map
tectonicPlates.addTo(myMap);
  
// Fetch and plot earthquake data
d3.json(
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (earthquakeData) {
    // Function to determine marker color based on depth
    function dataColor(depth) {
      if (depth > 90) return "red";
      else if (depth > 70) return "#fc4903";
      else if (depth > 50) return "#fc8403";
      else if (depth > 30) return "#fcad03";
      else if (depth > 10) return "#cafc03";
      else return "green";
    }
  
    // Function to determine marker size based on magnitude
    function radiusSize(mag) {
      return mag === 0 ? 1 : mag * 4;
    }
  
    // Function to set marker style
    function dataStyle(feature) {
      return {
        opacity: 0.7,
        fillOpacity: 0.7,
        fillColor: dataColor(feature.geometry.coordinates[2]),
        color: "#000000",
        radius: radiusSize(feature.properties.mag),
        weight: 0.5,
        stroke: true,
      };
    }
  
    // Add GeoJSON data to earthquakes layer group
    L.geoJson(earthquakeData, {
      pointToLayer: function (feature, latLng) {
        return L.circleMarker(latLng);
      },
      style: dataStyle,
      onEachFeature: function (feature, layer) {
        layer.bindPopup(
          `Magnitude: <b>${feature.properties.mag}</b><br>Depth: <b>${feature.geometry.coordinates[2]}</b><br>Location: <b>${feature.properties.place}</b>`
        );
      },
    }).addTo(earthquakes);
  });
  
// Add earthquakes layer to the map
earthquakes.addTo(myMap);
  
// Overlays object
let overlays = {
    "Tectonic Plates": tectonicPlates,
    Earthquakes: earthquakes,
};
  
// Add layer control
L.control.layers(basemaps, overlays).addTo(myMap);
  
// Create a legend
let legend = L.control({ position: "bottomright" });
  
legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let intervals = [-10, 10, 30, 50, 70, 90];
    let colors = [
      "green",
      "#cafc03",
      "#fcad03",
      "#fc8403",
      "#fc4903",
      "red",
    ];
  
    for (var i = 0; i < intervals.length; i++) {
      div.innerHTML +=
        "<i style='background: " +
        colors[i] +
        "'></i> " +
        intervals[i] +
        (intervals[i + 1] ? "–" + intervals[i + 1] + " km<br>" : "+ km");
    }
    return div;
  };
  
  // Add legend to the map
  legend.addTo(myMap);
  