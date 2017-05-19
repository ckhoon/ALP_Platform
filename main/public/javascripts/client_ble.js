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
		controller('ctrlBleHome', function($rootScope, $scope,  $http) {

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

		});
