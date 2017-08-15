'use strict';

angular.
	module('AlpGatewayApp').
		controller('BleBlindController', function($rootScope, $scope,  $http) {

			$scope.add = function(){
				console.log("add ble blind");
		    $rootScope.addMessage = "Scanning...";
				$http({
				  method: 'GET',
				  url: '/add/ble/blind'
				}).then(function successCallback(response) {
					console.log(response.data.id);
					if (response.data.id == -1)
						$rootScope.addMessage = "No new blind found";
					else
						$rootScope.addMessage = "New blind added. Id - " + response.data.id;
				}, function errorCallback(response){
					console.log("error message : " + response.data);
				});
			};

		});

angular.
	module('AlpGatewayApp').
		controller('ctrlBleBlindHome', function($rootScope, $scope,  $http) {
			$rootScope.activeDev = {id : -1};

		  $scope.delDev = function(devID, event){
		    console.log("del ble blind - " + devID);
        event.stopPropagation();
		    var idJson = {id: devID};
		    console.log(idJson);
		    var request = $http.post("/ble/blind/del", idJson).then(function successCallback(res) {
		      console.log(res.data);
		    }, function errorCallback(res) {
		      console.log( "failure message: " + res.data);
		    });
		    $scope.refreshDevices();
		  };

		  $scope.showDev = function(devID){
		    console.log("show ble blind - " + devID);
		    location.href="#/showBleBlind";
		    $rootScope.activeDev.id = devID;
		    $rootScope.waitStatus = true;
		    $rootScope.timeoutID = setTimeout($scope.getDevStatus,2000);
		  };

		  $scope.getDevStatus = function(){
		    if($rootScope.activeDev.id != -1)
		    {
		      var idJson = {id: $rootScope.activeDev.id};
		      var request = $http.post("/ble/blind/status", idJson).then(function successCallback(res) {
		        if ($rootScope.waitStatus){
		          $rootScope.waitStatus = false;
		          $rootScope.loading = false;
		        }

		        if (res.data.status == -1){
		          $rootScope.activeDev.status = false;
		          $rootScope.activeDev.noConnection = true;
		        }
		        else{
		          $rootScope.activeDev.noConnection = false;
		          $rootScope.activeDev.status = res.data.status;
		        }

		        console.log($rootScope.activeDev.status);
		      }, function errorCallback(res) {
		        console.log( "failure message: " + res.data);
		      });
		      $rootScope.timeoutID = setTimeout($scope.getDevStatus,2000);
		    }
		  };

		});

angular.
	module('AlpGatewayApp').
		controller('ctrlBleBlindShow', function($rootScope, $scope,  $http) {

			$scope.blindLeft= function(){
			  //clearTimeout($rootScope.timeoutID);
			  //$rootScope.timeoutID = setTimeout($scope.getDevStatus,3000);
		    var idJson = {id: $rootScope.activeDev.id};
			  console.log(idJson);
			  var request = $http.post("/ble/blind/turnLeft", idJson).then(function successCallback(res) {
			    console.log(res.data);
			  }, function errorCallback(res) {
			    console.log( "failure message: " + res.data);
			  });
			};

			$scope.blindRight= function(){
			  //clearTimeout($rootScope.timeoutID);
			  //$rootScope.timeoutID = setTimeout($scope.getDevStatus,3000);
		    var idJson = {id: $rootScope.activeDev.id};
			  var request = $http.post("/ble/blind/turnRight", idJson).then(function successCallback(res) {
			    console.log(res.data);
			  }, function errorCallback(res) {
			    console.log( "failure message: " + res.data);
			  });
			};

		});

