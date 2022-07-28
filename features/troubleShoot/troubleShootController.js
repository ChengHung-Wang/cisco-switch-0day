/**
 Description: Controller for Trouble Shooting
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.register.controller('troubleShootCtrl', ['$scope','$rootScope','$filter','gridCrudService','requestRoutingService','executeCliCmdService','$timeout','getStringLineService','notificationService','dialogService','validationService','httpServices','clusterCmdService','dashletReloadTime','$interval','dataSourceService',
	function($scope,$rootScope,$filter,gridCrudService,requestRoutingService,executeCliCmdService,$timeout,getStringLineService,notificationService,dialogService,validationService,httpServices,clusterCmdService,dashletReloadTime,$interval,dataSourceService) {
		var translate = $filter("translate");
		$rootScope.portNumIdentity = ""; // To Reset port selection in switches
		$scope.showStackRestart = ($rootScope.deviceInfo.stackingInfo.type === "STACK");
		$scope.statusMsg="";
		$scope.showTick = true;
		var chartStatus=0;
		$scope.pingSource="";
		$scope.diagnosticTest="";
		$scope.disablePing = true;
		$scope.disableTrace = true; 
		$scope.diableDiagnostic = true;			
		$rootScope.portNumIdentity = "";
		$scope.switchDisplayreboot = false;
		$scope.switchDisplayfindSwitch = false;
		$scope.flowTrace = false;
		var TEST_STEP={
			pingOrTrace:""
		};
		// Ping validation
		var pingValidations = angular.element("#pingForm").kendoValidator({
			rules: {
				validateip : function(input) {
		            if (angular.isUndefined(input.data('validateIp'))) {
		                return true;
		            }
		            var ip = "0.0.0.0"
				    if ( (validationService.validateIPAddress(input) && input.val()!=ip ) || validationService.validateIpv6Address(input.val())) {
		                return true;
		            }
		            else {
		                return false;
		            }
		        }
			}
		}).data("kendoValidator");
		if($rootScope.deviceInfo.type.indexOf("CDB")!=-1){
			$scope.showConnectCtrl = true;
        }
        /* as of now led beacon cli is supported only on CDB platform
         * If either any one of its cluster member is of type CDB or the device itself
         * then find swith Tab is made visible
         */
		var cli = "show cluster members detail";
		var result = deviceCommunicatorCLI.getExecCmdOutput(cli);
		$scope.showFindTab = (result[0].indexOf("CDB")!=-1) || $rootScope.deviceInfo.type.indexOf("CDB")!=-1;
    
		$scope.findSwitchLoader = function(tab){
			if(tab === 'ping'){
				$scope.loadInterfaces();
			}
			if(tab === 'traceRoute'){
			
			}
			if(tab === 'diagnostic'){
				$scope.diagnosticResults();
			}
			if(tab === 'findswitch'){
				$scope.switchDisplayreboot = false;
				$scope.switchDisplayfindSwitch = true;
				$timeout(function(){
					$rootScope.switchfinder = true;
					$rootScope.showRestartBtn = false;
				},200)
			}
			if(tab === 'reboot'){
				$scope.switchDisplayreboot = true;
				$scope.switchDisplayfindSwitch = false;
				$timeout(function(){
					$rootScope.switchfinder = false;
					$rootScope.showRestartBtn = true;
				},200)
			}
			if(tab === 'logConfig'){
				$scope.showLogsDetails();
			}
		}
		$scope.showReloadStackConfirmDialog = function(){
			$scope.dlg = dialogService.dialog({
                                content : translate('reload_stack_confirm') + "<br/>"+ "<div class=\"col-sm-9 col-sm-offset-1 webui-centerpanel-label\"></div>" + "<br/>",
                                title : translate('reload_stack_title'),
                                messageType : "confirm",
                                actionButtons : [{
                                        text : translate("com_ok"),
                                        callback : "ReloadStack"
                                }, {
                                        text : translate("com_cancel")
                                }]
                        });
                };
		$scope.$on("ReloadStack", function() {
                        $scope.dlg.data("kendoWindow").close();
                        var result = requestRoutingService.getShowCmdOutput("reload\n");
			if(result == ""){
                                notificationService.showNotification(translate('reload_stack_success'),translate('reload_stack_title'),'success');
                        } else {
                                notificationService.showNotification(result,translate('reload_stack_title'),'error');
                        }
                });
		$scope.showRebootConfirmDialog = function(){
			$scope.dlg = dialogService.dialog({
				content : translate('factory_reset_confirm') + "<br/>"+ "<div class=\"col-sm-9 col-sm-offset-1 webui-centerpanel-label\"></div>" + "<br/>",
				title : translate('factory_reset'),
				messageType : "confirm",
				actionButtons : [{
					text : translate("com_ok"),
					callback : "RebootSwitch"
				}, {
					text : translate("com_cancel")
				}]
			});
		};
		$scope.$on("RebootSwitch", function() {
			$scope.dlg.data("kendoWindow").close();
			var result = "";
			if($rootScope.deviceInfo.type.indexOf("CDB")!=-1){
				//requestRoutingService.getShowCmdOutput("staging standalone\n");
				requestRoutingService.getShowCmdOutput("write erase\n");
				result = requestRoutingService.getShowCmdOutput("reload\n");
			}else{
				requestRoutingService.getShowCmdOutput("write erase\n");
				result = requestRoutingService.getShowCmdOutput("reload\n");
			}
			if(result == ""){
                                notificationService.showNotification(translate('factory_reset_success'),translate('factory_reset'),'success');
                        } else {
                                notificationService.showNotification(result,translate('factory_reset'),'error');
                        }
		});
		$scope.showRestartSuccessDialog = function(){
			$scope.dlg = dialogService.dialog({
				content : translate('software_update_restart_success'),
				title : translate('software_update_restart_title'),
				messageType : "success",
				actionButtons : [{
					text : translate("com_ok")
				}]
			});
		};
		$scope.showConnectController = function(){
			$scope.dlg = dialogService.dialog({
                                content : translate('connect_to_controller') + "<br/>"+ "<div class=\"col-sm-9 col-sm-offset-1 webui-centerpanel-label\"></div>" + "<br/>",
                                title : translate('connect_to_controller_title'),
                                messageType : "confirm",
                                actionButtons : [{
                                        text : translate("com_ok"),
                                        callback : "ConnectToController"
                                }, {
                                        text : translate("com_cancel")
                                }]
                        });
		};
		$scope.$on("ConnectToController", function() {
                        $scope.dlg.data("kendoWindow").close();
			if($rootScope.deviceInfo.type.indexOf("CDB")!=-1){
                                var result = requestRoutingService.getShowCmdOutput("staging network\n");
				if(result == ""){
					notificationService.showNotification(translate('connect_to_controller_success_msg'),translate('com_config_success_msg'),'success');
				} else {
					notificationService.showNotification(result,translate('com_config_fail_title'),'error');
				}
                        }
                });
				
		//load interface with configured IPV4/IPV6 address
		$scope.pingSourceInterface=[];
		$scope.loadInterfaces = function(){
			 var interfaceCLIOP = deviceCommunicatorCLI.getExecCmdOutput("show running-config | s interface\n");
			 var interfacesRunningConfig=interfaceCLIOP[0].split("interface");
	         for(var i = 1; i < interfacesRunningConfig.length; i++){
	            	var ipAddress="";
	                var intShowRun="interface "+interfacesRunningConfig[i];
	                var interfaceName= executeCliCmdService.getNextString(intShowRun,["interface"],["\n"]).trim();
	    			if(interfaceName.indexOf("Port") != -1){
						continue;
					}
	    			if(intShowRun.indexOf("ip address")!=-1){
	    				ipAddress=executeCliCmdService.getNextString(intShowRun,["ip address "],["\n"]).split(" ")[0];
	    				if(ipAddress!=""){
	    					var pingSourceInterface = {
		        					"intNameAddress": interfaceName+"-"+ipAddress,
			        				"name":interfaceName
			        		};
			        		$scope.pingSourceInterface.push(pingSourceInterface);
	    				}	    				
	    			}
	    			if(intShowRun.indexOf("ipv6 address")!=-1){
	    				var strLinesInterface = getStringLineService.getLines(intShowRun,["ipv6 address"]);
	    				for(var j = 0; j < strLinesInterface.length; j++){
	    					if(strLinesInterface[j].indexOf("link-local")!=-1){
	    						ipAddress=executeCliCmdService.getNextString(strLinesInterface[j],["ipv6 address "],["\n"]).split(" ")[0];
	    					}else{
	    						ipAddress=executeCliCmdService.getNextString(strLinesInterface[j],["ipv6 address "],["\n"]).split("/")[0];
	    					}
	    					if(ipAddress!=""){
			    				var pingSourceInterface = {
			        					"intNameAddress": interfaceName+"-"+ipAddress,
				        				"name":interfaceName
				        		};
				        		$scope.pingSourceInterface.push(pingSourceInterface);
	    					}
	    				}	    				
	    			}	    			
	         }
	    }
		
	    $scope.loadInterfaces();
		$scope.startPing= function(evt) {
		  $scope.flowTrace = false;
		  $scope.disablePing = true;		  
		  $scope.testStep=angular.copy(TEST_STEP);
		  $scope.testStep.pingOrTrace="checking";
		  $scope.currentOp=translate("trouble_shooting_loading_pinging");
          evt=evt.target;
          $scope.statusMsg="";
          $scope.isChartShown = false;
          chartStatus=0;
         if(pingValidations.validate()){
        	$scope.flowTrace = true;
            $scope.showTick = false;
        	var maxRate,minRate,averageRate=0,pingCLI="";
        	$timeout(function() {
        		if($scope.pingName!="" && $scope.pingSource!="none"){
        			pingCLI="ping "+$scope.pingName+" source "+$scope.pingSource+"\n";
        		}else{
        			pingCLI="ping "+$scope.pingName+"\n";
        		}
        		var strCLIOutput = requestRoutingService.getShowCmdOutput(pingCLI);        		
        		if(strCLIOutput===undefined){
        			$scope.statusMsg=translate("trouble_shoot_noreply_received")+" "+$scope.pingName;	
        		}
        		angular.element(evt).button('reset');
                $scope.showTick = true;        		
        	if(strCLIOutput.indexOf("Success rate is")!=-1){
	            var SUCCESS_OUTPUT_BEGIN = new Array("Success rate is ");
	            var SUCCESS_OUTPUT_END = new Array("percent");
	            var successStatusPer = executeCliCmdService.getNextString(strCLIOutput,SUCCESS_OUTPUT_BEGIN,SUCCESS_OUTPUT_END);
	            var SUCCESSRATE_OUTPUT_BEGIN = new Array("min/avg/max = ");
	            var SUCCESSRATE_OUTPUT_END = new Array(" ms");
	            var successRate = executeCliCmdService.getNextString(strCLIOutput,SUCCESSRATE_OUTPUT_BEGIN,SUCCESSRATE_OUTPUT_END);
	            var successRateArr=successRate.split("/");
	            maxRate=successRateArr[2];
	            averageRate=successRateArr[1];
	            minRate=successRateArr[0];
	            if(successStatusPer==0){
	            	$scope.statusMsg=translate("trouble_shoot_noreply_received")+" "+$scope.pingName;
	            }else{
	            	$scope.statusMsg=translate("trouble_shoot_success_rate")+":"+successStatusPer+" %";
	            	chartStatus=1;
	            	$scope.isChartShown = true;
	            }
        	}else if(strCLIOutput.indexOf("Unrecognized host or address, or protocol not running")!=-1){
        		$scope.statusMsg=translate("trouble_shoot_unrecognized");
        	}else if(strCLIOutput.indexOf("Invalid source interface")!=-1){
        		$scope.statusMsg=translate("trouble_shoot_invalid_source");
        	}else if(strCLIOutput.indexOf("Reply to request")!=-1){
        		$scope.statusMsg=translate("ping_ip")+" "+$scope.pingName+" "+translate("com_success");
        	}else {
        		$scope.statusMsg=translate("trouble_shoot_noreply_received")+" "+$scope.pingName;
        	}
        	if(chartStatus==1){
            angular.element("#chart").kendoChart({
                title: {
                    text:translate("trouble_shoot_ping_type")
                },
                chartArea:{
                    height:300,
                    width :250
                },
                seriesColors: ["#9EC654","#0096D6","#725D87"],
                seriesDefaults: {
	                type: "column",
	                "overlay" : {
	                    "gradient" : "none"
	                }
	            },
                legend: {
                    position: "bottom"
                },
                series: [{
                    name:translate("trouble_shoot_ping_min"),
                    data: [minRate]
                }, {
                    name:translate("trouble_shoot_ping_avg"),
                    data: [averageRate]
                }, {
                    name:translate("trouble_shoot_ping_max"),
                    data: [maxRate]
                }],
                valueAxis: {
                    labels: {
                        format: "{0} ms"
                    },
                    line: {
                        visible: true
                    },
                    axisCrossingValue: 0
                },
                categoryAxis: {
                    line: {
                        visible: false
                    },
                    labels: {
                        padding: {top: 135}
                    }
                },
                tooltip: {
                    visible: true,
                    template: "#= series.name #: #= value # ms"
                }
            });
        	}
			$scope.testStep.pingOrTrace = "success";
			$scope.flowTrace = false;
			$scope.disablePing = false;
        	},200);
        }
      }
		//Trace Route code
		//form validate
		function checkValidateIP(ip){
		    //Check Format
		    var ip = ip.split(".");
			if(ip.length != 4){
		        return false;
			}
		    //Check Numbers
		    for(var c = 0; c < 4; c++){
				if( !(1/ip[c] > 0) ||
		                    ip[c] > 255 ||
		                    isNaN(parseFloat(ip[c])) ||
		                    !isFinite(ip[c])  ||
		                    ip[c].indexOf(" ") !== -1){
		 
		                    return false;
				}
		    }
		    //Invalidate addresses that start with 192.168
		    if( ip[0] == 192 && ip[1] == 168 ){
		        return false;
		    }
		    return true;
		}
		// Ping validation
		var traceRouteValidations = angular.element("#traceRouteForm").kendoValidator({
			rules: {
				validateip : function(input) {
					if (input.val()){
						if (angular.isUndefined(input.data('validateIp'))) {
							return true;
						}
						var subnetRegex = "^((128|192|224|240|248|252|254)\.0\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0)|255\.(0|128|192|224|240|248|252|254)))))$";
						var subnetMask = "255.255.255.255"
						if (new RegExp(subnetRegex).test(input.val())|| input.val()==subnetMask) {
							return false;
						}
						if ( !isNaN(parseInt(input.val())) ){
							//return checkValidateIP(input.val());
							if ( validationService.validateIPAddress(input) || validationService.validateIpv6Address(input.val()) ) {
				                return true;
				            }
				            else {
				                return false;
				            }
							 
						}						
						return true;
					}
				}
			}
		}).data("kendoValidator");
	   function isNumeric(n) {
		  return !isNaN(parseFloat(n)) && isFinite(n);
	   }
	   
	   $scope.startTraceRoute= function(evt) {
		  $scope.flowTrace = false;
		  $scope.testStep=angular.copy(TEST_STEP);
		  $scope.testStep.pingOrTrace="checking";
		  $scope.currentOp=translate("trouble_shooting_loading_tracerouting");
          evt=evt.target;
          if(traceRouteValidations.validate()){
          $scope.flowTrace = true;
          $scope.showTick = false;
          $scope.isTraceRouteGrid = false;
		  $scope.disableTrace = true;
          $timeout(function(){
      		  var strCLIOutput = deviceCommunicator.getExecCmdOutput("traceroute "+$scope.traceRouteName+"\n");
      		  angular.element(evt).button('reset');
	          $scope.showTick = true;
	           var arrTraceRouteDetails = new Array();
	           var arrWords = new Array();
	           var arrWords1 = new Array();
	           var arrTTL = new Array();
	           var arrDelays = new Array();
	           var LINE_INDEX = new Array("msec");
	           var strLines = getStringLineService.getLines(strCLIOutput,LINE_INDEX);
	           if (strLines != null) {
	              for (var i=0; i<strLines.length; i++) {
	                      var strLine = strLines[i].trim();
	                      if(strLine.indexOf(")")!=-1){
	                          arrWords  = strLine.split(")");
	                          arrTTL    = arrWords[0].trim().split(" ");
	                          arrWords1 = arrWords[0].trim().split("(");
	                          arrDelays = arrWords[1].trim().split(" ");
	                          if(isNumeric(arrTTL[0])){
	                        	  var items = {
	  	                        		"hopCount"     : arrTTL[0],
	  	                          		"hop"          : arrTTL[1]+" ("+arrWords1[1]+")",
	  	                          		"roundTrip1"   : arrDelays[0],
	  	                          		"roundTrip2"   : arrDelays[2],
	  	                          		"roundTrip3"   : arrDelays[4]
	  	                          };
	  	                          arrTraceRouteDetails.push(items);
	                          }else{
	                        	  var items = {
		  	                        		"hopCount"     : "",
		  	                        		"hop"          : arrTTL[0]+" ("+arrWords1[1]+")",
		  	                          		"roundTrip1"   : arrDelays[0],
		  	                          		"roundTrip2"   : arrDelays[2],
		  	                          		"roundTrip3"   : arrDelays[4]
		  	                      };
		  	                      arrTraceRouteDetails.push(items);
	                          }
	                       } else{
	                    	   arrWords = strLine.split(" ");
	                       	   var items1 = {
	                    			"hopCount"     : arrWords[0],
	                           		"hop"          : arrWords[1],
	                           		"roundTrip1"   : arrWords[2],
	                           		"roundTrip2"   : arrWords[4],
	                           		"roundTrip3"   : arrWords[6]
	                           };
	                           arrTraceRouteDetails.push(items1);
	                       }
	                 }
	           }
	           $scope.isTraceRouteGrid = true;
	           $scope.arrTracesList = new kendo.data.ObservableArray(arrTraceRouteDetails);
			   $scope.traceRouteDataSource = new kendo.data.DataSource({
					   pageSize : 20,
					   data : $scope.arrTracesList
				});
	           $scope.traceRouteGridOptions = {
	                   dataSource: $scope.traceRouteDataSource,
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
	                           field : "hopCount",
	                           title : translate("trouble_shoot_traceroute_hop_ttl"),
	                           width : "15%"
	                   },{
                           	   field : "hop",
                           	   title : translate("trouble_shoot_traceroute_hop"),
                           	   width : "40%"
	                   },{
	                           field : "roundTrip1",
	                           title : translate("trouble_shoot_traceroute_roundtrip"),
	                           width : "15%"
	                   }, {
	                           field : "roundTrip2",
	                           title : translate("trouble_shoot_traceroute_roundtrip"),
	                           width : "15%"
	                   }, {
	                           field : "roundTrip3",
	                           title : translate("trouble_shoot_traceroute_roundtrip"),
	                           width : "15%"
	                   }]
	           };
			   $scope.testStep.pingOrTrace = "success";
			   $scope.flowTrace = false;
			   $scope.disableTrace = true;
	        },200);
       }
       }
		//Start Diagnostic code
       //Hiding the diagnostics tab if the device platform is 2960 plus and the type contains "-S" at the end. -S indicates lanlite for 2960 plus platform
       $scope.showDiagnostic=true; 
      if($rootScope.deviceInfo.type === "WS-C2960+48TC-S" || $rootScope.deviceInfo.type === "WS-C2960+-48TC-S" || $rootScope.deviceInfo.type === "WS-C2960+24LC-S" || $rootScope.deviceInfo.type.indexOf("2960+") != -1){
    	  $scope.showDiagnostic=false; 
      }else{
		$scope.diagnosticTestSource=[];
		$scope.loadTestsList = function(){
	       	var diagnosticTestSource ={
	        	"testText": translate("portconfig_options_none"),
		        "testValue":"none"
	        };
			$scope.diagnosticTestSource.push(diagnosticTestSource);
	        var diagnosticTestSource1 = {

				"testText": translate("trouble_shoot_diagnostic_alltests"),
   				"testValue":"all"
   		    };
   		    $scope.diagnosticTestSource.push(diagnosticTestSource1);
	       	var diagnosticTestSource2 ={

	        	"testText": translate("trouble_shoot_diagnostic_basictests"),
		        "testValue":"basic"
	        };
   		  	$scope.diagnosticTestSource.push(diagnosticTestSource2);
   		     if($rootScope.deviceInfo.type.indexOf("2960X")!=-1 || ($rootScope.deviceInfo.type.indexOf("S5960") != -1 && $rootScope.deviceInfo.type.indexOf("S5960L") == -1) || $rootScope.deviceInfo.type.indexOf("3560CX")!=-1 || $rootScope.deviceInfo.type.indexOf("2960XR")!=-1 || $rootScope.deviceInfo.type.indexOf("2960C")!=-1 || $rootScope.deviceInfo.type.indexOf("WS-C2960+")!=-1 ){
	       	  var diagnosticTestSource3 ={

	        	"testText": translate("trouble_shoot_diagnostic_nondisruptive"),
		        "testValue":"non-disruptive"
	          };
		  	  $scope.diagnosticTestSource.push(diagnosticTestSource3);
   		    }
	    }
	    $scope.loadTestsList();
		$scope.testoptionsSelected = function(){
			if($scope.diagnosticTest !== "none"){
				$scope.diableDiagnostic = false;
			}else{
				$scope.diableDiagnostic = true;
			}
		}
	    $scope.startDiagnostic = function(evt) {
			$scope.diagnosticStart=evt.target;
			$scope.startConfirmation('start');
		};
		$scope.startConfirmation = function() {
			$scope.tsTest = dialogService.dialog({
				content : translate("trouble_shoot_diagnostic_confirm"),
				title : translate("msg_delete_confirmation_window"),
				messageType : "confirm",
				actionButtons : [{
					text : translate("com_ok"),
					callback : "callDiagnosticTest"
				}, {
					text : translate("com_cancel")
				}]
			});
		};
		$scope.$on("callDiagnosticTest", function() {
			$timeout(function(){
				$scope.showTick = false;
			},100);
			$scope.startTests($scope.tsTest.data("kendoWindow"));
		});
		 $scope.startTests= function(popup) {
		    	popup.close();
				angular.element($scope.diagnosticStart).button('loading');
		    	var diagnosticCLI="",hiddenCLI="";
		    	var formToSubmit = document.getElementById("diagnosticForm");
		    	 if(($rootScope.deviceInfo.type.indexOf("2960X")!=-1 && ($rootScope.deviceInfo.type != "WS-C2960X-24PSQ-L" &&
                                                $rootScope.deviceInfo.type != "WS-C2960X-48TS-LL" &&
                                                $rootScope.deviceInfo.type != "WS-C2960X-24TS-LL" ))
					|| $rootScope.deviceInfo.type.indexOf("2960XR")!=-1
					|| $rootScope.deviceInfo.type == "WS-C3560CX-12PD-S" 
				    || $rootScope.deviceInfo.type == "WS-C3560CX-8XPD-S" 
				    || ($rootScope.deviceInfo.type.indexOf("C1000")!=-1 && $rootScope.deviceInfo.type.indexOf("C1000FE") == -1))
		    	   {
						if($scope.diagnosticTest==="basic"){
							diagnosticCLI = "/level/15/exec/-/diagnostic/start/switch/"+$rootScope.deviceInfo.masterId+"/test/basic";
							hiddenCLI = "diagnostic start switch "+$rootScope.deviceInfo.masterId+" test basic";
			    		} else if($scope.diagnosticTest==="all"){
			    			diagnosticCLI = "/level/15/exec/-/diagnostic/start/switch/"+$rootScope.deviceInfo.masterId+"/test/all";
			    			hiddenCLI = "diagnostic start switch "+$rootScope.deviceInfo.masterId+" test all";
			    		} else{
			    			diagnosticCLI = "/level/15/exec/-/diagnostic/start/switch/"+$rootScope.deviceInfo.masterId+"/test/non-disruptive";
			    			hiddenCLI = "diagnostic start switch "+$rootScope.deviceInfo.masterId+" test non-disruptive";
			    		}
		    	  }else{
		    		 if($scope.diagnosticTest==="basic"){
		    			 diagnosticCLI = "/level/15/exec/-/diagnostic/start/test/basic";
		    			 hiddenCLI = "diagnostic start test basic";
		    		 } else if($scope.diagnosticTest==="all"){
		    			 diagnosticCLI = "/level/15/exec/-/diagnostic/start/test/all";
		    			 hiddenCLI = "diagnostic start test all";
		    		 } else{
		    			 diagnosticCLI = "/level/15/exec/-/diagnostic/start/test/non-disruptive";
		    			 hiddenCLI = "diagnostic start test non-disruptive";
		    		 }
		    	}
		        $scope.getConfigureToken = function(){
        			 var url = diagnosticCLI;
        			 var result = httpServices.httpGetMethod(url);
        			 var token = result.slice(result.search("csrf_token VALUE=")+18, result.search("csrf_token VALUE=")+18+40)
		             return token;
		        };
		        var token = $scope.getConfigureToken();
		        var url=diagnosticCLI;
		        var data = 'hidden_command='+hiddenCLI+'&csrf_token='+token+'&CMD=CR';
		    	notificationService.showNotification("",translate('diagnostic_success_msg'),'success');
				//Executing pooling until device restarted and comes up
				$scope.diagnosticResultIntervalLoop = $interval(function(){
					$scope.diagnosticPool();
				}, dashletReloadTime);
				$timeout(function(){
					angular.element(".notification").hide();
					var result=httpServices.httpPostMethod(url,data);
		    	},3100);
		 }
		  $scope.diagnosticPool = function(){
			if(($rootScope.deviceInfo.type.indexOf("2960X") !=-1 && ($rootScope.deviceInfo.type != "WS-C2960X-24PSQ-L" && $rootScope.deviceInfo.type != "WS-C2960X-48TS-LL" && $rootScope.deviceInfo.type != "WS-C2960X-24TS-LL" )) || $rootScope.deviceInfo.type.indexOf("2960XR")!=-1 || $rootScope.deviceInfo.type === "WS-C3560CX-12PD-S" || $rootScope.deviceInfo.type === "WS-C3560CX-8XPD-S" || $rootScope.deviceInfo.type.indexOf("C1000")!=-1){
	    		showDiagnosticResult=deviceCommunicator.getExecCmdOutput("show diagnostic result switch "+$rootScope.deviceInfo.masterId+" \n");
				if(showDiagnosticResult != ""){
						 if($scope.diagnosticResultIntervalLoop){
							$interval.cancel($scope.diagnosticResultIntervalLoop);
							$scope.diagnosticResultIntervalLoop = null;
						 }
						 $scope.diagnosticResults();
						 angular.element($scope.diagnosticStart).button('reset');
						 $scope.diableDiagnostic = false;
						 notificationService.showNotification("",translate('diagnostic_success_final_msg'),'success');
				}
			}else{
	    		showDiagnosticResult=deviceCommunicator.getExecCmdOutput("show diagnostic result \n");
				if(showDiagnosticResult != ""){
						if($scope.diagnosticResultIntervalLoop){
							$interval.cancel($scope.diagnosticResultIntervalLoop);
							$scope.diagnosticResultIntervalLoop = null;
						 }
						 $scope.diagnosticResults();
						 angular.element($scope.diagnosticStart).button('reset');
						 $scope.showTick = true;
						 $scope.diableDiagnostic = false;
						 notificationService.showNotification("",translate('diagnostic_success_final_msg'),'success');
				}
	    	}
		 }
	      $scope.diagnosticResults= function() {
	    	 var showDiagnosticResult = "";
	    	 if(($rootScope.deviceInfo.type.indexOf("2960X") !=-1 && ($rootScope.deviceInfo.type != "WS-C2960X-24PSQ-L" && $rootScope.deviceInfo.type != "WS-C2960X-48TS-LL" && $rootScope.deviceInfo.type != "WS-C2960X-24TS-LL" )) || $rootScope.deviceInfo.type.indexOf("2960XR")!=-1 || $rootScope.deviceInfo.type === "WS-C3560CX-12PD-S" || $rootScope.deviceInfo.type === "WS-C3560CX-8XPD-S" || $rootScope.deviceInfo.type.indexOf("C1000")!=-1 ){
	    		 showDiagnosticResult=deviceCommunicator.getExecCmdOutput("show diagnostic result switch "+$rootScope.deviceInfo.masterId+" \n");
	    	 }else{
	    		 showDiagnosticResult=deviceCommunicator.getExecCmdOutput("show diagnostic result \n");
	    	 }
	    	 var DIAGNOSTIC_TEST1 = new Array("TestPortAsicStackPortLoopback");
	    	 var DIAGNOSTIC_TEST2 = new Array("TestPortAsicLoopback");
	    	 var DIAGNOSTIC_TEST3 = new Array("TestPortAsicRingLoopback");
	    	 var DIAGNOSTIC_TEST4 = new Array("TestPortAsicCam");
	    	 var DIAGNOSTIC_TEST5 = new Array("TestMicRingLoopback");
	    	 var DIAGNOSTIC_TEST6 = new Array("TestPortAsicMem");
	    	 var DIAGNOSTIC_TEST7 = new Array("TestInlinePwrCtlr");
	    	if(showDiagnosticResult!=null){
	    		if($rootScope.deviceInfo.type.indexOf("2960X")!=-1 || ($rootScope.deviceInfo.type.indexOf("S5960") != -1 && $rootScope.deviceInfo.type.indexOf("S5960L") == -1) || $rootScope.deviceInfo.type.indexOf("2960XR")!=-1 || $rootScope.deviceInfo.type.indexOf("3560CX")!=-1 || $rootScope.deviceInfo.type.indexOf("2960C")!=-1 || $rootScope.deviceInfo.type.indexOf("WS-C2960+")!=-1){
		    		var testPortAsicStackPortLoopback = getStringLineService.getLines(showDiagnosticResult,DIAGNOSTIC_TEST1);
		    		if(testPortAsicStackPortLoopback!=undefined && testPortAsicStackPortLoopback.length>0 ){
		    			$scope.testView1=true;
			    		var arrtestPortAsicStackPortLoopback=testPortAsicStackPortLoopback[0].split(" ");
			    		testPortAsicStackPortLoopback=arrtestPortAsicStackPortLoopback[7].trim();
			    		if(testPortAsicStackPortLoopback==="U"){
			    			$scope.testResult1="fa fa-ban";
							$scope.testResult1Text = "("+translate("ts_diagnostic_testmsg_unstarted")+")";
			    		}else if(testPortAsicStackPortLoopback==="F"){
			    			$scope.testResult1="fa fa-times-circle redCross";
							$scope.testResult1Text = "("+translate("ts_diagnostic_testmsg_fail")+")";
			    		} else if(testPortAsicStackPortLoopback==="."){
			    			$scope.testResult1="fa fa-check-circle master";
							$scope.testResult1Text = "("+translate("ts_diagnostic_testmsg_pass")+")";
			    		}
		    		}else{
	    				$scope.testView1=false;
	    			}
			    	var testPortAsicRingLoopback = getStringLineService.getLines(showDiagnosticResult,DIAGNOSTIC_TEST3);
			    	if(testPortAsicRingLoopback!=undefined && testPortAsicRingLoopback.length>0 ){
			    		$scope.testView3=true;
			    		var arrtestPortAsicRingLoopback=testPortAsicRingLoopback[0].split(" ");
			    		testPortAsicRingLoopback=arrtestPortAsicRingLoopback[7].trim();
			    		if(testPortAsicRingLoopback==="U"){
			    			$scope.testResult3="fa fa-ban";
							$scope.testResult3Text = "("+translate("ts_diagnostic_testmsg_unstarted")+")";
			    		}else if(testPortAsicRingLoopback==="F"){
			    			$scope.testResult3="fa fa-times-circle redCross";
							$scope.testResult3Text ="("+translate("ts_diagnostic_testmsg_fail")+")";
			    		} else if(testPortAsicRingLoopback==="."){
			    			$scope.testResult3="fa fa-check-circle master";
							$scope.testResult3Text ="("+translate("ts_diagnostic_testmsg_pass")+")";
			    		}
		    		}else{
	    				$scope.testView3=false;
	    			}
		    		var testMicRingLoopback = getStringLineService.getLines(showDiagnosticResult,DIAGNOSTIC_TEST5);
		    		if(testMicRingLoopback!=undefined && testMicRingLoopback.length>0 ){
		    			$scope.testView5=true;
			    		var arrtestMicRingLoopback=testMicRingLoopback[0].split(" ");
			    		testMicRingLoopback=arrtestMicRingLoopback[7].trim();
			    		if(testMicRingLoopback==="U"){
			    			$scope.testResult5="fa fa-ban";
							$scope.testResult5Text = "("+translate("ts_diagnostic_testmsg_unstarted")+")";
			    		}else if(testMicRingLoopback==="F"){
			    			$scope.testResult5="fa fa-times-circle redCross";
							$scope.testResult5Text ="("+translate("ts_diagnostic_testmsg_fail")+")";
			    		} else if(testMicRingLoopback==="."){
			    			$scope.testResult5="fa fa-check-circle master";
							$scope.testResult5Text ="("+translate("ts_diagnostic_testmsg_pass")+")";
			    		}
		    		}else{
	    				$scope.testView5=false;
	    			}
	    		}
	    		var testPortAsicLoopback = getStringLineService.getLines(showDiagnosticResult,DIAGNOSTIC_TEST2);
	    		if(testPortAsicLoopback!=undefined && testPortAsicLoopback.length>0 ){
	    			$scope.testView2=true;
		    		var arrtestPortAsicLoopback=testPortAsicLoopback[0].split(" ");
		    		testPortAsicLoopback=arrtestPortAsicLoopback[7].trim();
		    		if(testPortAsicLoopback==="U"){
		    			$scope.testResult2="fa fa-ban";
						$scope.testResult2Text = "("+translate("ts_diagnostic_testmsg_unstarted")+")";
		    		}else if(testPortAsicLoopback==="F"){
		    			$scope.testResult2="fa fa-times-circle redCross";
						$scope.testResult2Text = "("+translate("ts_diagnostic_testmsg_fail")+")";
		    		} else if(testPortAsicLoopback==="."){
		    			$scope.testResult2="fa fa-check-circle master";
						$scope.testResult2Text = "("+translate("ts_diagnostic_testmsg_pass")+")";
		    		}
	    		}else{
    				$scope.testView2=false;
    			}
	    		var testPortAsicCam = getStringLineService.getLines(showDiagnosticResult,DIAGNOSTIC_TEST4);
	    		if(testPortAsicCam!=undefined && testPortAsicCam.length>0 ){
	    			$scope.testView4=true;
		    		var arrtestPortAsicCam=testPortAsicCam[0].split(" ");
		    		testPortAsicCam=arrtestPortAsicCam[7].trim();
		    		if(testPortAsicCam==="U"){
		    			$scope.testResult4="fa fa-ban";
						$scope.testResult4Text = "("+translate("ts_diagnostic_testmsg_unstarted")+")";
		    		}else if(testPortAsicCam==="F"){
		    			$scope.testResult4="fa fa-times-circle redCross";
						$scope.testResult4Text = "("+translate("ts_diagnostic_testmsg_fail")+")";
		    		} else if(testPortAsicCam==="."){
		    			$scope.testResult4="fa fa-check-circle master";
						$scope.testResult4Text = "("+translate("ts_diagnostic_testmsg_pass")+")";
		    		}
	    		}else{
    				$scope.testView4=false;
    			}
	    		var testPortAsicMem = getStringLineService.getLines(showDiagnosticResult,DIAGNOSTIC_TEST6);
	    		if(testPortAsicMem!=undefined && testPortAsicMem.length>0 ){
	    			$scope.testView6=true;
		    		var arrtestPortAsicMem=testPortAsicMem[0].split(" ");
		    		testPortAsicMem=arrtestPortAsicMem[7].trim();
		    		if(testPortAsicMem==="U"){
		    			$scope.testResult6="fa fa-ban";
						$scope.testResult6Text = "("+translate("ts_diagnostic_testmsg_unstarted")+")";
		    		}else if(testPortAsicMem==="F"){
		    			$scope.testResult6="fa fa-times-circle redCross";
						$scope.testResult6Text ="("+translate("ts_diagnostic_testmsg_fail")+")";
		    		} else if(testPortAsicMem==="."){
		    			$scope.testResult6="fa fa-check-circle master";
						$scope.testResult6Text = "("+translate("ts_diagnostic_testmsg_pass")+")";
		    		}
	    		}else{
    				$scope.testView6=false;
    			}
	    		if($rootScope.deviceInfo.type.indexOf("2960X")!=-1 || ($rootScope.deviceInfo.type.indexOf("S5960") != -1 && $rootScope.deviceInfo.type.indexOf("S5960L") == -1) || $rootScope.deviceInfo.type.indexOf("2960XR")!=-1 || $rootScope.deviceInfo.type.indexOf("2960CX")!=-1 || $rootScope.deviceInfo.type === "WS-C3560CX-12PD-S" || $rootScope.deviceInfo.type === "WS-C3560CX-8XPD-S"){
	    			var testInlinePwrCtlr = getStringLineService.getLines(showDiagnosticResult,DIAGNOSTIC_TEST7);
	    			if(testInlinePwrCtlr!=undefined && testInlinePwrCtlr.length>0 ){
	    				$scope.testView7=true;
			    		var arrtestInlinePwrCtlr=testInlinePwrCtlr[0].split(" ");
			    		testInlinePwrCtlr=arrtestInlinePwrCtlr[7].trim();
			    		if(testInlinePwrCtlr==="U"){
			    			$scope.testResult7="fa fa-ban";
							$scope.testResult7Text = "("+translate("ts_diagnostic_testmsg_unstarted")+")";
			    		}else if(testInlinePwrCtlr==="F"){
			    			$scope.testResult7="fa fa-times-circle redCross";
							$scope.testResult7Text ="("+translate("ts_diagnostic_testmsg_fail")+")";
			    		} else if(testInlinePwrCtlr==="."){
			    			$scope.testResult7="fa fa-check-circle master";
							$scope.testResult7Text = "("+translate("ts_diagnostic_testmsg_pass")+")";
			    		}
	    			}else{
	    				$scope.testView7=false;
	    			}
	    		}
	    	}
	    }
      }  
	  //End Diagnostic
		// find switch tab
		$scope.findSwitch = function (switchIndex){
			var result;
			if(switchIndex == 0 ) {
				var findCli="led beacon";
				result = deviceCommunicator.getExecCmdOutput(findCli);
			} else {
				result = clusterCmdService.ledBeacon(switchIndex);
			}
			if(result==""){
				notificationService.showNotification(translate('findSwitch_success_msg'),translate('com_config_success_title'),'success');
			}else{
				notificationService.showNotification(result,translate('com_config_fail_title'),'error');
			}
		}
		
	//Log Configuration starts
		angular.extend($scope, {
			logging : {
				consoleLogging : "",
				monitorLogging : "",
				bufferLogging : "",
				trapLogging : ""
			}
		});
		
		
		(function () {
			// Clear setInterval if already present
			if($rootScope.logFetchLoop){
				$interval.cancel($rootScope.logFetchLoop);
			}
	   //Refresh the logs for every 5 seconds
		$rootScope.logFetchLoop = $interval(function(){
			if(angular.element(".logView").length > 0){
				$scope.showLogsDetails();
			} else {
				$interval.cancel($rootScope.logFetchLoop);
			}
		}, 3000);
		}());
		
		$scope.syslogsinfo = 100;
		$scope.logsData = "";
		$scope.searchEnter = 0;
		$scope.spanLen = 0;
		$scope.showLogsDetails = function() {
			var strCLIOutput = deviceCommunicator.getExecCmdOutput("show logging");
			$scope.logsData = strCLIOutput;
			var logsArray = $scope.logsData.split("\n");
			var count = 0;
			if (parseInt($scope.syslogsinfo) < logsArray.length) {
				$scope.logsData = "";
				for (var index = logsArray.length; index > 0; index--) {
					count++;
					$scope.logsData += logsArray[index - 1] + "\n\n";
					if (count === parseInt($scope.syslogsinfo)) {
						break;
					}
				}
			} else {
				$scope.logsData = "";
				for (var index = logsArray.length; index > 0; index--) {
					count++;
					$scope.logsData += logsArray[index - 1] + "\n\n";
					if (count === parseInt($scope.syslogsinfo)) {
						break;
					}
				}
			}
		};

		$timeout(function() {			
			$scope.consoleLoggingOptions = dataSourceService
					.loggingOptions();
			$scope.monitorLoggingOptions = dataSourceService
					.loggingOptions();
			$scope.bufferLoggingOptions = dataSourceService
					.loggingOptions();
			$scope.trapLoggingOptions = dataSourceService.loggingOptions();
		}, 100);
		$scope.configLogs = function() {
			$timeout(function() {
				$scope.logGridWindow.open().center();
			},10);
			$scope.loadConfigLogs();
		}
		var consoleHLogging,monitorHLogging,bufferHLogging,trapHLogging,bufferHLogggingSize,exceptionHLogggingSize,countHLoggingStatus,persistHLoggingStatus;
		$scope.loadConfigLogs = function() {				
			var severityArr=["emergencies","alerts","critical","errors","warnings","notifications","informational","debugging"]
			var strCLIOutput = deviceCommunicator.getExecCmdOutput("show logging");
			 $scope.logging = {
					 consoleLogging : severityArr.indexOf(executeCliCmdService.getNextString(strCLIOutput,["Console logging: level "],[","]).trim()),
					 monitorLogging : severityArr.indexOf(executeCliCmdService.getNextString(strCLIOutput,["Monitor logging: level "],[","]).trim()),
					 bufferLogging  : severityArr.indexOf(executeCliCmdService.getNextString(strCLIOutput,["Buffer logging:  level "],[","]).trim()),
					 trapLogging    : severityArr.indexOf(executeCliCmdService.getNextString(strCLIOutput,["Trap logging: level "],[","]).trim())
			};
			consoleHLogging=$scope.logging.consoleLogging;
			monitorHLogging=$scope.logging.monitorLogging;
			bufferHLogging=$scope.logging.bufferLogging;
			trapHLogging=$scope.logging.trapLogging;
			
			$scope.bufferLogggingSize=executeCliCmdService.getNextString(strCLIOutput,["Log Buffer ("],["bytes)"]).trim();
			bufferHLogggingSize=$scope.bufferLogggingSize;
			
			$scope.exceptionLogggingSize=executeCliCmdService.getNextString(strCLIOutput,["Exception Logging: size ("],["bytes)"]).trim();
			exceptionHLogggingSize=$scope.exceptionLogggingSize;
			
			var countTimeStamp=executeCliCmdService.getNextString(strCLIOutput,["Count and timestamp logging messages: "],["\n"]).trim();
			if(countTimeStamp=="disabled"){
				$scope.countLoggingStatus=translate("com_disable");
				countHLoggingStatus=translate("com_disable");
			}else{
				$scope.countLoggingStatus=translate("com_enable");
				countHLoggingStatus=translate("com_enable");
			}
			var persistLogStatus=executeCliCmdService.getNextString(strCLIOutput,["Persistent logging: "],["\n"]).trim();
			if(persistLogStatus=="disabled"){
				$scope.persistLoggingStatus=translate("com_disable");
				persistHLoggingStatus=translate("com_disable");
			}else{
				$scope.persistLoggingStatus=translate("com_enable");
				persistHLoggingStatus=translate("com_enable");
			}					
		};
		var syslogValidations = angular.element("#logForm").kendoValidator({
			  rules: {function (input) {
					var valMsg = input.data('rangeMsg');
					if ((valMsg==undefined)) {
						return true;
					}
					var min= input.prop('min');
					var max= input.prop('max');
					if(parseFloat(input.val())>=min && parseFloat(input.val())<=max){
						return true;
					}
					return false;
				}
			 }
		}).data("kendoValidator");
		
		$scope.saveLogConfig=function(){
			if(syslogValidations.validate()){
				var logConfigCLI="";
				if($scope.logging.consoleLogging!=consoleHLogging){
					logConfigCLI +="logging console "+$scope.logging.consoleLogging+" \n";
				}
				if($scope.logging.monitorLogging!=monitorHLogging){
					logConfigCLI +="logging monitor "+$scope.logging.monitorLogging+" \n";
				}
				if($scope.bufferLogggingSize!=bufferHLogggingSize){
					logConfigCLI +="logging buffered "+$scope.bufferLogggingSize+" \n";
				}
				if($scope.logging.bufferLogging!=bufferHLogging){
					logConfigCLI +="logging buffered "+$scope.logging.bufferLogging+" \n";
				}
				if($scope.exceptionLogggingSize!=exceptionHLogggingSize){
					logConfigCLI +="logging exception "+$scope.exceptionLogggingSize+" \n";
				}								
				if($scope.countLoggingStatus!=countHLoggingStatus){
					if($scope.countLoggingStatus == translate("com_enable")){
						logConfigCLI +="logging count\n";
					}else{
						logConfigCLI +="no logging count\n";
					}
				}
				if($scope.persistLoggingStatus!=persistHLoggingStatus){
					if($scope.persistLoggingStatus == translate("com_enable")){
						logConfigCLI +="logging persistent\n";
					}else{
						logConfigCLI +="no logging persistent\n";
					}
				}				
				if($scope.logging.trapLogging!=trapHLogging){				
					logConfigCLI +="logging trap "+$scope.logging.trapLogging+" \n";
				}
				
				var result = requestRoutingService.getConfigCmdOutput(logConfigCLI);
				if(result==""){
					notificationService.showNotification(translate('log_config_status_success'),translate('com_config_success_title'),'success');
				}else{
					notificationService.showNotification(result,translate('com_config_fail_title'),'error');
				}
				$scope.loadConfigLogs();
			}
		}		
					
		$scope.downloadFullLog = function() {
			var strCLIOutput = deviceCommunicator.getExecCmdOutput("show logging");				
			var blob = new Blob([strCLIOutput], {type: "text/plain;charset=utf-8"});
			kendo.saveAs({
					dataURI: blob,
					fileName: "showLogs.log"
			});
		};	
		
		function selectText(id){
		        var sel, range;
		        var el = document.getElementById(id);
		        if (window.getSelection && document.createRange) {
		            sel = window.getSelection();
		            if(sel.toString() == ''){
		                window.setTimeout(function(){
		                    range = document.createRange();
		                    range.selectNodeContents(el);
		                    sel.removeAllRanges();
		                    sel.addRange(range);
		                    $scope.copy();
		                    document.getSelection().removeAllRanges();
		                },1);
		            }
		        }else if (document.selection) {
		        	sel = document.selection.createRange();
		            if(sel.text == ''){ //no text selection
		                range = document.body.createTextRange();
		                range.moveToElementText(el);
		                range.select();
		                $scope.copy();
		                document.getSelection().removeAllRanges();
		            }
		     }
		}

		$scope.copy_syslog_output = function(){
		    selectText('clearLogsInfo');
		};
		$scope.copy = function () {
	        try {
	            var successful = document.execCommand('copy');
	            if(successful) {console.log("copied");}
	            if (!successful) throw successful;
	        } catch (err) {
	            console.log("failed to copy", err);
	        }
	    };
	    $scope.clearLogs = function() {
	    	deviceCommunicator.getExecCmdOutput("clear logging");
	    	notificationService.showNotification(translate('logs_clear_success'),translate('com_config_success_title'),'success');
			$scope.syslogsinfo = 100;
			$scope.showLogsDetails();				
		};		    
		$scope.cancelLogConfig = function() {
			$scope.logGridWindow.close();				
		};			
	//Log Configuration Ends
		
	//Debugging Code
		$scope.downloadDebugLogs=false;
		$scope.allowedCli=true;
		$scope.defaultCLI="sh run";
		$scope.textCli="";
		$scope.testedCliList=[$scope.defaultCLI];
		$scope.cliList = [$scope.defaultCLI];
		$scope.validNameStatus=true;
		$scope.duplicateCLI=true;
		$scope.resultStatus=false;
		$scope.viewResult ="";
		$scope.debugBundleName="debug_Output";
		$scope.validDebugBundleName=true;
		// it will validate the debug bundle name by allowing characters: a-z, A-Z, - and _
		$scope.validateBundleName=function(){
			if(/^[a-z\d\-_]+$/i.test($scope.debugBundleName) == false){
				$scope.validNameStatus=false;
				$scope.validDebugBundleName=false;
			}else{
				$scope.validNameStatus=true;
				$scope.validDebugBundleName=true;
			}
		};
		
		$scope.countAndAllowCLI=function(){
			var retval=false;
			if($scope.textCli && $scope.textCli != ""){
				if($scope.cliList.length<5){
					if($scope.cliList.indexOf($scope.textCli) == -1){
						retval=true;
						$scope.duplicateCLI=true;
					}else{
						$scope.duplicateCLI=false;
						$scope.resultStatus=true;
						$scope.errorMessageCLI=translate('debug_cli_alreadyexist');
						$scope.viewGridWindow.close();					
					}					
				}
			}
			return retval;
		}		
		$scope.addTestedCli=function(){			
			if($scope.countAndAllowCLI()){
				$scope.cliList.push($scope.textCli);
				$scope.textCli ="";
				if($scope.cliList.length == 5){
					$scope.allowedCli=false;
				}
			}
		}		
		$scope.addCli=function(){		
		 if($scope.countAndAllowCLI() && $scope.textCli.substr(0,2).toLowerCase() == "sh"){			
			var strCLIOutput = deviceCommunicatorCLI.getExecCmdOutput($scope.textCli);			
			if(strCLIOutput != "" && strCLIOutput[0].indexOf("subcommands") == -1){			
				$scope.resultStatus=false;					
					if($scope.testedCliList.indexOf($scope.textCli) == -1){
						$scope.testedCliList.push($scope.textCli)
						$scope.errorMessageCLI = "";
					}
					$scope.cliList.push($scope.textCli);
					$scope.textCli ="";
					if($scope.cliList.length == 5){
						$scope.allowedCli=false;
					}					
					$scope.viewGridWindow.close();
			}else{
			 $scope.resultStatus=true;
			$scope.errorMessageCLI=translate('debug_invalid_clis');
			$scope.viewGridWindow.close();
			}
		}else if($scope.textCli.substr(0,2).toLowerCase() != "sh"){
			$scope.resultStatus=true;
			$scope.errorMessageCLI=translate('debug_clis_startwith');
			$scope.viewGridWindow.close();
		}	
		if($scope.cliList.length < 1){				
			$scope.downloadDebugLogs=true;
		}else{
			$scope.downloadDebugLogs=false;
		}
	  }		
	 $scope.deleteCli=function(cli){
			if($scope.cliList.indexOf(cli) != -1){
				$scope.cliList.splice($scope.cliList.indexOf(cli),1);
			}
			if($scope.testedCliList.indexOf(cli) != -1){
				$scope.testedCliList.splice($scope.testedCliList.indexOf(cli),1);
			}
			if($scope.cliList.length<5){
				$scope.allowedCli=true
			}			
			if($scope.cliList.length < 1){				
				$scope.downloadDebugLogs=true;
			}else{
				$scope.downloadDebugLogs=false;
			}
		}		
		$scope.viewCliResult=function(){			
			var strCLIOutput = deviceCommunicatorCLI.getExecCmdOutput($scope.textCli);
			$scope.viewResult = strCLIOutput;
			if(strCLIOutput && strCLIOutput != ""){
			$scope.viewGridWindow.open().center();
			}else{
				$scope.resultStatus=true;
				$scope.errorMessageCLI =translate('debug_invalid_clis');
			}			
		}
		$scope.viewCancel = function(){
			$scope.viewGridWindow.close();
		}
		
    	$scope.createDebugOutput=function(){
			var arrCLIList=$scope.cliList;
			var CLIList="";
			for (var i=0; i < arrCLIList.length; i++) {
				CLIList += arrCLIList[i]+"\n";
			}
			var CLIOP = deviceCommunicatorCLI.getExecCmdOutput(CLIList);
			var CLILogs="";
			for (var j=0; j < arrCLIList.length; j++) {
				CLILogs += arrCLIList[j]+"\r\n";
				CLILogs += "==============================================================================================\r\n";
				CLILogs += CLIOP[j]+"\r\n";
				CLILogs += "##############################################################################################\r\n";
			}	
			var fileName=""
			if($scope.debugBundleName==""){
				fileName="debug_Output";
			}else{
				fileName=$scope.debugBundleName;
			}
			var blob = new Blob([CLILogs], {type: "text/plain;charset=utf-8"});
			kendo.saveAs({
				 dataURI: blob,
				 fileName: fileName+".log"
			});
		}		
	//End Debugging code
    	
	}]);
