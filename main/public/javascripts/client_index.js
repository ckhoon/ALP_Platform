'use strict';

var app = angular.module('AlpGatewayApp', [
  'ngRoute',
  'mobile-angular-ui',
  'mobile-angular-ui.gestures',
  'mobile-angular-ui.core.sharedState',
  'oc.lazyLoad'
]);

app.config(function($routeProvider) {
  $routeProvider.when('/', {templateUrl: '../javascripts/home.html', reloadOnSearch: false});
  $routeProvider.when('/showAdd', {templateUrl: '../javascripts/showAdd.html', reloadOnSearch: false});
  $routeProvider.when('/showXbeePlug', {templateUrl: '../javascripts/showPlug.html', reloadOnSearch: false});
  $routeProvider.when('/showSwitch', {templateUrl: '../javascripts/showSwitch.html', reloadOnSearch: false});
  $routeProvider.when('/showBlePlug', {templateUrl: '../javascripts/showBlePlug.html', reloadOnSearch: false});
  $routeProvider.when('/showBleDoor', {templateUrl: '../javascripts/showBleDoor.html', reloadOnSearch: false});
  $routeProvider.when('/showRule', {templateUrl: '../javascripts/showRule.html', reloadOnSearch: false});
  $routeProvider.when('/showRules', {templateUrl: '../javascripts/showRules.html', reloadOnSearch: false});
});

app.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
}]);

app.controller('MainController', function($rootScope, $scope, $http, SharedState, $ocLazyLoad) {
  //$ocLazyLoad.load('../javascripts/client_blePlug.js');
  $rootScope.waitStatus = false;
  $rootScope.timeoutID = -1;
  $scope.devices = [];
  $rootScope.rules = [];

  $scope.$on("$routeChangeStart", function(event, newUrl, oldUrl) {
    if (newUrl)
      if (newUrl.$$route.originalPath == "/"){
        console.log("refresh devices");
        clearTimeout($rootScope.timeoutID);
        $scope.refreshDevices();
      }else if (newUrl.$$route.originalPath == "/showRules"){
        console.log("refresh rules");
        clearTimeout($rootScope.timeoutID);
        $scope.refreshRules();        
      }
  });

  $rootScope.$on('$routeChangeStart', function() {
    $rootScope.loading = true;
  });

  $rootScope.$on('$routeChangeSuccess', function() {
    if (!$rootScope.waitStatus)
      $rootScope.loading = false;
  });

  $scope.showAdd = function() {
  	console.log("show add device");
  	location.href="#/showAdd"
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

  $scope.refreshRules = function(){
    $rootScope.rules = [];

    $http({
      method: 'GET',
      url: '/refreshRules'
    }).then(function successCallback(response) {
        console.log(response.data);
        if(response.data.rules)
          $rootScope.rules = response.data.rules;
      }, function errorCallback(response) {
        console.log( "failure message: " + response.data);
      }
    );
  };

  $scope.trimName = function(txt){
    var regexAplha = /[^0-9a-z]/gi;
    txt = txt.replace(regexAplha, '');
    txt = txt.substr(txt.length-4);
    return txt;
  };

});

