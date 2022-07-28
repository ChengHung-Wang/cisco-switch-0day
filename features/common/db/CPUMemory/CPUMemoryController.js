/**
 Description: Controller for CPU Utilization Controller
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */

app.controller('CpuAndMemoryUtilizationCtrl', ['$scope','$interval','DashletService','gridCrudService', '$filter','requestRoutingService','dashletReloadTime','getStringLineService','executeCliCmdService','$rootScope',
              function ($scope, $interval,dashletService,gridCrudService,$filter,requestRoutingService,dashletReloadTime,getStringLineService,executeCliCmdService,$rootScope) {
	var translate = $filter("translate");
	//CPU Util array with 2 empty value initially
		var arrCPUUtil=[];
		arrCPUUtil.push(" ");
		arrCPUUtil.push(" ");
	//IO Memory Util array with 2 empty value initially
		var arrIOMemoryUtil=[];
		arrIOMemoryUtil.push(" ");
		arrIOMemoryUtil.push(" ");
	//Processor Memory Util array with 2 empty val initially
		var arrProcessorMemoryUtil=[];
		arrProcessorMemoryUtil.push(" ");
		arrProcessorMemoryUtil.push(" ");
	//Device Time array with 2 empty value initially
		var arrDeviceTime=[];
		arrDeviceTime.push(" ");
		arrDeviceTime.push(" ");
	(function () {
		// Clear setInterval if already present
		if($rootScope.cpuMemUtilFetchLoop){
			$interval.cancel($rootScope.cpuMemUtilFetchLoop);
		}
	//Refresh Memory and CPU Utilization for every 60 seconds
	$rootScope.cpuMemUtilFetchLoop = $interval(function(){
		if(angular.element(".memoryCPUContainer").length > 0){
			loadCPUChart();
		} else {
			$interval.cancel($rootScope.cpuMemUtilFetchLoop);
		}
	}, dashletReloadTime);
	}());
	//for initial load
	loadCPUChart();
	//CPU UTILIZATION
	function loadCPUChart(){
		var cpuMemoryCLI="show clock\n show processes cpu sorted\n show processes memory sorted\n";
		var cpuMemoryCLIOP = deviceCommunicatorCLI.getExecCmdOutput(cpuMemoryCLI);
		var strCLIOutput =cpuMemoryCLIOP[0];
		var arrTime=strCLIOutput.split(":"),
	    deviceTime=arrTime[0]+":"+arrTime[1];
		arrDeviceTime.push(deviceTime);
		//for displaying last 3 values
		if(arrDeviceTime.length>3){
			arrDeviceTime.shift();
		}
		var processCPU = getStringLineService.getLines(cpuMemoryCLIOP[1],["CPU utilization for five seconds"]);
	    var fiveSecCPUDetails=executeCliCmdService.getNextString(processCPU[0],["CPU utilization for five seconds:"],[";"]).trim(),
		arrFiveSecCPU=fiveSecCPUDetails.split("/"),
		cpuInterrupt=arrFiveSecCPU[1].substring(0,arrFiveSecCPU[1].length-1),
		oneMinCPU=executeCliCmdService.getNextString(processCPU[0],["one minute:"],[";"]).trim(),
		oneMinCPU1=oneMinCPU.substring(0,oneMinCPU.length-1);
	  	arrCPUUtil.push(oneMinCPU1);
		if(arrCPUUtil.length>3){
			arrCPUUtil.shift();
		}
		fiveMinCPU=executeCliCmdService.getNextString(processCPU[0],["five minutes:"],["\n"]).trim();
	    fiveMinCPU=fiveMinCPU.substring(0,fiveMinCPU.length-1);
	    $scope.cpuUtilizationOptions={
	    		legend: {
	                position: "bottom"
	            },
	            seriesColors: ["#725D87"],
	            seriesDefaults: {
	                type: "column",
	                "overlay" : {
	                    "gradient" : "none"
	                }
	            },
	            series: [{
	                name: "CPU %",
	                data: arrCPUUtil,
	                interruptData: cpuInterrupt,
	                interruptName:translate("db_cpuutil_interrupt"),
	                fiveMinData: fiveMinCPU,
	                fiveMinName:translate("db_cpuutil_fivemin")
	            }],
	            valueAxis: {
	                labels: {
	                    format: "{0}%"
	                },
	                line: {
	                    visible: false
	                },
	                axisCrossingValue: 0
	            },
	            chartArea: {
	                height: 240
	            },
	            categoryAxis: {
	                categories: arrDeviceTime
	            },
	            tooltip: {
	                visible: true,
	                format: "{0}%",
	                template: "#= series.name #: #= value #<br>#=series.interruptName #: #= series.interruptData #<br>#=series.fiveMinName #: #= series.fiveMinData #"
	            }
	        };
	      loadMemoryChart(arrDeviceTime,cpuMemoryCLIOP[2]);
		}
	//MEMORY UTILIZATION
	function loadMemoryChart(arrDeviceTime,currentMemoryOP){
		var ioMemoryOP =getStringLineService.getLines(currentMemoryOP,["I/O Pool Total:"]);
		var processMemoryOP =getStringLineService.getLines(currentMemoryOP,["Processor Pool Total:"]);
	    var totalIOMemory=executeCliCmdService.getNextString(ioMemoryOP[0],["I/O Pool Total:"],["Used"]).trim(),
	    usedIOMemory=executeCliCmdService.getNextString(ioMemoryOP[0],["Used:"],["Free"]).trim(),
	    freeIOMemory=executeCliCmdService.getNextString(ioMemoryOP[0],["Free:"],["\n"]).trim(),
	    percentIoMemory=(parseFloat(usedIOMemory)/parseFloat(totalIOMemory))*100;
	    arrIOMemoryUtil.push(Math.round(percentIoMemory));
		if(arrIOMemoryUtil.length>3){
			arrIOMemoryUtil.shift();
		}
	    var totalProcessorMemory=executeCliCmdService.getNextString(processMemoryOP[0],["Processor Pool Total:"],["Used"]).trim(),
	    usedProcessorMemory=executeCliCmdService.getNextString(processMemoryOP[0],["Used:"],["Free"]).trim(),
	    freeProcessorMemory=executeCliCmdService.getNextString(processMemoryOP[0],["Free:"],["\n"]).trim(),
	    percentProcessorMemory=(parseFloat(usedProcessorMemory)/parseFloat(totalProcessorMemory))*100;
	    arrProcessorMemoryUtil.push(Math.round(percentProcessorMemory));
		if(arrProcessorMemoryUtil.length>3){
			arrProcessorMemoryUtil.shift();
		}
        $scope.memoryUtilizationOptions={
    		legend: {
                position: "bottom"
            },
            seriesColors: ["#9EC654","#0096D6"],
            seriesDefaults: {
                type: "column",
                "overlay" : {
                    "gradient" : "none"
                }
            },
            series: [{
                name:translate("db_memory_util_pppercentage"),
                data: arrProcessorMemoryUtil,
                totalMemoryName:translate("db_memory_util_pptotal"),
                totalMemory:bytesToSize(totalProcessorMemory),
				usedMemoryName:translate("db_memory_util_ppused"),
                usedMemory:bytesToSize(usedProcessorMemory),
                freeMemoryName:translate("db_memory_util_ppfree"),
                freeMemory:bytesToSize(freeProcessorMemory)
            },{
                name:translate("db_memory_util_iopercentage"),
                data: arrIOMemoryUtil,
                totalMemoryName:translate("db_memory_util_iototal"),
                totalMemory:bytesToSize(totalIOMemory),
                usedMemoryName:translate("db_memory_util_ioused"),
                usedMemory:bytesToSize(usedIOMemory),
                freeMemoryName:translate("db_memory_util_iofree"),
                freeMemory:bytesToSize(freeIOMemory)
            }],
            valueAxis: {
                labels: {
                    format: "{0}%"
                },
                line: {
                    visible: false
                },
                axisCrossingValue: 0
            },
            chartArea: {
                height: 240
            },
            categoryAxis: {
                categories: arrDeviceTime
            },
            tooltip: {
                visible: true,
                format: "{0}%",
                template: "#=series.name #: #= value #<br>#=series.totalMemoryName #: #= series.totalMemory #<br>#=series.usedMemoryName #: #= series.usedMemory #<br>#=series.freeMemoryName #: #= series.freeMemory #"
            }
        };
        //converting bytes to MB
        function bytesToSize(bytes) {
        	   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        	   if (bytes == 0) {
        		   return '0 Byte';
        	   }
        	   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        	   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        };
	}
}]);