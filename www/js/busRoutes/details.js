window.infoWindow=null;
angular.module('app.details', [])
  .controller('DetailsController', function($scope, route, LocationService, userLocation, RestBusService, MapService, VehiclesService, YelpService, SimpleAuthService, FirebaseService) {
    if(SimpleAuthService.authData) $scope.user = 'User: ' + SimpleAuthService.authData.password.email;
    RestBusService.getRouteDetailed(route.route.id) //since the app.details stateparams only use the uniqId for now, it doesn't have the route info so we can't do it all in the app.js router part like they did for route
    .then(function(data) {
      $scope.stops = data.stops;
      $scope.stopMarkers = [];
      //$scope.stops = data.stops;
      //_.pluck(data.stops,
      data.stops.forEach(function(stop, index) {
        $scope.visitedStops = FirebaseService.getVisitedStops();

        // if($scope.visitedStops.indexOf(stop.id) > -1) 
        $scope.stopMarkers[index] = MapService.createMarker($scope.map, {latitude: stop.lat, longitude: stop.lon}, './img/stop.png');

        //create event listener
        google.maps.event.addListener($scope.stopMarkers[index], 'click', function() {
          console.log('clicked stop');
          if(window.infoWindow){
            window.infoWindow.close();
            window.infoWindow = null;
          }
          YelpService.getLocalBusinesses({latitude: stop.lat, longitude: stop.lon}, function(data) {
            console.log(data);
            var place = data[YelpService.feelingLucky(data.length)];
            window.infoWindow = new google.maps.InfoWindow({
              content: YelpService.formatData(place)
            });
            window.infoWindow.open($scope.map, $scope.stopMarkers[index]);
          });
        });
      });
      var stopLocs = [];
      for (var i = 0; i < data.stops.length; i++) {
        stopLocs.push([data.stops[i].lat,data.stops[i].lon]);
      }
      MapService.createRouteLine(stopLocs,$scope.map);
      google.maps.event.addDomListener(window, 'load');
    });
    $scope.route = route;
    //testing for yelp
    // RestBusService.getRouteDetailed(route.route.id)
    // .then(function(data){
    //   console.log(data);
    //   YelpService.getYelpForRoute(data, function(results){
    //     console.dir(results);
    //   });
    // });
    $scope.userLocation = userLocation;
    $scope.map = MapService.createMap($scope.userLocation);
    $scope.userMarker = MapService.createMarker($scope.map, $scope.userLocation, './img/user.png');
    $scope.vehicleMarkers = MapService.displayVehicles($scope.map, $scope.route, './img/bus.png');
    RestBusService.getStationLocation($scope.map, route, './img/station.png');
    
  //Called from ionic pulldown refresh
  $scope.doRefresh = function() {
    MapService.refreshUserMarker($scope.userMarker);
    MapService.refreshVehicleMarkers($scope.vehicleMarkers);

    $scope.$broadcast('scroll.refreshComplete');
  };

  //Initial page load
  $scope.doRefresh();

});


//testStops will include mock testStops
//mock 

//need to display yelp icon
