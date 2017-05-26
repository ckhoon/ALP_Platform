'use strict';

angular.
	module('AlpGatewayApp').
		controller('BleController', function($rootScope, $scope,  $http) {

			$scope.addSwitch = function(){
				console.log("add switch");
		    $rootScope.addMessage = "Scanning...";
				$http({
				  method: 'GET',
				  url: '/add/switchBle'
				}).then(function successCallback(response) {
					console.log(response.data.id);
					if (response.data.id == -1)
						$rootScope.addMessage = "No new switch found";
					else
						$rootScope.addMessage = "New switch added. Id - " + response.data.id;
				}, function errorCallback(response){
					console.log("error message : " + response.data);
				});
			};

		});

angular.
	module('AlpGatewayApp').
		controller('MCController', function($rootScope, $scope,  $http) {

			$scope.addCabinet = function(){
				console.log("add cabinet");
		    $rootScope.addMessage = "Scanning...";
				$http({
				  method: 'GET',
				  url: '/add/cabinetBle'
				}).then(function successCallback(response) {
					console.log(response.data.id);
					if (response.data.id == -1)
						$rootScope.addMessage = "No new cabinet found";
					else
						$rootScope.addMessage = "New cabinet added. Id - " + response.data.id;
				}, function errorCallback(response){
					console.log("error message : " + response.data);
				});
			};

		});

angular.
	module('AlpGatewayApp').
		controller('ctrlBleHome', function($rootScope, $scope,  $http) {
			$rootScope.activeSwitch = {id : -1};

		  $scope.delSwitch = function(switchID, event){
		    console.log("delSwitch - " + switchID);
		    var idJson = {id: switchID};
		    console.log(idJson);
		    var request = $http.post("/switch/del", idJson).then(function successCallback(res) {
		      console.log(res.data);
		    }, function errorCallback(res) {
		      console.log( "failure message: " + res.data);
		    });
		    $scope.refreshDevices();
		  };

		  $scope.showSwitch = function(switchID){
		    console.log("showSwitch - " + switchID);
		    location.href="#/showSwitch";
		    $rootScope.activeSwitch.id = switchID;
		    $rootScope.waitStatus = true;
		    $rootScope.timeoutID = setTimeout($scope.getSwitchStatus,2000);
		  };

		  $scope.getSwitchStatus = function(){
		    if($rootScope.activeSwitch.id != -1)
		    {
		      var idJson = {id: $rootScope.activeSwitch.id};
		      var request = $http.post("/switch/status", idJson).then(function successCallback(res) {
		        if ($rootScope.waitStatus){
		          $rootScope.waitStatus = false;
		          $rootScope.loading = false;
		        }

		        if (res.data.status == -1){
		          $rootScope.activeSwitch.status = false;
		          $rootScope.activeSwitch.noConnection = true;
		        }
		        else{
		          $rootScope.activeSwitch.noConnection = false;
		          $rootScope.activeSwitch.status = res.data.status;
		        }

		        console.log($rootScope.activeSwitch.status);
		      }, function errorCallback(res) {
		        console.log( "failure message: " + res.data);
		      });
		      $rootScope.timeoutID = setTimeout($scope.getSwitchStatus,2000);
		    }
		  };

		});

angular.
	module('AlpGatewayApp').
		controller('ctrlBleShow', function($rootScope, $scope,  $http) {

		});

