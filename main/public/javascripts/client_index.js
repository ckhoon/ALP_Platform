'use strict';

var app = angular.module('AlpGatewayApp', [
  'ngRoute',
  'mobile-angular-ui',
  'mobile-angular-ui.gestures',
  'mobile-angular-ui.core.sharedState'
]);


app.config(function($routeProvider) {
  $routeProvider.when('/', {templateUrl: '../javascripts/home.html', reloadOnSearch: false});
  $routeProvider.when('/showAdd', {templateUrl: '../javascripts/showAdd.html', reloadOnSearch: false});
  $routeProvider.when('/showPlug', {templateUrl: '../javascripts/showPlug.html', reloadOnSearch: false});
});

app.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
}]);

app.controller('MainController', function($rootScope, $scope, $http, SharedState) {
  //SharedState.initialize($scope, 'lightbulb');
  $scope.plugWaitStatus = false;

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
        clearTimeout($scope.timeoutID);
        $scope.refreshDevices();
      }
  });

  $rootScope.$on('$routeChangeStart', function() {
    $rootScope.loading = true;
  });

  $rootScope.$on('$routeChangeSuccess', function() {
    if (!$scope.plugWaitStatus)
      $rootScope.loading = false;
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

  $scope.noConnection = false;

  $scope.getPlugStatus = function(){
    if($scope.activePlugId != -1)
    {
      var idJson = {id: $scope.activePlugId};
      var request = $http.post("/plug/status", idJson).then(function successCallback(res) {
        if ($scope.plugWaitStatus){
          $scope.plugWaitStatus = false;
          $rootScope.loading = false;
        }
        if (res.data.status == -1){
          SharedState.set('lightbulb',0);
          $scope.noConnection = true;
        }
        else{
          $scope.noConnection = false;
          SharedState.set('lightbulb',res.data.status);
        }

        console.log(SharedState.get('lightbulb'));
      }, function errorCallback(res) {
        console.log( "failure message: " + res.data);
      });
      $scope.timeoutID = setTimeout($scope.getPlugStatus,2000);
    }
  };

  $scope.showPlug = function(plugId){
    console.log("showPlug - " + plugId);
    location.href="#/showPlug"
    $scope.activePlugId = plugId;
    $scope.plugWaitStatus = true;
    $scope.timeoutID = setTimeout($scope.getPlugStatus,2000);
  };

  $scope.plugTurnOn= function(){
    clearTimeout($scope.timeoutID);
    $scope.timeoutID = setTimeout($scope.getPlugStatus,3000);
    var idJson = {id: $scope.activePlugId};
    console.log(idJson);
    var request = $http.post("/plug/turnOn", idJson).then(function successCallback(res) {
      console.log(res.data);
    }, function errorCallback(res) {
      console.log( "failure message: " + res.data);
    });
  };

  $scope.plugTurnOff= function(){
    clearTimeout($scope.timeoutID);
    $scope.timeoutID = setTimeout($scope.getPlugStatus,3000);
    var idJson = {id: $scope.activePlugId};
    var request = $http.post("/plug/turnOff", idJson).then(function successCallback(res) {
      console.log(res.data);
    }, function errorCallback(res) {
      console.log( "failure message: " + res.data);
    });
  };


});

