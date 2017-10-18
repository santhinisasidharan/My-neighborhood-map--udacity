/* globals ko */
/* globals google */
/* globals $ */

// Initial data
var locations = [
    {
        title: "Kovalam",
        location: {
            lat: 8.400398,
            lng: 76.978708
    }},
    {
        title: "Shangumugham Beach",
        location: {
            lat: 8.47845,
            lng: 76.911906
    }},
    {
        title: "Padmanabhaswamy Temple",
        location: {
            lat: 8.482778,
            lng: 76.943591
    }},
    {
        title: "Napier Museum",
        location: {
            lat: 8.508959,
            lng: 76.955176
    }},
    {
        title: "Thiruvananthapuram Zoo",
        location: {
            lat: 8.510406,
            lng: 76.955477
    }},
    {
        title: "Varkala Beach",
        location: {
            lat: 8.735552,
            lng: 76.703167
    }},
    {
        title: "Ponmudi",
        location: {
            lat: 8.759942,
            lng: 77.116875
    }},
     {
        title: "Aakulam",
        location: {
            lat: 8.533491,
            lng: 76.904744
    }}
];

var map;
var markers=[];
var largeInfoWindow;
var bounds;

//google maps callback function
var initMap = function () {
    "use strict";
    var self = this;
    // create a new map
    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 8.524139, lng: 76.936638},
        zoom: 0,
        scrollwheel:false
    });
    // Add infoWindow
    largeInfoWindow = new google.maps.InfoWindow({maxWidth: 500});

    // Add boundaries to fit any view
    bounds = new google.maps.LatLngBounds();

    //create a marker on each location
    self.addMarker = function(loc,i){
        var highlightedIcon = makeMarkerIcon("FFFF24");
        var defaultIcon = makeMarkerIcon("0091ff");
        var title = loc.title;
        var position = loc.location;

        // Creating the marker on each location
        var marker = new google.maps.Marker({
            title: title,
            position: position,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
        });
        
        markers.push(marker);
        loc.marker =marker;

        // Two event listeners - one for mouseover, one for mouseout
        marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
          });
        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
          });
    };
    // create an array of markers
    for (var i = 0; i < locations.length; i++) {
        this.addMarker(locations[i],i);
    }
    // Styling the markers, highlight when hover
    // This function takes in a COLOR, and then creates a new marker
    // icon of that color. The icon will be 21 px wide by 34 high, have an origin
    // of 0, 0 and be anchored at 10, 34).
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
            '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
      }
};



var viewModel = function () {
    "use strict";
    var self = this;
    self.filter =ko.observable("");
    self.observableLocations = ko.observableArray([]);

    
    //check needed
    for(var i=0; i<locations.length;i++){
        self.observableLocations.push(locations[i]);
    }
    //click event for map
    self.clickMap = function(){
        map.addListener('click',function(){
           if (largeInfoWindow) {
                largeInfoWindow.close();
                largeInfoWindow = new google.maps.InfoWindow({maxWidth: 350});     
            }});

    };
    //click event after map is loaded
    if(map){
        self.clickMap();
            }
    else {
        setTimeout(function () {
        self.clickMap();
        }, 1000);
    }

    //animation for markers
    function addAnimation(marker){
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function () {
                marker.setAnimation(null);
            }, 700);
            }
        }

    //click event for marker
    self.clickMarker = function(clickme){
        clickme.addListener('click',function(){
                map.setCenter(clickme.getPosition());
                addAnimation(clickme); 
                self.populateInfoWindow(clickme);
            });

    };
    
    // Show all markers when map loaded
    self.showListings = function () {
        for (var i = 0; i < markers.length; i++) {
            self.closeInfoWindow();
            markers[i].setAnimation(google.maps.Animation.DROP);
            markers[i].setMap(map);
            self.clickMarker(markers[i]);
            bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
    };

    // Current marker info pops up at selection of location from list
    self.popupCurrentMarker = function (location) {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].title === location.title) {
                self.closeInfoWindow();
                map.setCenter(markers[i].getPosition());
                addAnimation(markers[i]);
                return self.populateInfoWindow(markers[i]);
            }
        }
    }; 

    // to close the currently opened infowindow
    self.closeInfoWindow = function () {
        if (largeInfoWindow) {
            largeInfoWindow.close();
            largeInfoWindow = new google.maps.InfoWindow({maxWidth: 500});
        }
    };

    //to show all markers once map is loaded
    if (map){
    self.showListings();
    } else {
        setTimeout(function () {
        self.showListings();
        }, 1000);
    }

    //Populate the infowindow when marker is clicked
    self.populateInfoWindow = function(marker){
        self.closeInfoWindow();
        // load Wikipedia API data
        var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + marker.title;
        var wikiRequestTimeout = setTimeout(function(){
            window.console.log('Could not load Wikipedia API');
            largeInfoWindow.setContent(
                '<strong>Error! </strong><span>Could not load Wikipedia resources!!</span>' +
                '</div>');
        }, 3000);

        $.ajax({
            url: wikiUrl,
            dataType: "jsonp",
            jsonp: "callback",
            success: function( response ) {
                //var articleStr=[];
                var articleList = response[1];
                var articleSummary = response[2];
                var articleUrl = response[3];
                //alert(articleList);
                var contentString=      '<div class="infocontents">'+
                                        '<h4><strong>' + marker.title + '</strong></h4>' +
                                        '<h5>Details</h5>' +
                                        '<p>' + articleSummary + '</p>' +
                                        '<h5>Click for more information</h5>' +
                                        '<a target="_blank" href="' + articleUrl + '">' + articleUrl + '</a>'+
                                        '<h6>Source: Wikipedia</h6>'+
                                        '</div>';
    
                largeInfoWindow.setContent(contentString);
                    //};

                clearTimeout(wikiRequestTimeout);
            }
        });
            largeInfoWindow.open(map, marker);

            // Make sure the marker property is cleared if the infowindow is closed.
            largeInfoWindow.addListener('closeclick', function() {
                largeInfoWindow.marker = null;
            });
    };
    //filter based on search
    self.filteredList= ko.computed(function(){
        var newList=[];
        var filter = self.filter().toLowerCase();
        if (!filter) {
            return self.observableLocations();
        } else {
            ko.utils.arrayForEach(self.observableLocations(), function (element) {
                var currentTitle = element.title.toLowerCase();
                var currentText = filter.toLowerCase();
                if (currentTitle.indexOf(currentText) !== -1) {
                    newList.push(element);
                    element.marker.setMap(map);
                }
                else{
                    element.marker.setMap(null);
                }
                        
            });
            return newList;
        } 
    });
};
ko.applyBindings(new viewModel());
// Handling Google Maps API errors
var errorHandle = function () {
    alert('Could not load Google Maps API');
};

