'use strict';

var app = angular.module('AlpGatewayApp', [
  'ngRoute',
  'mobile-angular-ui',
  'mobile-angular-ui.gestures'
]);


app.config(function($routeProvider) {
  $routeProvider.when('/', {templateUrl: '../javascripts/home.html', reloadOnSearch: false});
  $routeProvider.when('/showAdd', {templateUrl: '../javascripts/showAdd.html', reloadOnSearch: false});
  $routeProvider.when('/showPlug', {templateUrl: '../javascripts/showPlug.html', reloadOnSearch: false});
});

app.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
}]);

app.controller('MainController', function($rootScope, $scope, $http) {

  $scope.$on("$routeChangeStart", function(event, newUrl, oldUrl) {
    if (newUrl)
      if(newUrl.$$route.originalPath == "/callPlug")
      {
        console.log(newUrl.$$route.originalPath);
        $scope.callPlug("/test", 12345);
        alert("first before loading");
      }
      else if (newUrl.$$route.originalPath == "/"){
        console.log("refresh devices");
        $scope.refreshDevices();
      }
  });

  $scope.showAdd = function() {
  	console.log("show add device");
  	location.href="#/showAdd"
  };

  $scope.addPlug = function() {
  	console.log("add plug");
    $scope.addMessage = "Scanning...";
		$http({
		  method: 'GET',
		  url: '/add/plug'
		}).then(function successCallback(response) {
		    console.log(response.data.id);
        if (response.data.id == -1)
          $scope.addMessage = "No new plug found";
        else
          $scope.addMessage = "New plug added. Id - " + response.data.id;
		  }, function errorCallback(response) {
        console.log( "failure message: " + response.data);
		  });
  };

  $scope.addSwitch = function(){
  	$scope.addMessage = "Coming soon...";
  };

  $scope.callPlug= function(plugUrl, plugId){
    var idJson = {id: plugId};
    var request = $http.post(plugUrl, idJson).then(function successCallback(res) {
      console.log(res.data);
    }, function errorCallback(res) {
      console.log( "failure message: " + res.data);
    });
  };

  $scope.refreshDevices = function(){
    $scope.devices = [];

    $http({
      method: 'GET',
      url: '/refresh'
    }).then(function successCallback(response) {
        //$scope.devices = response.data;
        console.log(response.data);
        $scope.devices = response.data.plugs;
      }, function errorCallback(response) {
        console.log( "failure message: " + response.data);
      });
  };

  $scope.showPlug = function(plugId){
    console.log("showPlug - " + plugId);
    location.href="#/showPlug"
    $scope.activePlugId = plugId;
  };

  $scope.plugTurnOn= function(){
    var idJson = {id: $scope.activePlugId};
    console.log(idJson);
    var request = $http.post("/plug/turnOn", idJson).then(function successCallback(res) {
      console.log(res.data);
    }, function errorCallback(res) {
      console.log( "failure message: " + res.data);
    });
  };

  $scope.plugTurnOff= function(){
    var idJson = {id: $scope.activePlugId};
    var request = $http.post("/plug/turnOff", idJson).then(function successCallback(res) {
      console.log(res.data);
    }, function errorCallback(res) {
      console.log( "failure message: " + res.data);
    });
  };


});

