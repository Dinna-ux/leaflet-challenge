// Initialize Leaflet map centered on the world
var map = L.map('map').setView([0, 0], 2);

// Add OpenStreetMap base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// URL to fetch earthquake GeoJSON data from USGS (past week)
var url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Use D3 to fetch the GeoJSON data
d3.json(url).then(function(data) {
  // Add GeoJSON layer with earthquake markers
  L.geoJSON(data, {
    pointToLayer: function(feature, latlng) {
      // Adjust circle marker size based on earthquake magnitude
      var radius = Math.sqrt(feature.properties.mag) * 10; // Example scaling
      
      // Define color based on magnitude
      var fillColor = getColor(feature.properties.mag);
      
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
        '<br>Date: ' + date.toUTCString() // Convert date to string
      );
    }
  }).addTo(map);
}).catch(function(error) {
  console.log('Error fetching earthquake data:', error);
});

// Function to assign color based on magnitude
function getColor(magnitude) {
  return magnitude > 5 ? '#230159' :   // Red for magnitude greater than 5
         magnitude > 4 ? '#fc8d15' :   // Orange for magnitude greater than 4
         magnitude > 3 ? '#751e87' :   // Yellow for magnitude greater than 3
         magnitude > 2 ? '#340D3F' :   // Green for magnitude greater than 2
         magnitude > 1 ? '#BE9F23' :   // Light Blue for magnitude greater than 1
                          '#2D5E61';   // Navy Blue for magnitude less than or equal to 1
}

// Add a legend to the map
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend'),
      grades = [5, 4, 3, 2, 1, 0],
      labels = ['5+', '4-5', '3-4', '2-3', '1-2', '0-1'];

  // Loop through the magnitude intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i class="color-box" style="background:' + getColor(grades[i] + 0.1) + '"></i> ' +
      labels[i] + '<br>';
  }

  return div;
};

legend.addTo(map);