'use strict';

var app = angular.module('AlpGatewayApp', [
  'ngRoute',
  'mobile-angular-ui',
  'mobile-angular-ui.gestures'
]);


app.config(function($routeProvider) {
  $routeProvider.when('/', {templateUrl: '../javascripts/home.html', reloadOnSearch: false});
  $routeProvider.when('/add', {templateUrl: '../javascripts/add.html', reloadOnSearch: false});
});

app.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
}]);

app.controller('SampleController', function($rootScope, $scope) {

  $scope.showYesNo = function() {
  	console.log("here");
  	location.href="#/add"
  };

});

