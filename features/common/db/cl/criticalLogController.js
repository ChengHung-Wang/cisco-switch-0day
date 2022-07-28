/**
 Description: Critical Logs Controllers
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.controller('CriticalLogsCtrl', ['$scope', 'gridCrudService', '$filter','executeCliCmdService','getStringLineService','$interval','$timeout','dashletReloadTime','getMonthIndex','$rootScope',
function($scope, gridCrudService, $filter,executeCliCmdService,getStringLineService,$interval,$timeout,dashletReloadTime,getMonthIndex,$rootScope) {
     var translate = $filter("translate"),exportData = [];
     $scope.headersInExport = [translate("critical_logs_timestamp"), translate("critical_logs_facility"), translate("critical_logs_severity"),
                               translate("critical_logs_status"), translate("critical_logs_desc")];
	(function () {
		// Clear setInterval if already present
		if($rootScope.clFetchLoop){
			$interval.cancel($rootScope.clFetchLoop);
		}
   //Refresh the DS CL for every 60 seconds
	$rootScope.clFetchLoop = $interval(function(){
		if(angular.element(".dsCLContent").length > 0){
			showCLDetails();
		} else {
			$interval.cancel($rootScope.clFetchLoop);
		}
	}, dashletReloadTime);
	}());
 	//for initial load
 	showCLDetails();
     function showCLDetails(){
        var arrLoggingDetails = new Array();
        var arrWords = new Array();
        var arrWords1 = new Array();
        var arrWords2 = new Array();
        var strCLIOutput = deviceCommunicator.getExecCmdOutput("show logging");
        var OUTPUT_BEGIN = new Array("Log Buffer");
        var OUTPUT_END = new Array("! OUTPUT END");
        strCLIOutput = executeCliCmdService.getNextString(strCLIOutput,OUTPUT_BEGIN,OUTPUT_END);
        var LINE_INDEX = new Array("%");
        var strLines = getStringLineService.getLines(strCLIOutput,LINE_INDEX);
        if (strLines != null) {
           for (var i=0; i<strLines.length; i++) {
                        var strLine = strLines[i];
                        if(strLine.indexOf("%")!=-1){
                        	arrWords = strLine.split("%");
                        	if(arrWords[1].indexOf("-")!=-1){
                        		arrWords1 = arrWords[1].split("-");
                        		if(arrWords1[2] != 'undefined' && arrWords1[2] != undefined && arrWords1[2].indexOf(":")!=-1){
                        			arrWords2 = arrWords1[2].split(":");
                        			if(parseInt(arrWords1[1]) < 3){
                        				var timestamp=arrWords[0].substring(0,arrWords[0].length-2);//Mar  1 2017 00:00:56.172 ,Aug  2 11:00:00.026
                        				var arrTimestamp=timestamp.split(" ");
                        				var getMonthNum = getMonthIndex.monthIndex(arrTimestamp[0]);
                        				var getDay;
                        				if(arrTimestamp[1]==""){
                        					getDay = arrTimestamp[2].length < 2 ? '0'+arrTimestamp[2] : arrTimestamp[2];
                            				if(arrTimestamp[3].indexOf(":")!=-1){
                            					timestamp=new Date().getFullYear()+"-"+getMonthNum+"-"+getDay+" "+arrTimestamp[3];
                            				}else{
                            					timestamp=arrTimestamp[3]+"-"+getMonthNum+"-"+getDay+" "+arrTimestamp[4];
                            				}
                        				}else{
                        					getDay = arrTimestamp[1].length < 2 ? '0'+arrTimestamp[1] : arrTimestamp[1];
                            				if(arrTimestamp[2].indexOf(":")!=-1){
                            					timestamp=new Date().getFullYear()+"-"+getMonthNum+"-"+getDay+" "+arrTimestamp[2];
                            				}else{
                            					timestamp=arrTimestamp[2]+"-"+getMonthNum+"-"+getDay+" "+arrTimestamp[3];
                            				}
                        				}
                        				var items = {
                        					"timeStamp"  : timestamp,
                        					"facility"   : arrWords1[0],
                        					"severity"   : arrWords1[1],
                        					"status"     : arrWords2[0],
                        					"description": arrWords2[1]
                        				};
                        				arrLoggingDetails.push(items);
                        			}
                        		}
                        	}
                      }
              }
        }
        $scope.arrLoggingList = new kendo.data.ObservableArray(arrLoggingDetails)
                $scope.logsDataSource = new kendo.data.DataSource({
                        pageSize : 10,
                        data : $scope.arrLoggingList
        });
      //Export critical logs details
        $scope.getHeader = function () {
            return $scope.headersInExport;
        };
        $scope.getArray = function () {
            $scope.dataForExport = function () {
            	arrLoggingDetails.forEach(function (x) {
                        exportData.push({
                            "timeStamp": x.timeStamp,
                            "facility": x.facility,
                            "severity": x.severity,
                            "status": x.status,
                            "description": x.description
                        })
                    });
                return exportData;
            };
            dateTimeStamp = new Date();
            $scope.logsFileName = "Logs" + $filter('date')(dateTimeStamp, 'yyyy-MM-dd_hh-mm-ss');
            exportData = [];
            return $scope.dataForExport;
        };
        $scope.logsGridOptions = {
                dataSource: $scope.logsDataSource,
                editable : false,
                sortable : true,
                reorderable: true,
                scrollable: true,
                filterable : {
                        extra : false,
                        operators : {
                                string : {
                                        eq : translate("com_is_equal"),
                                        neq : translate("com_isnot_equal")
                                }
                        },
                        messages : {
        		            info: translate("com_page_dropDowntext"),
        		            filter: translate("com_btn_filter"),
        		            clear: translate("com_btn_clear")
        		        }
                },
                selectable : true,
                pageable : {
                		messages: {
                			display: translate("com_page_display"),
                			empty: translate("com_page_empty"),
                			page: translate("com_page_pagetext"),
                			of:translate("com_page_of"),
                			itemsPerPage: translate("com_page_itemsPerPage"),
                			first: translate("com_page_first"),
                			previous: translate("com_page_previous"),
                			next: translate("com_page_next"),
                			last: translate("com_page_last"),
                			refresh: translate("com_page_refresh"),
                			morePages: translate("com_page_morePage")
                		},
                        previousNext : true,
                        info : true,
                        refresh : true,
                        pageSizes : gridCrudService.grid_page_sizes,
                        buttonCount : 5
                },
                columns : [{
                        field : "timeStamp",
                        title : translate("critical_logs_timestamp"),
                        width : "15%"
                }, {
                        field : "facility",
                        title : translate("critical_logs_facility"),
                        width : "15%"
                }, {
                        field : "severity",
                        title : translate("critical_logs_severity"),
                        width : "10"
                }, {
                        field : "status",
                        title : translate("critical_logs_status"),
                        width : "15%"
                }, {
                        field : "description",
                        title : translate("critical_logs_desc"),
                        width : "45%"
                }]
        };
    }
     //highlighting sev1 logs in red color
     $timeout(function(){
    	 angular.element("#logsGrid").kendoGrid(angular.extend({
         dataBound: function(e) {
             // iterate the data items and apply row styles where sev is 1
             var dataItems = e.sender.dataSource.view();
             for (var j = 0; j < dataItems.length; j++) {
                 var Severity = dataItems[j].get("severity");
                 var row = e.sender.tbody.find("[data-uid='" + dataItems[j].uid + "']");
                 if(Severity==1){
                    row.addClass("critical");
				 }
             }
       }
     }, $scope.logsGridOptions));
     });
}]);