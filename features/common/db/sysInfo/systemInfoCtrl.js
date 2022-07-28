/**
 Description: Controller for System Information
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
'use strict';
app.controller('systemInformationCtrl', ['$scope','$filter','DashletService','requestRoutingService','$interval','dashletReloadTime','$rootScope','getStringLineService','executeCliCmdService', function ($scope,$filter, dashletService,requestRoutingService,$interval,dashletReloadTime, $rootScope,getStringLineService,executeCliCmdService) {
	var translate = $filter("translate");
	(function () {
		// Clear setInterval if already present
		if($rootScope.sysInfoFetchLoop){
			$interval.cancel($rootScope.sysInfoFetchLoop);
		}
	//Refresh the system info for every 60 seconds
	$rootScope.sysInfoFetchLoop = $interval(function(){
		if(angular.element(".systemPower").length > 0){
			loadSystemInfo();
		} else {
			$interval.cancel($rootScope.sysInfoFetchLoop);
		}
	}, dashletReloadTime);
	}());
	//for initial load
	loadSystemInfo();
	function loadSystemInfo(){
	 var systemCLI="show power inline\n show env all\n";
	 var systemCLIOP = deviceCommunicatorCLI.getExecCmdOutput(systemCLI);
	 if($rootScope.deviceInfo.isPoECapable){
		$scope.powerStatus=true;
		var remainingPowers=0,remainingPower=0,poe=0,upoe=0,arrRemainingPower;
		//finding poe summary details
		remainingPower=executeCliCmdService.getNextString(systemCLIOP[0],["Remaining:"],["\n"]).trim();	
		var poeDetailsList = [];
		var portsMonPower =systemCLIOP[0];
		var arrPortsMonPower=portsMonPower.split("Interface")
		var masterPortNumber=$rootScope.deviceInfo.masterId;
		var arrPower=arrPortsMonPower[1].split("\n");
		for (var i=3; i < arrPower.length; i++) {
				var portsObj = {};
				var arrInnerWords = arrPower[i].split(" ");
				var portNumber="";				
				for (var k=0,j=1; k < arrInnerWords.length; k++) {
					if(arrInnerWords[k] == "") {
			 			continue;
		 			}
					if (j == 1) {
						portNumber=arrInnerWords[k].trim();
		 			}
					if (j == 4) {
						var masterPortIndex="Gi"+masterPortNumber;
						if(portNumber.indexOf(masterPortIndex)!=-1 || portNumber.indexOf(masterPortIndex)!=-1){
							portsObj["powerValue"]=arrInnerWords[k].trim();
							poeDetailsList.push(portsObj)
						}						
		 			}
		 		   	j++;
				}				
		}	
	
		if( ($rootScope.deviceInfo.type.indexOf("2960X")!=-1 && ($rootScope.deviceInfo.type != "WS-C2960X-24PSQ-L" && $rootScope.deviceInfo.type != "WS-C2960X-48TS-LL" &&
                $rootScope.deviceInfo.type != "WS-C2960X-24TS-LL" ))  || $rootScope.deviceInfo.type.indexOf("2960XR")!=-1 || ( $rootScope.deviceInfo.type.indexOf("C3560CX")!=-1 && $rootScope.deviceInfo.type.indexOf("PD-S")!=-1))
		{
			var strCLIOutput =systemCLIOP[0];
			var arrPower=strCLIOutput.split("\n");
			var arrInnerWords = arrPower[3].split(" ");
			for (var k=0,j=1; k < arrInnerWords.length; k++) {
				if(arrInnerWords[k] == "") {
		 			continue;
	 			}
				if (j == 4) {
	 				remainingPower=arrInnerWords[k];
	 				arrRemainingPower=remainingPower.split("(")
				    remainingPowers=arrRemainingPower[0];
	 			}
	 		   	j++;
			}
		}else{		
			if(remainingPower!=null && remainingPower!=""){
				arrRemainingPower=remainingPower.split("(")
			    remainingPowers=arrRemainingPower[0];
			}else{
				var strCLIOutput =systemCLIOP[0];
				var arrPower=strCLIOutput.split("\n");
				var switchId="";
				if($rootScope.deviceInfo.isStackingSupported){
				   for(var m=3;m < arrPower.length; m++) {
						var arrInnerWords = arrPower[m].split(" ");
						for (var k=0,j=1; k < arrInnerWords.length; k++) {
							if(arrInnerWords[k] == "") {
					 			continue;
				 			}
							if (j == 1) {
								switchId=arrInnerWords[k];
							}
							if (j == 4) {
								if(switchId==$rootScope.deviceInfo.masterId){
									remainingPower=arrInnerWords[k];
					 				arrRemainingPower=remainingPower.split("(")
								    remainingPowers=arrRemainingPower[0];
								}			 				
				 			}
				 		   	j++;
						}
				    }	
				}else{
					var arrInnerWords = arrPower[3].split(" ");
					for (var k=0,j=1; k < arrInnerWords.length; k++) {
						if(arrInnerWords[k] == "") {
				 			continue;
			 			}
						if (j == 4) {
			 				remainingPower=arrInnerWords[k];
			 				arrRemainingPower=remainingPower.split("(")
						    remainingPowers=arrRemainingPower[0];
			 			}
			 		   	j++;
					}
				}			
			}
		}
		for(var i=0;i<poeDetailsList.length;i++){
			if( (parseFloat(poeDetailsList[i].powerValue)) > 30 ){
				upoe=parseFloat(upoe) + parseFloat(poeDetailsList[i].powerValue);
			}else{
				poe=parseFloat(poe) + parseFloat(poeDetailsList[i].powerValue);
			}
		}
		upoe = upoe.toFixed(1);
		poe = poe.toFixed(1);		
		//Power utilization chart
		if($rootScope.deviceInfo.type.indexOf("2960L")!=-1 || $rootScope.deviceInfo.type.indexOf("C1000")!=-1){
			angular.element("#powerChart").kendoChart({
	             legend: {
	                position: "bottom"
	             },
	             chartArea:{
	                 height:260
	             },
	             seriesColors: ["#9EC654","#FFFF00"],
	             series: [{
	                 type: "pie",
					 overlay: {
						gradient: "none"
					 },
	                 data: [{
	                     category:translate("db_power_unused"),
	                     value: remainingPowers
	                 }, {
	                     category:translate("db_power_poe"),
	                     value: poe
	                 }]
	             }],
	             tooltip: {
	                 visible: true,
	                 template: "#= category #: #= value # w"
	             }
	         });
		}else{
			angular.element("#powerChart").kendoChart({
	             legend: {
	                position: "bottom"
	             },
	             chartArea:{
	                 height:260
	             },
	             seriesColors: ["#9EC654","#FFFF00","#FF0000"],
	             series: [{
	                 type: "pie",
					 overlay: {
						gradient: "none"
					 },
	                 data: [{
	                     category:translate("db_power_unused"),
	                     value: remainingPowers
	                 }, {
	                     category:translate("db_power_poe"),
	                     value: poe
	                 }, {
	                     category:translate("db_power_upoe"),
	                     value: upoe
	                 }]
	             }],
	             tooltip: {
	                 visible: true,
	                 template: "#= category #: #= value # w"
	             }
	         });
		}		
	  
	 }else{
		  $scope.powerStatus=false;
	  }
//Showing Temp chart
		var tempDetails =systemCLIOP[1];
		var currentTemp,yellowThres,redThres=0;
		if(tempDetails!=null){
			currentTemp=executeCliCmdService.getNextString(tempDetails,["System Temperature Value:"],["Degree"]).trim();
			$scope.currentTemp=currentTemp;
			yellowThres=executeCliCmdService.getNextString(tempDetails,["Yellow Threshold :"],["Degree"]).trim();
			redThres=executeCliCmdService.getNextString(tempDetails,["Red Threshold    :"],["Degree"]).trim();
		}
		 angular.element("#gauge").kendoLinearGauge({
             legend: {
            	 position: "bottom"
             },
             chartArea: {
            	 width:200,
                 height:230
             },
             pointer: {
                 value: currentTemp,
                 shape: "arrow"
             },
             scale: {
                 majorUnit: 10,
                 minorUnit: 2,
                 min: 0,
                 max: 100,
                 vertical: true,
                 ranges: [
                     {
                         name:translate("com_ok"),
                         from: 0,
                         to: parseInt(yellowThres)-1,
                         color: "Green"
                     }, {
                         name:translate("db_syteminfo_yellowthres"),
                         from: yellowThres,
                         to: parseInt(redThres)-1,
                         color: "Yellow"
                     }, {
                         name:translate("db_syteminfo_redthres"),
                         from: redThres,
                         to: 100,
                         color: "Red"
                     }
                 ]
             },
           tooltip: {
        	   visible: true,
        	   template: "#= scale.ranges.name #: #= value #"
           }
         });
     }
}]);