'use strict';

var app = angular.module('AlpGatewayApp', [
  'ngRoute',
  'mobile-angular-ui',
  'mobile-angular-ui.gestures'
]);


app.config(function($routeProvider) {
  $routeProvider.when('/', {templateUrl: '../javascripts/home.html', reloadOnSearch: false});
  $routeProvider.when('/showAdd', {templateUrl: '../javascripts/showAdd.html', reloadOnSearch: false});
});

app.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
}]);

app.controller('MainController', function($rootScope, $scope, $http) {

  $scope.showAdd = function() {
  	console.log("show add device");
  	location.href="#/showAdd"
  };

  $scope.addPlug = function() {
  	console.log("add plug");
		$http({
		  method: 'GET',
		  url: '/add/plug'
		}).then(function successCallback(response) {
		    // this callback will be called asynchronously
		    // when the response is available
		    console.log(response);
		  }, function errorCallback(response) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		  });
  };

  $scope.addSwitch = function(){
  	console.log ($scope.addMessage);
  	$scope.addMessage = "abc";
  	console.log ($scope.addMessage);
  }


});

