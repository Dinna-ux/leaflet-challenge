// Initialize Leaflet map centered on the world
map = L.map('map').setView([0, 0], 2);

// Define base layers
  streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

  topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
});

// Add default base layer
streetMap.addTo(map);

// Define layer groups
     earthquakes = L.layerGroup();
     tectonicPlates = L.layerGroup();

// Fetch and display earthquake data
earthquakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

d3.json(earthquakeUrl).then(function(data) {
  L.geoJSON(data, {
    pointToLayer: function(feature, latlng) {
      radius = Math.sqrt(feature.properties.mag) * 10;
      fillColor = getColor(feature.geometry.coordinates[2]);
      date = new Date(feature.properties.time);
      
      return L.circleMarker(latlng, {
        radius: radius,
        fillColor: fillColor,
        color: '#fff',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).bindPopup(
        'Magnitude: ' + feature.properties.mag.toFixed(1) +
        '<br>Location: ' + feature.properties.place +
        '<br>Depth: ' + feature.geometry.coordinates[2] + ' km' +
        '<br>Date: ' + date.toUTCString()
      );
    }
  }).addTo(earthquakes);
}).catch(function(error) {
  console.log('Error fetching earthquake data:', error);
});

// Fetch and display tectonic plates data
tectonicPlatesUrl = 'tectonic_plates.json';  

d3.json(tectonicPlatesUrl).then(function(data) {
  L.geoJSON(data, {
    style: function() {
      return {
        color: '#fff069',
        weight: 2
      };
    }
  }).addTo(tectonicPlates);
}).catch(function(error) {
  console.log('Error fetching tectonic plates data:', error);
});

// Function to assign color based on depth
function getColor(depth) {
  return depth > 90 ? '#230159' :
         depth > 70 ? '#fc8d15' :
         depth > 50 ? '#751e87' :
         depth > 30 ? '#340D3F' :
         depth > 10 ? '#BE9F23' :
                      '#f505057a';
}

// Add layer control
   baseMaps = {
  "Street Map": streetMap,
  "Topographic Map": topoMap
};

overlayMaps = {
  "Earthquakes": earthquakes,
  "Tectonic Plates": tectonicPlates
};

L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

// Add a legend for depth
legendDepth = L.control({ position: 'bottomright' });

legendDepth.onAdd = function (map) {
      div = L.DomUtil.create('div', 'info legend'),
      depths = [-10, 10, 30, 50, 70, 90],
      labels = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];

  for (i = 0; i < depths.length; i++) {
    div.innerHTML +=
      '<i class="color-box" style="background:' + getColor(depths[i] + 0.1) + '"></i> ' +
      labels[i] + '<br>';
  }

  return div;
};

legendDepth.addTo(map);
