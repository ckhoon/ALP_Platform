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
  $routeProvider.when('/showSwitch', {templateUrl: '../javascripts/showSwitch.html', reloadOnSearch: false});
});

app.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
}]);

app.controller('MainController', function($rootScope, $scope, $http, SharedState) {
  //SharedState.initialize($scope, 'lightbulb');
  $rootScope.plugWaitStatus = false;
  $rootScope.waitStatus = false;
  $rootScope.timeoutID = -1;

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
        clearTimeout($rootScope.timeoutID);
        //clearTimeout($rootScope.timeoutID);
        $scope.refreshDevices();
      }
  });

  $rootScope.$on('$routeChangeStart', function() {
    $rootScope.loading = true;
  });

  $rootScope.$on('$routeChangeSuccess', function() {
    if (!$rootScope.plugWaitStatus && !$rootScope.waitStatus)
      $rootScope.loading = false;
  });

  $scope.showAdd = function() {
  	console.log("show add device");
  	location.href="#/showAdd"
  };
/*
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
*/
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
        $scope.devices = response.data;
      }, function errorCallback(response) {
        console.log( "failure message: " + response.data);
      });
  };

  $scope.trimName = function(txt){
    var regexAplha = /[^0-9a-z]/gi;
    txt = txt.replace(regexAplha, '');
    txt = txt.substr(txt.length-4);
    //var name = txt;
    //name.toString().substr(txt.length-4);
    //txt = txt.toString().subString(txt.length-4);
    return txt;
  };


  $scope.noConnection = false;

  $scope.getPlugStatus = function(){
    if($scope.activePlugId != -1)
    {
      var idJson = {id: $scope.activePlugId};
      var request = $http.post("/plug/status", idJson).then(function successCallback(res) {
        if ($rootScope.plugWaitStatus){
          $rootScope.plugWaitStatus = false;
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
      $rootScope.timeoutID = setTimeout($scope.getPlugStatus,2000);
    }
  };

  $scope.showPlug = function(plugId){
    console.log("showPlug - " + plugId);
    location.href="#/showPlug";
    $scope.activePlugId = plugId;
    $rootScope.plugWaitStatus = true;
    $rootScope.timeoutID = setTimeout($scope.getPlugStatus,2000);
  };

  $scope.delPlug = function(plugId, event){
    console.log("delPlug - " + plugId);
    event.stopPropagation();
    var idJson = {id: plugId};
    console.log(idJson);
    var request = $http.post("/plug/del", idJson).then(function successCallback(res) {
      console.log(res.data);
    }, function errorCallback(res) {
      console.log( "failure message: " + res.data);
    });
    $scope.refreshDevices();
  };

  $scope.plugTurnOn= function(){
    clearTimeout($rootScope.timeoutID);
    $rootScope.timeoutID = setTimeout($scope.getPlugStatus,3000);
    var idJson = {id: $scope.activePlugId};
    console.log(idJson);
    var request = $http.post("/plug/turnOn", idJson).then(function successCallback(res) {
      console.log(res.data);
    }, function errorCallback(res) {
      console.log( "failure message: " + res.data);
    });
  };

  $scope.plugTurnOff= function(){
    clearTimeout($rootScope.timeoutID);
    $rootScope.timeoutID = setTimeout($scope.getPlugStatus,3000);
    var idJson = {id: $scope.activePlugId};
    var request = $http.post("/plug/turnOff", idJson).then(function successCallback(res) {
      console.log(res.data);
    }, function errorCallback(res) {
      console.log( "failure message: " + res.data);
    });
  };


});

