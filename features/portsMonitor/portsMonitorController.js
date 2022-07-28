/**
 Description: Ports Monitoring Controller
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.register.controller('PortsMonitorCtrl', ['$scope','$rootScope','gridCrudService', '$filter','requestRoutingService', '$timeout','executeCliCmdService','getStringLineService','notificationService','dialogService','clusterCmdService',
    function ($scope,$rootScope,gridCrudService, $filter,requestRoutingService, $timeout,executeCliCmdService,getStringLineService,notificationService,dialogService,clusterCmdService) {
        var translate = $filter("translate"),exportData = [];
        $scope.clearCounterStatus=true;
        $rootScope.portNumIdentityMultiSelect = [];
        $rootScope.portNumIdentity = "";
        angular.extend($scope, {
            currentPort: ''
        });
        $scope.headersInExport = [translate("ports_monitoring_description_switchport"), translate("ports_monitoring_description_desc"), translate("ports_monitoring_description_status"),
                                  translate("ports_monitoring_description_porttype"), translate("ports_monitoring_description_vlanip"),
                                  translate("ports_monitoring_description_duplex"), translate("ports_monitoring_description_power"), translate("ports_monitoring_description_speed"),
                                  translate("ports_monitoring_description_txbytes"), translate("ports_monitoring_description_rxbytes"), translate("ports_monitoring_description_pktdrop"), translate("switchType")
                              ];
        var interfaceStatusInfo=[];
        var portMonCLIOP;
        var interfaceStatusInfoSummary;
        var etherChannelInfo;
        var snValue;
        $scope.etherChannelSumData = [];
        var vlanInfo;
		angular.element(".btnView").hide();
		angular.element(".pageLoader").show();

        $scope.getStackSwitchIdentity = function(portsObj){
            var portName = portsObj.Port;
            var switchNumber = portName.split("/")[0][portName.split("/")[0].length-1];
            if(switchNumber == $rootScope.deviceInfo.masterId || switchNumber == 0){
                return translate("switch_master");
            }
            return translate("switch_member")+switchNumber;
        };
        // Vlan Grid Formations
        $scope.vlanInterface = function(clusterIndex){
            $scope.vlanInterfaceData = [];
            $scope.vlanInterfaceData=[];
            var arrVlan= vlanInfo.split("\n"), findStatus="";
            var shwRunVlanCLIOp = [];
            var vlanCLI="";
            for (var i=1; i < arrVlan.length; i++) {
                var portsObj = {};
                if(arrVlan[i].substring(0,22).trim().indexOf("Vlan")!=-1){
                    portsObj["Port"] = arrVlan[i].substring(0,22).trim();
                    vlanCLI+="show running-config interface "+portsObj["Port"]+"\n";
                    portsObj["Vlan"] = arrVlan[i].substring(22,39).trim();
                    portsObj["Duplex"] = "-";
                    portsObj["PktDrop"] = "0";
                    portsObj["RxBytes"] = "0";
                    portsObj["PortType"] = "Routed";
                    portsObj["Power"] = "0.0";
                    portsObj["Speed"] = "-";
                    portsObj["Type"] = "";
                    portsObj["TxBytes"] = "0";
                    //72 to 77 for protocol column
                    findStatus = arrVlan[i].substring(72,77).trim();
                    if(findStatus === "up"){
                        portsObj["Status"] = "connected";
                    }else{
                        portsObj["Status"] = "not connected";
                    }
                    portsObj["switchId"] = snValue;
                    if (clusterIndex == 0) {
                        portsObj["SwitchType"] = $rootScope.deviceInfo.stackingInfo.type === "CLUSTER" ? translate("switch_master"): ($rootScope.deviceInfo.stackingInfo.type === "STACK"? translate("switch_master"):translate("stack_standalone"));
                    } else {
                        portsObj["SwitchType"] = translate("switch_member") + clusterIndex;
                    }
                    $scope.vlanInterfaceData.push(portsObj)
                }
            }
            var vlanShowRunOP;
            if(clusterIndex == 0){
                vlanShowRunOP = deviceCommunicatorCLI.getExecCmdOutput(vlanCLI);
            } else{
                vlanShowRunOP = clusterCmdService.getMultiShowCmdOutput(vlanCLI,snValue);
            };
            for (var i=0; i < vlanShowRunOP.length; i++) {
            	var vlanName ="";
            	if(vlanShowRunOP[i].indexOf("FORM METHOD=POST")!=-1){
            		 var vlanOP=vlanShowRunOP[i].split("Building configuration...")
            		 vlanName = executeCliCmdService.getNextString(vlanOP[1],["interface"],["\n"]).trim();
            	}else{
            		 vlanName = executeCliCmdService.getNextString(vlanShowRunOP[i],["interface"],["\n"]).trim();
            	}
                var vlanIndex = $scope.vlanInterfaceData.map(function(e) {
                    return e.Port;
                }).indexOf(vlanName);
                $scope.vlanInterfaceData[vlanIndex]["Name"] = executeCliCmdService.getNextString(vlanShowRunOP[i],["description"],["\n"]).trim();
            }
            for(var vif = 0; vif < $scope.vlanInterfaceData.length; vif++){
                interfaceStatusInfoSummary.push($scope.vlanInterfaceData[vif]);
            }
        };

        //Ether Channel Port Information
        $scope.etherChannelSummary = function(clusterIndex){
            var arrStatus=etherChannelInfo.split("Group  Port-channel")[1].split("\n");
            for (var i=2; i < arrStatus.length; i++) {
                var portsObj = {};
                portsObj["group"] = arrStatus[i].substring(0,5).trim();
                portsObj["portChannel"] =arrStatus[i].substring(6,18).trim();
                portsObj["protocol"] = arrStatus[i].substring(19,30).trim();
                portsObj["ports"] = arrStatus[i].substring(31,80).trim();
                if (clusterIndex == 0) {
                    portsObj["SwitchType"] = $rootScope.deviceInfo.stackingInfo.type === "CLUSTER" ? translate("switch_master"): ($rootScope.deviceInfo.stackingInfo.type === "STACK"? translate("switch_master"):translate("stack_standalone"));
                } else {
                    portsObj["SwitchType"] = translate("switch_member") + clusterIndex;
                }
                $scope.etherChannelSumData.push(portsObj)
            }
            for(var ether=0; ether < $scope.etherChannelSumData.length; ether++){
                $scope.etherChannelSumData[ether].portChannel = $scope.etherChannelSumData[ether].portChannel.replace(/ *\([^)]*\) */g, "");
                $scope.etherChannelSumData[ether].ports = $scope.etherChannelSumData[ether].ports.replace(/ *\([^)]*\) */g, ",").replace(/\,$/, '');
            }
			$scope.etherChannelDataSource = new kendo.data.DataSource({
				pageSize : 10,
				data : $scope.etherChannelSumData
			});
        };
		
       
        var loadMaster = true;
        $scope.showInterfaceStatusInfo = function(clusterMembersCollection){
            var unitSwitch = 0;
            interfaceStatusInfoSummary=[];
			$scope.etherChannelSumData = [];
            var portMonCLI="show interfaces status\n show running-config | s interface\n show interfaces counters\n show power inline\n show interfaces\n show etherchannel summary\n show controllers ethernet-controller\n show ip interface brief";
            //var clusterIndex = 0;
            for(var clusterIndex=0; clusterIndex<clusterMembersCollection.length;  clusterIndex++) {
                var memberIndex = clusterMembersCollection[clusterIndex];
                interfaceStatusInfo=[];
                if (memberIndex == "0" ) {//&& loadMaster && clusterMembersCollection.length==1
                    loadMaster = false;
                    snValue = 0
                    portMonCLIOP = deviceCommunicatorCLI.getExecCmdOutput(portMonCLI);
                } else  {
                    snValue = memberIndex;
                    var allMemberId =$rootScope.deviceInfo.clusterMembersInfo;
                       var memIndex = allMemberId.findIndex(function(memItem, mid){
                       return memItem.sn === snValue;
                    });
                   if($rootScope.deviceInfo.clusterMembersInfo[memIndex].state == "Up") {
                    portMonCLIOP = clusterCmdService.getMultiShowCmdOutput(portMonCLI, snValue);                    
                    var portMonCLIOPNewOP=[];
                    for (var i=0; i < portMonCLIOP.length; i++) {
                    	var portMonMemberOP="";
                    	if(portMonCLIOP[i].indexOf("FORM METHOD=POST")!=-1){
                    		portMonMemberOP=portMonCLIOP[i].split('CR">')[1].trim();
                    	}else{
                    		portMonMemberOP=portMonCLIOP[i];
                    	}
                    	portMonCLIOPNewOP.push(portMonMemberOP);
                    }
                    portMonCLIOP=portMonCLIOPNewOP;
                    } else {
                        /* The cluster member is down */
                        //continue;
                    }    
                }
            etherChannelInfo = portMonCLIOP[5];
            vlanInfo  = portMonCLIOP[7];
            var arrStatus=portMonCLIOP[0].split("\n");
    		for (var i=1; i < arrStatus.length; i++) {
    			var portsObj = {};
    			portsObj["Port"] = arrStatus[i].substring(0,8).trim();
    			portsObj["Name"] =arrStatus[i].substring(9,28).trim();
    		    portsObj["Status"] =arrStatus[i].substring(29,41).trim();
    		    portsObj["Vlan"] =arrStatus[i].substring(42,52).trim();
    		    portsObj["Duplex"] = arrStatus[i].substring(53,59).trim();
    		    portsObj["Speed"] = arrStatus[i].substring(60,66).trim();
    		    portsObj["Type"] = arrStatus[i].substring(67,90).trim();
				portsObj["switchId"] = snValue;
				if (memberIndex == 0) {
					portsObj["SwitchType"] = $rootScope.deviceInfo.stackingInfo.type === "CLUSTER" ? translate("switch_master"): ($rootScope.deviceInfo.stackingInfo.type === "STACK"? $scope.getStackSwitchIdentity(portsObj):translate("stack_standalone"));
				} else {
					portsObj["SwitchType"] = translate("switch_member") + memberIndex;
				}
    		    interfaceStatusInfo.push(portsObj)
    		}
    		var portTypeDetails=[];
    		var interfacesRunningConfig=portMonCLIOP[1].split("interface");
            for(var irc = 1; irc < interfacesRunningConfig.length; irc++){
                var portsObjIRC = {};
                intShowRun="interface "+interfacesRunningConfig[irc];
                portsObjIRC["PortName"] = executeCliCmdService.getNextString(intShowRun,["interface"],["\n"]).trim();
                if(intShowRun.indexOf("no switchport")!=-1){
                    portsObjIRC["isRouted"] = "no";
                }else{
                    portsObjIRC["isRouted"] = "";
                }
                portsObjIRC["vlan"]= executeCliCmdService.getNextString(intShowRun,["switchport trunk allowed vlan"],["\n"]).trim();
                portsObjIRC["mode"] = executeCliCmdService.getNextString(intShowRun,["switchport mode"],["\n"]).trim();
                if(intShowRun.indexOf("ip address dhcp")!=-1){
                	 var dhcpStatus = executeCliCmdService.getNextString(intShowRun,["ip address dhcp "],["\n"]).trim().split(" ");
                	 if(dhcpStatus.length > 1){
                		 portsObjIRC["ipAddress"] =dhcpStatus[1];
                	 }else{
                		 portsObjIRC["ipAddress"] =dhcpStatus[0];
                	 }
                }else if(intShowRun.indexOf("ip address pool")!=-1){
                	 portsObjIRC["ipAddress"] = executeCliCmdService.getNextString(intShowRun,["ip address pool"],["\n"]).trim().split(" ")[0];
                }else{
                	 portsObjIRC["ipAddress"] = executeCliCmdService.getNextString(intShowRun,["ip address"],["\n"]).trim().split(" ")[0];
                }               
                //Finding set of trunk allowed vlans
                var trunkVlanList="";
                trunkVlanList =   executeCliCmdService.getNextString(intShowRun,["switchport trunk allowed vlan"],["\n"]).trim();
                var strLines = getStringLineService.getLines(intShowRun,["switchport trunk allowed vlan add "]);
                if (strLines != null) {
                    for (var m=0; m<strLines.length; m++) {
                        trunkVlanList +=","+executeCliCmdService.getNextString(strLines[m],["switchport trunk allowed vlan add "],["\n"]);
                    }
                }
                portsObjIRC["trunkVlanLists"] =trunkVlanList;
                portTypeDetails.push(portsObjIRC);
            }
            var vlanIdDetails = new kendo.data.ObservableArray([]);
            for (var ind in interfaceStatusInfo) {
				if (interfaceStatusInfo.hasOwnProperty(ind)) {
					vlanIdDetails.push(interfaceStatusInfo[ind].Vlan);
				}
            }

            var deviceInterface=null;
            for (var ifsi in interfaceStatusInfo){
                if (interfaceStatusInfo.hasOwnProperty(ifsi)) {
                    for (var j in portTypeDetails) {
                        if (portTypeDetails.hasOwnProperty(j)) {
                            deviceInterface=portTypeDetails[j].PortName;
                            if(deviceInterface.indexOf("TenGigabitEthernet")!=-1){
                                deviceInterface=deviceInterface.replace("TenGigabitEthernet","Te")
                            } else if(deviceInterface.indexOf("GigabitEthernet")!=-1){
                                deviceInterface=deviceInterface.replace("GigabitEthernet","Gi")
                            }else if(deviceInterface.indexOf("FastEthernet")!=-1){
                                deviceInterface=deviceInterface.replace("FastEthernet","Fa")
                            }else if(deviceInterface.indexOf("Port-channel")!=-1){
                                deviceInterface=deviceInterface.replace("Port-channel","Po")
                            }
                            if(deviceInterface==interfaceStatusInfo[ifsi].Port){
                                if(portTypeDetails[j].mode === "trunk" || interfaceStatusInfo[ifsi].Vlan=="trunk") {
                                    interfaceStatusInfo[ifsi].PortType = "Trunk";
                                    interfaceStatusInfo[ifsi].Vlan=" "+portTypeDetails[j].trunkVlanLists;
                                    if(portTypeDetails[j].trunkVlanLists==""){
                                        interfaceStatusInfo[ifsi].Vlan= "ALL";
                                    }
                                } else {
                                    if(portTypeDetails[j].isRouted==="no"){
                                        interfaceStatusInfo[ifsi].PortType = "Routed";
                                        interfaceStatusInfo[ifsi].Vlan=portTypeDetails[j].ipAddress;
                                    }else{
                                        if(deviceInterface==="Fa0"){
                                            interfaceStatusInfo[ifsi].PortType = "Routed";
                                            if(portTypeDetails[j].ipAddress==="" || portTypeDetails[j].ipAddress===undefined){
                                                interfaceStatusInfo[ifsi].Vlan="1";
                                            }else{
                                                interfaceStatusInfo[ifsi].Vlan=portTypeDetails[j].ipAddress;
                                            }
                                        }else{
                                            interfaceStatusInfo[ifsi].PortType = "Access";
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (interfaceStatusInfo[ifsi].Status == "notconnect") {
                        interfaceStatusInfo[ifsi].Status = "not connected";
                    }
                }
            }
            var portsPowerInfo = [];
    		var portsMonPower =portMonCLIOP[3];
    		var arrPortsMonPower=portsMonPower.split("Interface")
    		var arrPower=arrPortsMonPower[1].split("\n");
            for (var iap=3; iap < arrPower.length; iap++) {
                var portsObjAp = {};
                var arrInnerWords = arrPower[iap].split(" ");
                for (var k=0,jiw=1; k < arrInnerWords.length; k++) {
                    if(arrInnerWords[k] == "") {
                        continue;
                    }
                    if (jiw == 1) {
                        portsObjAp["Interface"]=arrInnerWords[k].trim();
                    }
                    if (jiw == 4) {
                        portsObjAp["Power"]=arrInnerWords[k].trim();
                    }
                    jiw++;
                }
                portsPowerInfo.push(portsObjAp)
            }
            var powerData = new kendo.data.ObservableArray([]);
            for (var c in portsPowerInfo) {
				 if (portsPowerInfo.hasOwnProperty(c)) {
					powerData[portsPowerInfo[c].Interface]=portsPowerInfo[c].Power;
				 }
            }
            var modelNumber;
            var isPoECapable;
            if($rootScope.deviceInfo.stackingInfo.type === "CLUSTER"){
                if(memberIndex == 0){
                    isPoECapable = $rootScope.deviceInfo.isPoECapable;
                } else {
                	var allMemberId =$rootScope.deviceInfo.clusterMembersInfo;
                    var memIndex = allMemberId.findIndex(function(memItem, mid){
                    	return memItem.sn === memberIndex;
                    });
                    if($rootScope.deviceInfo.clusterMembersInfo[memIndex].state =="Up"){
                       modelNumber = clusterCmdService.getClusterModelNumber(snValue);
                       isPoECapable = (modelNumber.split('-')[2].indexOf('P') != -1);
                    } else {
                        /* member is down */
                        //continue;
                    }    
                }
            } else {
                isPoECapable = $rootScope.deviceInfo.isPoECapable;
            }    
			
			for (var d=0; d<interfaceStatusInfo.length; d++) {
            	if(isPoECapable){
					if (interfaceStatusInfo[d].hasOwnProperty("Port")) {
						interfaceStatusInfo[d].Power = powerData[interfaceStatusInfo[d].Port];
						if(powerData[interfaceStatusInfo[d].Port]===undefined){
							interfaceStatusInfo[d].Power ="0.0";
						}
					}else{
	            		interfaceStatusInfo[d].Power ="0.0";
	            	}
            	}else{
            		interfaceStatusInfo[d].Power ="0.0";
            	}
            }
/*for (var d in interfaceStatusInfo) {
            	if(isPoECapable){
					if (interfaceStatusInfo.hasOwnProperty(d.port)) {
						interfaceStatusInfo[d].Power = powerData[];
						if(powerData[d]===undefined){
							interfaceStatusInfo[d].Power ="0.0";
						}
					}else{
	            		interfaceStatusInfo[d].Power ="0.0";
	            	}
            	}else{
            		interfaceStatusInfo[d].Power ="0.0";
            	}
            }*/
            //setting the packet drop for each interfaces
            var portsPacketDropInfo=[];
            var strLinesInterface = getStringLineService.getLines(portMonCLIOP[4],["line protocol is"]);
            var strLinesPacketDrop = getStringLineService.getLines(portMonCLIOP[4],["Total output drops:"]);
            for(var isli = 0; isli < strLinesInterface.length; isli++){
                var portsObjSLI = {};
                portsObjSLI["interfaceName"] = strLinesInterface[isli].split(" ")[0].trim();
                portsObjSLI["totalDrop"] = executeCliCmdService.getNextString(strLinesPacketDrop[isli],["Total output drops:"],["\n"]).trim();
                portsPacketDropInfo.push(portsObjSLI);
            }
            var deviceInterface=null;
            for (var i1 in interfaceStatusInfo){
				if (interfaceStatusInfo.hasOwnProperty(i1)) {
					for (var j1 in portsPacketDropInfo) {
						if (portsPacketDropInfo.hasOwnProperty(j1)) {
							deviceInterface=portsPacketDropInfo[j1].interfaceName;
							if(deviceInterface.indexOf("TenGigabitEthernet")!=-1){
								deviceInterface=deviceInterface.replace("TenGigabitEthernet","Te");
							} else if(deviceInterface.indexOf("GigabitEthernet")!=-1){
								deviceInterface=deviceInterface.replace("GigabitEthernet","Gi");
							}else if(deviceInterface.indexOf("FastEthernet")!=-1){
								deviceInterface=deviceInterface.replace("FastEthernet","Fa");
							}else if(deviceInterface.indexOf("Port-channel")!=-1){
								deviceInterface=deviceInterface.replace("Port-channel","Po");
							}
                            if(deviceInterface==interfaceStatusInfo[i1].Port){
                                interfaceStatusInfo[i1].PktDrop=portsPacketDropInfo[j1].totalDrop;
							}else{
								interfaceStatusInfo[i1].PktDrop= "0";
							}
						}
					}
				}
            }
            var arrTotalInByteInterface=[],arrTotalOutByteInterface=[],arrTotalInByte=[],arrTotalOutByte=[],inBytesCount=0;
            var strCLIOutput1 =portMonCLIOP[2];
			var arrRxTxBytes=strCLIOutput1.split("\n");
            for (var i2=0; i2 < arrRxTxBytes.length; i2++) {
            	if(arrRxTxBytes[i2].indexOf("InOctets")!=-1){
            		inBytesCount=1;
            		continue;
            	}
            	if(arrRxTxBytes[i2].indexOf("OutOctets")!=-1){
            		inBytesCount=0;
            		continue;
            	}
				var arrInnerWords = arrRxTxBytes[i2].split(" ");
                for (var kiw=0,j2=1; kiw < arrInnerWords.length; kiw++) {
                    if(arrInnerWords[kiw] == "") {
                        continue;
                    }
                    if (j2 == 1) {
                        if(inBytesCount==1){
                            arrTotalInByteInterface.push(arrInnerWords[kiw]);
                        }else{
                            arrTotalOutByteInterface.push(arrInnerWords[kiw]);
                        }
                    } else if (j2 == 2) {
                        if(inBytesCount==1){
                            arrTotalInByte.push(arrInnerWords[kiw]);
                        }else{
                            arrTotalOutByte.push(arrInnerWords[kiw]);
                        }
                    }
                    j2++;
                }
            }
            for (var i3 in interfaceStatusInfo){
				if (interfaceStatusInfo.hasOwnProperty(i3)) {
					for (var j3=0; j3 < arrTotalInByteInterface.length; j3++) {
                        if(arrTotalInByteInterface[j3].trim() != ""){
                            if(arrTotalInByteInterface[j3]==interfaceStatusInfo[i3].Port){
    							interfaceStatusInfo[i3].TxBytes= arrTotalOutByte[j3];
    							interfaceStatusInfo[i3].RxBytes= arrTotalInByte[j3];
    						}
                        }else{
                            // else code ...
                        }
					}
				}
				if(interfaceStatusInfo[i3].Port==="Fa0"){
					var ethernetcounters =portMonCLIOP[6];
					var fa0counters = ethernetcounters.split("\n");
					var txrxcount = fa0counters[1].trim().split(" ");
					for(var index=0,fields=1;index<txrxcount.length;index++){
	    				if(txrxcount[index] == "")  {
	    					continue;
	    				}
	    				if(fields == 1){
	    					interfaceStatusInfo[i3].TxBytes=txrxcount[index];
	    				} else if (fields == 3){
	    					interfaceStatusInfo[i3].RxBytes=txrxcount[index];
	    				}
	    				fields++;
	    			}
				}
            }
            interfaceStatusInfoSummary = interfaceStatusInfoSummary.concat(interfaceStatusInfo);
            $scope.vlanInterface(memberIndex);
            $scope.etherChannelSummary(memberIndex);
        } 

            angular.element(".pageLoader").hide();
			angular.element(".btnView").show();
        };
        var clusterIndex = 0;
		$timeout(function(){
            $scope.showInterfaceStatusInfo(["0"]);
			loadPortGridOption();
			 $scope.portsDataSource = new kendo.data.DataSource({
				pageSize: 10,
				data: interfaceStatusInfoSummary 
			});
			loadEtherChannelGridOption();
			 $scope.etherChannelDataSource = new kendo.data.DataSource({
				pageSize : 10,
				data : $scope.etherChannelSumData
			});
		},10)
        
       
        //Export Port monitoring data
        $scope.getHeader = function () {
            return $scope.headersInExport;
        };
        $scope.getArray = function () {
            $scope.dataForExport = function () {
            	interfaceStatusInfoSummary.forEach(function (x) {
                        exportData.push({
                            "Port": x.Port,
                            "Name": x.Name,
                            "Status": x.Status,
                            "PortType": x.PortType,
                            "Vlan": x.Vlan,
                            "Duplex": x.Duplex,
                            "Power": x.Power,
                            "Speed": x.Speed,
                            "TxBytes": x.TxBytes,
                            "RxBytes": x.RxBytes,
                            "PktDrop": x.PktDrop,
                            "SwitchType": x.SwitchType
                        })
                    });
                return exportData;
            };
            dateTimeStamp = new Date();
            $scope.portsFileName = "PortsMonitoring" + $filter('date')(dateTimeStamp, 'yyyy-MM-dd_hh-mm-ss');
            exportData = [];
            return $scope.dataForExport;
        };
        //clear counter value for selected port
        $scope.deleteConfirmation = function() {
			$scope.commonConfirmation('delete');
		};
		$scope.commonConfirmation = function() {
			$scope.dlgCounter = dialogService.dialog({
				content : translate("msg_clear_counter_confirmation"),
				title : translate("msg_delete_confirmation_window"),
				messageType : "confirm",
				actionButtons : [{
					text : translate("com_ok"),
					callback : "counterDeleteConfirmation"
				}, {
					text : translate("com_cancel")
				}]
			});
		};
		$scope.$on("counterDeleteConfirmation", function() {
            $scope.dlgCounter.data("kendoWindow").close();    
            $timeout(function() {
                    $scope.deleteData();
            }, 1);
		});
		$scope.deleteData = function() {
			var selectedItem =$scope.currentPort;
			var clusterIndex = $scope.currentSwitchIndex;
			var configCLI = "clear counters "+selectedItem;
     		if(!$rootScope.deviceInfo.stackingInfo.type === "CLUSTER") {
				result = deviceCommunicator.getExecCmdOutput(configCLI);
			} else{
                if(clusterIndex == 0) {
                       result = deviceCommunicator.getExecCmdOutput(configCLI);
                } else{
                    if($rootScope.deviceInfo.clusterMembersInfo[clusterIndex].state =="Up"){    
       				    result = clusterCmdService.clearCounters(selectedItem, clusterIndex);
       		          } else{
                        /* member is down */
                        return;
                    }    
			    }
			}
			if(result===""){
				notificationService.showNotification(translate('clearcounter_success_msg'),translate('com_config_success_title'),'success');
			}else{
				notificationService.showNotification(result.errorResponse,translate('com_config_fail_title'),'error');
			}
			$scope.portsPacketmanualRefresh();
			$scope.portsStatusmanualRefresh();
			populateGridData(selectedItem,clusterIndex);
			$timeout(function(){$scope.clearCounterStatus = true});
			$rootScope.portNumIdentity = "";
		};
        var portsPacketTableInfo = [{
            "PortPackets": translate("ports_monitoring_total")
        }, {
            "PortPackets": translate("ports_monitoring_broadcast")
        }, {
            "PortPackets": translate("ports_monitoring_multicast")
        }, {
            "PortPackets": translate("ports_monitoring_crc_errors")
        }, {
            "PortPackets": translate("ports_monitoring_runts")
        }, {
            "PortPackets": translate("ports_monitoring_errors")
        }];

        var portsStatusTableInfo = [{
            "PortOtherStatus": translate("ports_monitoring_unidirectional_links")
        }, {
            "PortOtherStatus": translate("ports_monitoring_buffer_overflow")
        }, {
            "PortOtherStatus": translate("ports_monitoring_queue_drops")
        }, {
            "PortOtherStatus": translate("ports_monitoring_optics_intserted")
        }, {
            "PortOtherStatus": translate("ports_monitoring_loopback_enabled")
        }];
        var updateSingleSelectedRow = function(newport,newSwitchIndex,interfaceCounter){
            var portIndex = $scope.portsDataSource._data.map(function(e) {
                return e.Port == newport && e.switchId == newSwitchIndex ? e.Port : "NONE";
            }).indexOf(newport);
            var ethernetControllerInfo = interfaceCounter;
            var arrPort;
            var dataIn ="";
            var dataOut ="";
            var receiveOctets,sentOctets;
            if(interfaceCounter.indexOf("Counters information is not available for") == -1) {
                 arrPort = ethernetControllerInfo.split("\n");
                 dataIn = arrPort[1].split(" ");
                 dataOut = arrPort[4].split(" ");
            } else {
                receiveOctets =0;
                sentOctets = 0;
            }
            for(var index=0,fields=1;index<dataIn.length;index++){
                if(dataIn[index] == "")  {
                    continue;
                }
                if(fields == 2){
                    receiveOctets=dataIn[index];
                }
                fields++;
            }
            for(var index1=0,fields1=1;index1<dataOut.length;index1++){
                if(dataOut[index1]== "")  {
                    continue;
                }
                if(fields1 == 2){
                    sentOctets=dataOut[index1];
                }
                fields1++;
            }
            $scope.portsDataSource._data[portIndex].RxBytes = receiveOctets;
            $scope.portsDataSource._data[portIndex].TxBytes = sentOctets;
            return ethernetControllerInfo;
        };

        var populateGridData = function(newport,newSwitchIndex){
        	$scope.clearCounterStatus=false;
			$scope.currentPort = newport;
			$rootScope.portNumIdentity = newport;
            $scope.currentSwitchIndex = newSwitchIndex;
			if (!$scope.$$phase){
				$scope.$apply();
            }
            var portMonCLI;
            var singlePortMonCLIOP;
            portMonCLI = "show interfaces " + newport + "\n show interfaces " + newport + " counters\n show interfaces " + newport + " counters errors\n show udld " + newport + "\n ";
            if(!$rootScope.deviceInfo.stackingInfo.type === "CLUSTER") {
                singlePortMonCLIOP = deviceCommunicatorCLI.getExecCmdOutput(portMonCLI);
            }else {
                if(newSwitchIndex == 0 ){
                   singlePortMonCLIOP = deviceCommunicatorCLI.getExecCmdOutput(portMonCLI);
                } else {    
                var formatNewPort = newport.split("/").join("%5c/");
                portMonCLI = "show interfaces " + formatNewPort + "\n show interfaces " + formatNewPort + " counters\n show interfaces " + formatNewPort + " counters errors\n show udld " + formatNewPort;
                    singlePortMonCLIOP = clusterCmdService.getMultiShowCmdOutput(portMonCLI, newSwitchIndex);
                }
            }
            var portsInterfacesInfo={};
        	var strLinesInterface = getStringLineService.getLines(singlePortMonCLIOP[0],["line protocol is"]);
        	portsInterfacesInfo["Port"]=strLinesInterface[0].split(" ")[0].trim();
        	portsInterfacesInfo["loopback"]=executeCliCmdService.getNextString(singlePortMonCLIOP[0],["loopback"],["\n"]).trim();
        	portsInterfacesInfo["queueDrops"]=executeCliCmdService.getNextString(singlePortMonCLIOP[0],["Total output drops:"],["\n"]).trim();
        	var strLinesRunts = getStringLineService.getLines(singlePortMonCLIOP[0],["runts"]);
        	portsInterfacesInfo["totalRunts"]=strLinesRunts[0].split(" ")[0].trim();
        	var strLinesInputErrors = getStringLineService.getLines(singlePortMonCLIOP[0],["input errors"]);
        	portsInterfacesInfo["inputErrors"]=strLinesInputErrors[0].split(" ")[0].trim();
        	portsInterfacesInfo["totalCRC"]=strLinesInputErrors[0].split(" ")[3].trim();
        	var strLinesOutputErrors = getStringLineService.getLines(singlePortMonCLIOP[0],["output errors"]);
        	portsInterfacesInfo["outputErrors"]=strLinesOutputErrors[0].split(" ")[0].trim();
        	var strLinesOutputBuffer = getStringLineService.getLines(singlePortMonCLIOP[0],["output buffers"]);
        	portsInterfacesInfo["outputbuffers"]=strLinesOutputBuffer[0].split(" ")[5].trim();
        	//Input and Output Packets
            var strLinesIPPackets = getStringLineService.getLines(singlePortMonCLIOP[0],["packets input,"]);
            var receiveOctets1=strLinesIPPackets[0].trim().split(" ")[0].trim();
            var strLinesOPPackets = getStringLineService.getLines(singlePortMonCLIOP[0],["packets output,"]);
            var sentOctets1=strLinesOPPackets[0].trim().split(" ")[0].trim();
            var ethernetControllerInfo = updateSingleSelectedRow(newport,newSwitchIndex,singlePortMonCLIOP[1]);
            var receiveOctets,receiveUcastPkts,receiveMcastPkts,receiveBcastPkts,sentOctets,sentUcastPkts,sentMcastPkts,sentBcastPkts;
            if(ethernetControllerInfo.indexOf("Counters information is not available")!=-1){
            	receiveOctets="NA";
            	receiveOctets1="NA";
				receiveUcastPkts="NA";
				receiveMcastPkts="NA";
				receiveBcastPkts="NA";
				sentOctets="NA";
				sentOctets1="NA";
				sentUcastPkts="NA";
				sentMcastPkts="NA";
				sentBcastPkts="NA";
             }else{
            	var arrPort=ethernetControllerInfo.split("\n");
    			var dataIn = arrPort[1].split(" ");
    			var dataOut = arrPort[4].split(" ");
    			for(var index=0,fields=1;index<dataIn.length;index++){
    				if(dataIn[index] == "")  {
    					continue;
    				}
    				if(fields == 2){
    					receiveOctets=dataIn[index];
    				} else if (fields == 3){
    					receiveUcastPkts=dataIn[index];
    				} else if(fields == 4){
    					receiveMcastPkts=dataIn[index];
    				} else if(fields == 5){
    					receiveBcastPkts=dataIn[index];
    				}
    				fields++;
    			}
    			for(var index1=0,fields1=1;index1<dataOut.length;index1++){
    				if(dataOut[index1]== "")  {
    					continue;
    				}
    				if(fields1 == 2){
    					sentOctets=dataOut[index1];
    				} else if (fields1 == 3){
    					sentUcastPkts=dataOut[index1];
    				} else if(fields1 == 4){
    					sentMcastPkts=dataOut[index1];
    				} else if(fields1 == 5){
    					sentBcastPkts=dataOut[index1];
    				}
    				fields1++;
    			}
            }
		    var counterErrorsInfo={};
		    var counterErrorsInfo1 =singlePortMonCLIOP[2];
		    if(counterErrorsInfo1.indexOf("Counters information is not available")!=-1){
		    	counterErrorsInfo.crcReceived="NA";
	            counterErrorsInfo.runtsReceived="NA";
	            counterErrorsInfo.crcSent="NA";
	            counterErrorsInfo.runtSent="NA";
		    }else{
		    	var arrCounterInfo=singlePortMonCLIOP[2].split("\n");
				var arrInnerWords = arrCounterInfo[1].split(" ");
				for (var k=0,j=1; k < arrInnerWords.length; k++) {
						if(arrInnerWords[k] == "") {
				 			continue;
			 			}
						if (j == 5) {
							counterErrorsInfo.crcReceived=arrInnerWords[k].trim();
			 			}
			 		   	j++;
				}
				var arrInnerWords = arrCounterInfo[4].split(" ");
				for (var k=0,j=1; k < arrInnerWords.length; k++) {
						if(arrInnerWords[k] == "") {
				 			continue;
			 			}
						if (j == 7) {
							counterErrorsInfo.runtsReceived=arrInnerWords[k].trim();
			 			}
			 		   	j++;
				}
	            counterErrorsInfo.crcSent="0";
	            counterErrorsInfo.runtSent="0";
            }

            var udldInfo ={};
            udldInfo.uniDirectionalLinks = executeCliCmdService.getNextString(singlePortMonCLIOP[3],["Current bidirectional state:"],["\n"]).trim();
            var sfpInf="Not Present";
            for (var i in interfaceStatusInfoSummary){
               	if(newport===interfaceStatusInfoSummary[i].Port && newSwitchIndex ==interfaceStatusInfoSummary[i].switchId && interfaceStatusInfoSummary[i].Type==="10/100/1000BaseTX"){
               		sfpInf="NA";
               	}
           }
            var deviceInterface=null;
            var portsInventoryInfo =requestRoutingService.getShowCmdOutput("show inventory", "portsMonInventory");
            if(portsInventoryInfo.ShowInventory.name){
	            if (portsInventoryInfo.ShowInventory.name.length > 0) {
	               for (var i4 in portsInventoryInfo.ShowInventory.name) {
	                    intname = portsInventoryInfo.ShowInventory.name[i4].interfaceName.replace(/\,/g,"");
	                    sfpInfo = portsInventoryInfo.ShowInventory.name[i4].sfpInfo.replace(/\,/g,"");
	                    pid = portsInventoryInfo.ShowInventory.name[i4].pid.replace(/\,/g,"");
	                    intname = portsInventoryInfo.ShowInventory.name[i4].interfaceName.replace(/"/g,"");
	                    intname = intname.replace(",","");
	                    sfpInfo = portsInventoryInfo.ShowInventory.name[i4].sfpInfo.replace(/"/g,"");
	                    pid = portsInventoryInfo.ShowInventory.name[i4].pid.replace(/"/g,"");
	                    deviceInterface=intname;
	                    if(deviceInterface.indexOf("TenGigabitEthernet")!=-1){
	                		deviceInterface=deviceInterface.replace("TenGigabitEthernet","Te");
	                	}else if(deviceInterface.indexOf("GigabitEthernet")!=-1){
	                		deviceInterface=deviceInterface.replace("GigabitEthernet","Gi");
	                	}else if(deviceInterface.indexOf("FastEthernet")!=-1){
	                		deviceInterface=deviceInterface.replace("FastEthernet","Fa");
	                	}else if(deviceInterface.indexOf("Port-channel")!=-1){
	                		deviceInterface=deviceInterface.replace("Port-channel","Po");
	                	}
	                    if (deviceInterface ==newport){
	                         sfpInf=sfpInfo;
	                    }
					}
	            }else{
	            	 intname = portsInventoryInfo.ShowInventory.name.interfaceName.replace(/\,/g,"");
	                 sfpInfo = portsInventoryInfo.ShowInventory.name.sfpInfo.replace(/\,/g,"");
	                 pid     = portsInventoryInfo.ShowInventory.name.pid.replace(/\,/g,"");
	                 intname = portsInventoryInfo.ShowInventory.name.interfaceName.replace(/"/g,"");
	                 intname = intname.replace(",","");
	                 sfpInfo = portsInventoryInfo.ShowInventory.name.sfpInfo.replace(/"/g,"");
	                 pid     = portsInventoryInfo.ShowInventory.name.pid.replace(/"/g,"");
	                 deviceInterface=intname;
	                 if(deviceInterface.indexOf("TenGigabitEthernet")!=-1){
	                		deviceInterface=deviceInterface.replace("TenGigabitEthernet","Te");
	                 }else if(deviceInterface.indexOf("GigabitEthernet")!=-1){
	                		deviceInterface=deviceInterface.replace("GigabitEthernet","Gi");
	                 }else if(deviceInterface.indexOf("FastEthernet")!=-1){
	                		deviceInterface=deviceInterface.replace("FastEthernet","Fa");
	                 }else if(deviceInterface.indexOf("Port-channel")!=-1){
	                		deviceInterface=deviceInterface.replace("Port-channel","Po");
	                 }
	                 if (deviceInterface ==newport){
	                         sfpInf=sfpInfo;
	                 }
	            }
            }
            portsInterfacesInfo.totalErrors = parseInt(portsInterfacesInfo.inputErrors) + parseInt(portsInterfacesInfo.outputErrors);
            var packetsTotal,broadcastFramesTotalData,multicastFramesTotalData;
            if(receiveOctets=="NA"){
            	packetsTotal="NA";
            	broadcastFramesTotalData="NA";
            	multicastFramesTotalData="NA";
            }else{
            	packetsTotal= parseFloat(receiveOctets1) + parseFloat(sentOctets1);
            	broadcastFramesTotalData = parseFloat(receiveBcastPkts) + parseFloat(sentBcastPkts);
            	multicastFramesTotalData = parseFloat(receiveMcastPkts) + parseFloat(sentMcastPkts);
            }
            if(udldInfo.uniDirectionalLinks=="Unknown"){
                udldInfo.uniDirectionalLinksState = "Yes";
            }
            else{
                udldInfo.uniDirectionalLinksState = "No";
			}
            if(portsInterfacesInfo.loopback =="not set"){
                portsInterfacesInfo.loopbackinfo = "No";
			}
            else{
                portsInterfacesInfo.loopbackinfo = "Yes";
			}
            if(udldInfo==""){
            	udldInfo.uniDirectionalLinksState="NA";
            }
            var portsPacketTableInfo = [{
                "PortPackets": translate("ports_monitoring_total"),
                "TotalPackets": packetsTotal,
                "SentPackets": sentOctets1,
                "ReceivedPackets":receiveOctets1
            }, {
                "PortPackets": translate("ports_monitoring_broadcast"),
                "TotalPackets": broadcastFramesTotalData,
                "SentPackets": sentBcastPkts,
                "ReceivedPackets": receiveBcastPkts
            }, {
                "PortPackets": translate("ports_monitoring_multicast"),
                "TotalPackets": multicastFramesTotalData,
                "SentPackets": sentMcastPkts,
                "ReceivedPackets": receiveMcastPkts
            }, {
                "PortPackets": translate("ports_monitoring_crc_errors"),
                "TotalPackets": portsInterfacesInfo.totalCRC,
                "SentPackets": counterErrorsInfo.crcSent,
                "ReceivedPackets": portsInterfacesInfo.totalCRC
            }, {
                "PortPackets": translate("ports_monitoring_runts"),
                "TotalPackets": portsInterfacesInfo.totalRunts,
                "SentPackets": counterErrorsInfo.runtSent,
                "ReceivedPackets": counterErrorsInfo.runtsReceived
            }, {
                "PortPackets": translate("ports_monitoring_errors"),
                "TotalPackets": portsInterfacesInfo.totalErrors,
                "SentPackets":portsInterfacesInfo.outputErrors,
                "ReceivedPackets": portsInterfacesInfo.inputErrors
            }];
            angular.element("#portsPacketGrid").data('kendoGrid').dataSource.data([]);
			for (var i5=0;i5<portsPacketTableInfo.length; i5++ ) {
				if(!portsPacketTableInfo[i5].TotalPackets || portsPacketTableInfo[i5].TotalPackets=="" ){
					portsPacketTableInfo[i5].TotalPackets = 0;
				}
				if(!portsPacketTableInfo[i5].SentPackets || portsPacketTableInfo[i5].SentPackets==""){
					portsPacketTableInfo[i5].SentPackets = 0;
				}
				if(!portsPacketTableInfo[i5].ReceivedPackets || portsPacketTableInfo[i5].ReceivedPackets==""){
					portsPacketTableInfo[i5].ReceivedPackets = 0;
				}
                $scope.portsPacketGrid.dataSource.add({
                    "PortPackets":portsPacketTableInfo[i5].PortPackets,
                    "TotalPackets": portsPacketTableInfo[i5].TotalPackets,
                    "SentPackets": portsPacketTableInfo[i5].SentPackets,
                    "ReceivedPackets": portsPacketTableInfo[i5].ReceivedPackets
                });
            }
            var portsStatusTableInfo = [{
                "PortOtherStatus": translate("ports_monitoring_unidirectional_links"),
                "PortStatus": udldInfo.uniDirectionalLinksState
            }, {
                "PortOtherStatus": translate("ports_monitoring_buffer_overflow"),
                "PortStatus": portsInterfacesInfo.outputbuffers
            }, {
                "PortOtherStatus": translate("ports_monitoring_queue_drops"),
                "PortStatus": portsInterfacesInfo.queueDrops
            },  {
                "PortOtherStatus": translate("ports_monitoring_optics_intserted"),
                "PortStatus":sfpInf
            }, {
                "PortOtherStatus": translate("ports_monitoring_loopback_enabled"),
                "PortStatus": portsInterfacesInfo.loopbackinfo
            }];
            angular.element("#portsStatusGrid").data('kendoGrid').dataSource.data([]);
            for (var i6=0;i6<portsStatusTableInfo.length; i6++ ) {
                $scope.portsStatusGrid.dataSource.add({
                    "PortOtherStatus":portsStatusTableInfo[i6].PortOtherStatus,
                    "PortStatus": portsStatusTableInfo[i6].PortStatus
                });
            }
        };
        function unpopulateGridData(){
            var portsPacketTableInfo = [{
                "PortPackets": translate("ports_monitoring_total"),
                "TotalPackets": "",
                "SentPackets": "",
                "ReceivedPackets":""
            }, {
                "PortPackets": translate("ports_monitoring_broadcast"),
                "TotalPackets": "",
                "SentPackets": "",
                "ReceivedPackets": ""
            }, {
                "PortPackets": translate("ports_monitoring_multicast"),
                "TotalPackets": "",
                "SentPackets": "",
                "ReceivedPackets": ""
            }, {
                "PortPackets": translate("ports_monitoring_crc_errors"),
                "TotalPackets": "",
                "SentPackets": "",
                "ReceivedPackets": ""
            }, {
                "PortPackets": translate("ports_monitoring_runts"),
                "TotalPackets": "",
                "SentPackets": "",
                "ReceivedPackets": ""
            }, {
                "PortPackets": translate("ports_monitoring_errors"),
                "TotalPackets": "",
                "SentPackets":"",
                "ReceivedPackets": ""
            }];
            angular.element("#portsPacketGrid").data('kendoGrid').dataSource.data([]);
            for (var i7=0;i7<portsPacketTableInfo.length; i7++ ) {
                $scope.portsPacketGrid.dataSource.add({
                    "PortPackets":portsPacketTableInfo[i7].PortPackets,
                    "TotalPackets": portsPacketTableInfo[i7].TotalPackets,
                    "SentPackets": portsPacketTableInfo[i7].SentPackets,
                    "ReceivedPackets": portsPacketTableInfo[i7].ReceivedPackets
                });
            }
            var portsStatusTableInfo = [{
                "PortOtherStatus": translate("ports_monitoring_unidirectional_links"),
                "PortStatus": ""
            }, {
                "PortOtherStatus": translate("ports_monitoring_buffer_overflow"),
                "PortStatus": ""
            }, {
                "PortOtherStatus": translate("ports_monitoring_queue_drops"),
                "PortStatus": ""
            },  {
                "PortOtherStatus": translate("ports_monitoring_optics_intserted"),
                "PortStatus":""
            }, {
                "PortOtherStatus": translate("ports_monitoring_loopback_enabled"),
                "PortStatus": ""
            }];
            angular.element("#portsStatusGrid").data('kendoGrid').dataSource.data([]);
            for (var i8=0;i8<portsStatusTableInfo.length; i8++ ) {
                $scope.portsStatusGrid.dataSource.add({
                    "PortOtherStatus":portsStatusTableInfo[i8].PortOtherStatus,
                    "PortStatus": portsStatusTableInfo[i8].PortStatus
                });
            }
        };
        $scope.$on('portSelected', function(event, args) {
            angular.element(".blink").removeClass("selectSwitch1");
            angular.element(".status").removeClass("selectSwitch1");
            angular.element(args.event.target).addClass("selectSwitch1");
            var selectedPort = args.object;
             //Select the port in the grid
            if(selectedPort!=null) {
            	populateGridData(selectedPort.uniqueId,selectedPort.switchId);
 				var nIndex;
 				angular.forEach($scope.portsGrid._data, function($value,$index){
 					var allElement = $scope.portsGrid.tbody[0].childNodes[$index];
 					angular.element(allElement).removeClass("k-state-selected");
 					if($value.Port == selectedPort.uniqueId){
 						nIndex = $index;
 						var curElement = $scope.portsGrid.tbody[0].childNodes[nIndex];
 						angular.element(curElement).addClass("k-state-selected");
 					}
 				});
            }
            else{
            	$scope.currentPort = "";
				$rootScope.portNumIdentity = "";
                unpopulateGridData();
            }
        });

        // Member switch block selection inherited from switch controller
        $scope.storeSlaves = ["0"];
        $scope.$on('memberSelected', function(event, msData){        	
            var $index = $scope.storeSlaves.indexOf(msData.object.id);
            if($index !== -1){
                $scope.storeSlaves.splice($index, 1);
            }else{
                $scope.storeSlaves.push(msData.object.id);
            }
			angular.element(".portMonitor").show();
			$timeout(function(){
				$scope.showInterfaceStatusInfo($scope.storeSlaves);
				$scope.portsDataSource = new kendo.data.DataSource({
					pageSize: 10,
					data: interfaceStatusInfoSummary 
				});
				angular.element(".portMonitor").hide();
				angular.element("#SwitchLoad_"+msData.name).hide();
			},10)
        });

        
        var showPortEdit = function () {
            var selected = this.dataItem(this.select());
            if(selected!=null) {
                var newport = selected.Port;
				$rootScope.$broadcast('portRowSelected',selected);
                populateGridData(newport,selected.switchId);
            } else{
            	$scope.currentPort = "";
				$rootScope.portNumIdentity = "";
                unpopulateGridData();
                $scope.clearCounterStatus=true;
            }
        };
        $scope.portsPacketDataSource = new kendo.data.DataSource({
            pageSize : 10,
            data : portsPacketTableInfo
        });
        $scope.portsStatusDataSource = new kendo.data.DataSource({
            pageSize : 10,
            data : portsStatusTableInfo
        });

        $scope.formatDefaultValueTemplate = function(value,num){
            if(!value){
                value = num;
            }
            return value;
        };
		var loadPortGridOption = function(){
			$scope.portsGridOptions = {
				editable: false,
				sortable: true,
				reorderable: true,
				change: showPortEdit,
				filterable: {
					extra: false,
					operators: {
						string: {
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
				scrollable: false,
				selectable: true,
				pageable: {
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
					previousNext: true,
					info: true,
					refresh: true,
					pageSizes: gridCrudService.grid_page_sizes,
					buttonCount: 5
				},
				columns: [{
					field: "Port",
					title: translate("ports_monitoring_description_switchport"),
					width:20
				}, {
					field: "Name",
					title: translate("ports_monitoring_description_desc"),
					width:20
				}, {
					field: "Status",
					title: translate("ports_monitoring_description_status"),
					width:20
				}, {
					field: "PortType",
					title: translate("ports_monitoring_description_porttype"),
					width:20
				}, {
					field: "Vlan",
					title: translate("ports_monitoring_description_vlanip"),
					template : "{{ formatDefaultValueTemplate(dataItem.Vlan,1) }}",
					width:20
				}, {
					field: "Duplex",
					title: translate("ports_monitoring_description_duplex"),
					width:20
				}, {
					field: "Power",
					title: translate("ports_monitoring_description_power"),
					width:20
				}, {
					field: "Speed",
					title: translate("ports_monitoring_description_speed"),
					width:20
				}, {
					field: "TxBytes",
					title: translate("ports_monitoring_description_txbytes"),
					template : "{{ formatDefaultValueTemplate(dataItem.TxBytes,0) }}",
					width:20
				}, {
					field: "RxBytes",
					title: translate("ports_monitoring_description_rxbytes"),
					template : "{{ formatDefaultValueTemplate(dataItem.RxBytes,0) }}",
					width:20
				}, {
					field : "PktDrop",
					title: translate("ports_monitoring_description_pktdrop"),
					template : "{{ formatDefaultValueTemplate(dataItem.PktDrop,0) }}",
					width:20
				},{
				   field : "SwitchType",
				   title: translate("switchType"),
				   width:20
				}]
			};
		}
        $timeout(function(){
            angular.element("#portsGrid").find('.k-pager-refresh').click(function(){
				$rootScope.portNumIdentity = "";
                $scope.manualGridRefresh();
				$scope.portsPacketmanualRefresh();
				$scope.portsStatusmanualRefresh();
            });
        },10);
        // Manual refresh the kendo ui grid table
        $scope.manualGridRefresh = function() {
            $scope.showInterfaceStatusInfo($scope.storeSlaves);
            var grid = angular.element("#portsGrid").data("kendoGrid");
            $scope.formGridData = new kendo.data.ObservableArray(interfaceStatusInfoSummary);
            $scope.portsDataSource = new kendo.data.DataSource({
                pageSize: 10,
                data: $scope.formGridData
            });
            grid.dataSource = $scope.portsDataSource;
            $scope.portsDataSource.read();
            grid.refresh();
            $scope.currentPort = "";
            $scope.currentSwitchIndex="";
            $timeout(function(){$scope.clearCounterStatus = true});
        }
		$scope.portsPacketmanualRefresh = function(){
			var grid = angular.element("#portsPacketGrid").data("kendoGrid");
			$scope.portsPacketDataSource = new kendo.data.DataSource({
				pageSize : 10,
				data : portsPacketTableInfo
			});
			grid.dataSource = $scope.portsPacketDataSource;
            $scope.portsPacketDataSource.read();
            grid.refresh();
		}
		$scope.portsStatusmanualRefresh = function(){
			var grid = angular.element("#portsStatusGrid").data("kendoGrid");
			$scope.portsStatusDataSource = new kendo.data.DataSource({
				pageSize : 10,
				data : portsStatusTableInfo
			});
			grid.dataSource = $scope.portsStatusDataSource;
            $scope.portsStatusDataSource.read();
            grid.refresh();
		}
        $scope.portsPacketGridOptions = {
            editable: false,
            sortable: true,
			filterable:false,
            scrollable: false,
            selectable: true,
            columns: [{
                field: "PortPackets",
                title: translate("ports_monitoring_packets")
            }, {
                field: "TotalPackets",
                title: translate("ports_monitoring_total")
            }, {
                field: "SentPackets",
                title: translate("ports_monitoring_sent")
            }, {
                field: "ReceivedPackets",
                title: translate("ports_monitoring_received")
            }]
        };



        $scope.portsStatusGridOptions = {
            editable: false,
            sortable: true,
            filterable:false,
            scrollable: false,
            selectable: true,
            columns: [{
                field: "PortOtherStatus",
                title: translate("ports_monitoring_otherstatus"),
                width: "60%"
            }, {
                field: "PortStatus",
                title: translate("ports_monitoring_status"),
                width: "40%"
            }]
        };
		var loadEtherChannelGridOption=function(){
        $scope.etherChannelGridOptions = {
            editable : false,
            sortable : true,
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
            scrollable : false,
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
                pageSizes : gridCrudService.grid_page_sizes,
                buttonCount : 5
            },
            columns: [{
                field: "group",
                title: translate("management_snmp_v3user_group")
            }, {
                field: "portChannel",
                title: translate("etherchannel_port_hannel")
            },{
                field: "protocol",
                title: translate("etherchannel_protocol")
            },{
                field: "ports",
                title: translate("com_ports")
            },{
                field : "SwitchType",
                title: translate("switchType")
            }]
        };
		}
        $scope.vlanGridOptions = {
            editable : false,
            sortable : true,
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
            scrollable : false,
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
                pageSizes : gridCrudService.grid_page_sizes,
                buttonCount : 5
            },
            columns: [{
                field: "interface",
                title: translate("portconfig_general_interface")
            }, {
                field: "ipaddress",
                title: translate("management_snmp_host_ipaddress")
            },{
                field: "status",
                title: translate("com_status")
            },{
                field: "description",
                title: translate("portconfig_general_description")
            }]
        }
    }
]);
