// Initialize Leaflet map centered on the world
var map = L.map('map').setView([0, 0], 2);

// Add OpenStreetMap base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// URL to fetch earthquake GeoJSON data from USGS (past week)
var url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// D3 to fetch the GeoJSON data
d3.json(url).then(function(data) {
  // Add GeoJSON layer with earthquake markers
  L.geoJSON(data, {
    pointToLayer: function(feature, latlng) {
      // Adjust circle marker size based on earthquake magnitude
      var radius = Math.sqrt(feature.properties.mag) * 10; 
      
      // Define color based on depth
      var fillColor = getColor(feature.geometry.coordinates[2]); 
      
      // Convert timestamp to date
      var date = new Date(feature.properties.time);
      
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
        '<br>Date: ' + date.toUTCString() // Convert date to string
      );
    }
  }).addTo(map);
}).catch(function(error) {
  console.log('Error fetching earthquake data:', error);
});

// Function to assign color based on depth
function getColor(depth) {
  return depth > 90 ? '#230159' :   // Dark Purple for depth greater than 90
         depth > 70 ? '#fc8d15' :   // Orange for depth greater than 70
         depth > 50 ? '#751e87' :   // Purple for depth greater than 50
         depth > 30 ? '#340D3F' :   // Dark Maroon for depth greater than 30
         depth > 10 ? '#BE9F23' :   // Gold for depth greater than 10
                      '#f505057a';  // Light Red for depth less than or equal to 10
}

// Add a legend to the map
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend'),
      depths = [-10, 10, 30, 50, 70, 90],
      labels = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];

  // Loop through the depth intervals and generate a label with a colored square for each interval
  for (var i = 0; i < depths.length; i++) {
    div.innerHTML +=
      '<i class="color-box" style="background:' + getColor(depths[i] + 0.1) + '"></i> ' +
      labels[i] + '<br>';
  }

  return div;
};

legend.addTo(map);
