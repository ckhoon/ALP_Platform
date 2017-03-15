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

  $scope.$on("$routeChangeStart", function(event, newUrl, oldUrl) {
    if (newUrl)
      if(newUrl.$$route.originalPath == "/")
      {
        console.log(newUrl.$$route.originalPath);
        alert("first before loading");
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
		    // this callback will be called asynchronously
		    // when the response is available
		    console.log(response.data.id);
        if (response.data.id == -1)
          $scope.addMessage = "No new plug found";
        else
          $scope.addMessage = "New plug added. Id - " + response.data.id;
		  }, function errorCallback(response) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		  });
  };

  $scope.addSwitch = function(){
  	$scope.addMessage = "Coming soon...";
  };

  $scope.callPlug= function(plugUrl, PlugId){
    var idJson = JSON.stringify({id: PlugId});
    $http({
      url: plugUrl,
      method: "POST",
      params: Indata
    })    
  };

  $scope.loadPlug = function(){
    
  }

});

