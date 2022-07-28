/**
 Description: Switch Service
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */

/**
 Description: Switch data service provides all the capabilities of the switch
 			  and the data required to render the switch view.
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.service("switchDataService",['$rootScope','requestRoutingService','executeCliCmdService','getStringLineService',function($rootScope,requestRoutingService,executeCliCmdService,getStringLineService){
	this.getSwitchViewData = function(){
		var switchViewData = {};
		//Executing all required CLIs by separating \n for switch view with stack
		var switchViewCLI="";
		if($rootScope.deviceInfo.type.indexOf("CDB")!=-1){
			if($rootScope.deviceInfo.isStackingSupported){
				switchViewCLI="show version\n show interface status\n show power inline\n show inventory | format\n show switch | i Master\n show switch\n show version | begin Switch Ports\n show coap stats\n ";
			}else{
				switchViewCLI="show version\n show interface status\n show power inline\n show inventory | format\n show coap stats\n";
			}
        }else{
        	if($rootScope.deviceInfo.isStackingSupported){
    			switchViewCLI="show version\n show interface status\n show power inline\n show inventory | format\n show switch | i Master\n show switch\n show version | begin Switch Ports\n";
    		}else{
    			switchViewCLI="show version\n show interface status\n show power inline\n show inventory | format\n";
    		}
        }
		//Returning array that contains all the given CLI O/P
        var switchViewCLIOP = deviceCommunicatorCLI.getExecCmdOutput(switchViewCLI);
		//set coap Status for selecon device
        if($rootScope.deviceInfo.type.indexOf("CDB")!=-1){
        	switchViewData.coapStatus=true;
    		var coapStatus ="";
    		if($rootScope.deviceInfo.isStackingSupported){
    			coapStatus=	switchViewCLIOP[7];
    		}else{
    			coapStatus=	switchViewCLIOP[4];
    		}
    		if(coapStatus.indexOf("COAP is disabled")!=-1){
    			switchViewData.coapDisabledStatus=true;
    			switchViewData.coapEnabledStatus=false;
    		}else{
    			switchViewData.coapEnabledStatus=true;
    			switchViewData.coapDisabledStatus=false;
    		}
        }
    //Set hostname
		var sn = "";
		sn =executeCliCmdService.getNextString(switchViewCLIOP[0],["System serial number            :"],["\n"]).trim();
		if(sn != "" && sn){
			sn = sn;
		}
		var strLines = getStringLineService.getLines(switchViewCLIOP[0],["uptime"]);
		var upTime = ""
		upTime = executeCliCmdService.getNextString(switchViewCLIOP[0],["uptime is "],["\n"]).trim();
		switchViewData.hostname = strLines[0].split(" ")[0].trim();
		//Set master swicth id and number of switches
		switchViewData.noOfSwitches = 1;
		switchViewData.masterSwitchId = 1;
		var stackDetails=[];
		if($rootScope.deviceInfo.type == "WS-C3560CX-12PD-S" || $rootScope.deviceInfo.type == "WS-C3560CX-8XPD-S"){
			switchViewData.masterSwitchId = $rootScope.deviceInfo.masterId;
		}
		if($rootScope.deviceInfo.isStackingSupported){
			switchViewData.masterSwitchId =switchViewCLIOP[4].split(" ")[0].replace("*","");
			var result =requestRoutingService.getShowCmdOutput("show switch", "showSwitch");
			stackDetails = result.Switch.SwitchStatus.entry;
			var versionInfo = switchViewCLIOP[6];
			var tempArr = versionInfo.split("\n");
			var switchesArray = tempArr.splice(2,tempArr.length-3);
			switchesArray = switchesArray.splice(0,stackDetails.length);
			if(switchesArray.length > 1){
				stackDetails = switchesArray;
			}
		}
		//Add the individual switches and the capabilities
		//Setting "show power inline" CLI O/P
		var powerStatus = [];
		if($rootScope.deviceInfo.isPoECapable){
			var portsMonPower =switchViewCLIOP[2];
			var arrPortsMonPower=portsMonPower.split("Interface")
			var arrPower=arrPortsMonPower[1].split("\n");
			for (var i=3; i < arrPower.length; i++) {
				var portsObj = {};
				var arrInnerWords = arrPower[i].split(" ");
				for (var k=0,j=1; k < arrInnerWords.length; k++) {
					if(arrInnerWords[k] == "") {
			 			continue;
		 			}
					if (j == 1) {
						portsObj["Interface"]=arrInnerWords[k].trim();
		 			}else if (j == 4) {
						portsObj["Power"]=arrInnerWords[k].trim();
		 			}
		 		   	j++;
				}
				powerStatus.push(portsObj)
			}
		}
		var blockedSatus = deviceCommunicatorCLI.getExecCmdOutput("show spanning-tree \n")[0].split('\n');
		var blkArray = [];
		if(blockedSatus.length > 0){
			blockedSatus.forEach(function(input){
				if(input.indexOf('BLK')!=-1){
					blkArray.push(input.substring(0,8).trim());
				}
			});
		}
		//Setting "show interface status" CLI O/P
		var ifStatus=[];
		var arrStatus=switchViewCLIOP[1].split("\n");
		for (var i=1; i < arrStatus.length; i++) {
			var portsObj = {};
			portsObj["Port"] = arrStatus[i].substring(0,8).trim();
		    portsObj["Status"] =arrStatus[i].substring(29,41).trim();
		    portsObj["Duplex"] = arrStatus[i].substring(52,59).trim();
		    portsObj["Speed"] = arrStatus[i].substring(60,66).trim();
			portsObj["blk"] = false;
			if(blkArray.length > 0){
				blkArray.forEach(function(input){
				if(input == portsObj["Port"]){
						portsObj["blk"] = true;
					}
				});
			}
			ifStatus.push(portsObj)
		}
		var switchNoIndexInName = 0;
		var portNumberIndexInName = 1;
		//Identify the ports in each group
		var groupSize = 12;
		if(parseInt($rootScope.deviceInfo.numberOfPorts) === 8 || parseInt($rootScope.deviceInfo.numberOfPorts) === 16){
			groupSize = 8;
		}else if(parseInt($rootScope.deviceInfo.numberOfPorts) === 12){
			groupSize = 4;
		}
		var totalNumberOfGroups = Math.floor(parseInt($rootScope.deviceInfo.numberOfPorts) / groupSize);
		//What position is port number at? in Gig0/0/1 as against Gig0/1
		portNumberIndexInName = ifStatus[0].Port.split("/").length - 1;
		switchViewData.switches = [];
		var switchNo = 1;
		for(; switchNo <= switchViewData.noOfSwitches; switchNo++){
			var switchObject = {};
			switchObject.id = switchViewData.masterSwitchId; //Hard code for now. Will be dynamic in 2960X with stacking
			switchObject.sn = sn;
			//TODO: in stacked switches, the MAC address has to be got for each switch from "show sw" o/p
			//TODO for stacks
			switchObject.macAdd =  $rootScope.deviceInfo.baseMacAdd;
			switchObject.isPoECapable = $rootScope.deviceInfo.isPoECapable;
			switchObject.upTime = upTime;
			switchObject.isStackConfigurable = $rootScope.deviceInfo.isStackingSupported;
			switchObject.ports = [[[]]];
			switchObject.uplinkports = [];
			switchViewData.switches[switchNo-1] = switchObject;
		}
		if( parseInt($rootScope.deviceInfo.numberOfPorts) == 8 ){
			totalNumberOfGroups = 1;
		} else if(parseInt($rootScope.deviceInfo.numberOfPorts) == 12){
			totalNumberOfGroups = 3;
		}
		//The subgroups can either be 4 or 6. When ports are 8 or 16, subgroups are 4, and for 24 or 48 ports subgroups are 6
		var totalNumberOfSubgroups = (parseInt($rootScope.deviceInfo.numberOfPorts)%6)==0?6:4;
		if(parseInt($rootScope.deviceInfo.numberOfPorts) == 12){
			totalNumberOfSubgroups = 2;
		}

		var index1, index2;
		for(index1 = 0; index1 < totalNumberOfGroups; index1++ ){
			switchObject.ports[index1] = [];
			for(index2 = 0; index2 < totalNumberOfSubgroups; index2++ ){
				switchObject.ports[index1][index2] = [];
				switchObject.ports[index1][index2][0] = {};
				switchObject.ports[index1][index2][1] = {};
			}
		}
		//Update port/uplinkport data
		var tempArray = ifStatus;
		if($rootScope.deviceInfo.isPoECapable){
			for (var powerEntryIndex in powerStatus){
				var powerEntry = powerStatus[parseInt(powerEntryIndex)];
				if(powerEntry){
					if(powerEntry.hasOwnProperty("Power")){
						var wattage = parseFloat(powerEntry.Power);
						if(wattage != 0 && !isNaN(wattage)){
							for(var index=0; index < tempArray.length; index++){
								if(tempArray[index].Port === powerEntry.Interface){
									tempArray[index].poe = true;
									tempArray[index].power = wattage;
								}
							}
						}
					}
				}
			}
		}
		for (var p in tempArray){
			p = parseInt(p);
			if(ifStatus[p])
			if(ifStatus[p].hasOwnProperty("Port"))
			var uniqueId = ifStatus[p].Port;
			//Ignore management port and logical ports
			if (uniqueId.substr(0,2) == "Po" || uniqueId === "Fa0"){
				continue;
			}
			var portNameParts = uniqueId.split('/');
			var switchID = parseInt(portNameParts[switchNoIndexInName].substr(2)) || 1;
			if(switchID != switchViewData.masterSwitchId){
				//Port does not belong to master switch. Ignore
				continue;
			}
			var switchNumber  = 1;
			var portNumber = parseInt(portNameParts[portNumberIndexInName]);
			var duplex = "auto";
			if(ifStatus[p].Duplex.indexOf("full") >= 0){
				duplex = "full";
			} else if(ifStatus[p].Duplex.indexOf("half") >= 0){
				duplex = "half";
			}
			var speed = 0;
			var status = 1;
			if(ifStatus[p].Status === "disabled"){
				status = 2;
			} else if(ifStatus[p].Status === "notconnect"){
				status= 0;
			} else if(ifStatus[p].Status === "err-disabled"){
                status= 3;
            } else if(ifStatus[p].Status === "suspended"){
				status= 4;
			}
			if(ifStatus[p].blk){
				status= 5;
			}
			if(status == 1){
				if(ifStatus[p].Speed.indexOf('10000') >= 0 ||
                                        ifStatus[p].Speed == "10G"){
                                        speed = 10000;
                                } else if (ifStatus[p].Speed.indexOf('1000') >= 0){
					speed = 1000;
				} else if (ifStatus[p].Speed.indexOf('100') >= 0){
					speed = 100;
				} else {
					speed = 10;
				}
			}
			var groupNoDiv = Math.floor(portNumber / groupSize);
			var groupNoMod = portNumber % groupSize;
			var groupNo = null;
			if(groupNoDiv == 0 && groupNoMod != 0){
				groupNo = groupNoDiv;
			} else if (groupNoDiv != 0 && groupNoMod == 0){
				//last entry to go into the group
				groupNo = groupNoDiv-1;
			} else{
				groupNo = groupNoDiv;
			}
			//Construct the port object
			var portObject = {};
			portObject.portNo = portNumber;
			portObject.uniqueId = uniqueId
			portObject.status = status;
			portObject.speed = speed;
			portObject.duplex = duplex;
			var isUplinkPort = (parseInt($rootScope.deviceInfo.numberOfPorts) % portNumber === parseInt($rootScope.deviceInfo.numberOfPorts));
			if( $rootScope.deviceInfo.type.indexOf("CDB-") != -1 || $rootScope.deviceInfo.type.indexOf("C2960+") != -1 ||
					($rootScope.deviceInfo.type.indexOf("C2960C") != -1 && $rootScope.deviceInfo.type.indexOf("C2960CX") == -1
						&& $rootScope.deviceInfo.type.indexOf("C2960CG") == -1)){
				isUplinkPort = (uniqueId.indexOf("Gi") != -1);
			} else if($rootScope.deviceInfo.type.indexOf("3560CX") != -1 || $rootScope.deviceInfo.type.indexOf("2960X") != -1 || $rootScope.deviceInfo.type.indexOf("2960L") != -1 || $rootScope.deviceInfo.type.indexOf("C1000") != -1 || $rootScope.deviceInfo.type.indexOf("S6650L") != -1 || $rootScope.deviceInfo.type.indexOf("S5960") != -1){
				isUplinkPort = ((uniqueId.indexOf("Te") != -1) && portNumber <= 4 ) ||
							(parseInt($rootScope.deviceInfo.numberOfPorts) % portNumber === parseInt($rootScope.deviceInfo.numberOfPorts));
			}
			//No power on this port
			if(tempArray[p].poe == undefined && !isUplinkPort){
				//Set default, will be updated after fetching value
				portObject.poe = false;
				//Set default, will be updated after fetching value
				portObject.power = 0;
			}else{
				portObject.poe = true;
				portObject.power = tempArray[p].power;
			}
			if(isUplinkPort){
				//Entry goes into the uplink ports array
				switchViewData.switches[switchNumber-1].uplinkports.push(portObject);
			} else {
				//Entry goes into the ports array
				var subGroupNo = Math.ceil((portNumber % groupSize) /2);
				if(subGroupNo == 0){
					subGroupNo = groupSize/2;
				}
				var portPosition = (portNumber+1) % 2;
				switchViewData.switches[switchNumber-1].ports[groupNo][subGroupNo-1][portPosition] = portObject;
			}
		}

		//Add stack members if any
		if(stackDetails.length > 0){
			var inventory =switchViewCLIOP[3];
			var x2js = new X2JS();
			var inventoryObject = x2js.xml_str2json(inventory);
			for (var i=0; i < stackDetails.length; i++){
				if(stackDetails[i].indexOf("*") != -1){
					//Master has been already added. Ignore it.
					continue;
				}
				var member = stackDetails[i].match(/\S+/g) || [];
				if(member.length > 0){
					try{
						var memberId = member[0];
						var sn = "";
						for(j=0;j<inventoryObject.ShowInventory.InventoryEntry.length; j++){
    						var t = inventoryObject.ShowInventory.InventoryEntry[j];
    						var number = t.ChassisName;
							number = number.split("\"").join("");
							if(number==memberId){
								sn = t.SN;
								break;
							}
						}
						var str = member1[2].split('-')[1]; 
						var noOfUplinkPorts = str.match(/\d+/g)[0]; 
						var noOfPorts =	member1[1]	
						var type = member[2];
						var cli = "show switch " + memberId;
						var cli1 = "show version | i Uptime"		
						var uptimeCli = deviceCommunicator.getExecCmdOutput(cli1).split("\n");
						var StackupTime = "";
						if(memberId == "3"){
							StackupTime = executeCliCmdService.getNextString(uptimeCli[1],["Switch Uptime                   : "],["\n"]).trim();
							if(StackupTime == "") StackupTime = executeCliCmdService.getNextString(uptimeCli[0],["Switch Uptime                   : "],["\n"]).trim();
						}else{
							StackupTime = executeCliCmdService.getNextString(uptimeCli[0],["Switch Uptime                   : "],["\n"]).trim();
						}
						var mac = deviceCommunicator.getExecCmdOutput(cli).split("\n")[4]. match(/\S+/g)[2];
						var slaveSwitch = this.getStackSlaveData(memberId,noOfPorts,type,mac,sn,StackupTime,noOfUplinkPorts);
						switchViewData.switches.push(slaveSwitch);
					} catch(e){
					}
				}
			}
		}
		$rootScope.uplinkPorts = switchViewData.switches[0].uplinkports;
		return switchViewData;
	};
	this.getStackSlaveData = function(memberId,noOfPorts,type,mac,sn,noOfUplinkPorts){
		        var upPorts = noOfUplinkPorts;
                var groupSize = 12;
                if(noOfPorts === 8 ||  noOfPorts === 16){
                        groupSize = 8;
                }
                var totalNumberOfGroups = Math.ceil(noOfPorts / groupSize);
                if( noOfPorts == 8  || noOfPorts == 16){
                        totalNumberOfGroups = 1;
                }
                //The subgroups can either be 4 or 6. When ports are 8 or 16, subgroups are 4, and for 24 or 48 ports subgroups are 6
		var totalNumberOfSubgroups = 4;
                if(noOfPorts >= 24){
                	totalNumberOfSubgroups = 6;
                }
                var switchObject = {};
                switchObject.id = memberId;
				switchObject.upTime =  StackupTime;
		if(!sn){
			sn = "";
		}
		switchObject.sn = sn;
                switchObject.macAdd =  this.changeClusterMACAddressFormat(mac);
                switchObject.isPoECapable = (type.split('-')[2].indexOf('P') != -1);
		var poeData = [];
		if(switchObject.isPoECapable){
			//Fetch power inline
			var powerStat = deviceCommunicator.getExecCmdOutput("show power inline module " + memberId);
			poeData = powerStat.split("\n");
			poeData = poeData.splice(7);
		}
		//Fetch interface info, ignore management interface
		var intStat = deviceCommunicator.getExecCmdOutput("show interface status module " + memberId);
		var intData = intStat.split("\n");
		intData = intData.splice(1);
                switchObject.isStackConfigurable = false;
                switchObject.ports = [[[]]];
                switchObject.uplinkports = [];
                var index1, index2;
                var portNumber = 0;
                for(index1 = 0; index1 < totalNumberOfGroups; index1++ ){
                        switchObject.ports[index1] = [];
                        for(index2 = 0; index2 < totalNumberOfSubgroups; index2++ ){
                                var port1 = {};
                                var port2 = {};
                                port1.poe = false;
				var power = "";
                                port1.power = 0;

				// interface will be of the format
                    		// "Gi1/0/48 notconnect 148 auto auto 10/100/1000BaseTX"
                    		// Extract various fields

				var sInter = intData[portNumber];
                                port1.uniqueId = sInter.substr(0,8).trim();
				var stat = sInter.substr(29,12).trim();
                                port1.status = this.getStatus(stat);
                                port1.speed = (stat == "connected" ? this.getSpeed(sInter.substr(60,7).trim()) : 0);
                                port1.duplex = sInter.substr(52,8).trim();
                                port1.portNo = ++portNumber;
                                if($rootScope.deviceInfo.isPoECapable){
									if(poeData.length > 0){
										poeData.forEach(function(input){
										if(input.indexOf(port1.uniqueId) != -1){
											if(input.substring(27,35).trim()!= 0.0){
												port1.poe = true;
												port1.power = input.substring(27,35).trim();
											}
											}
										});
									}
								}
                                port2.poe = false;
                                port2.power = 0;
				sInter = intData[portNumber];
                                port2.uniqueId = sInter.substr(0,8).trim();
				stat = sInter.substr(29,12).trim();
                                port2.status = this.getStatus(stat);
                                port2.speed = (stat == "connected" ? this.getSpeed(sInter.substr(60,7).trim()) : 0);
                                port2.duplex = sInter.substr(52,8).trim();
                                port2.portNo = ++portNumber;
                                if($rootScope.deviceInfo.isPoECapable){
									if(poeData.length > 0){
										poeData.forEach(function(input){
										if(input.indexOf(port2.uniqueId) != -1){
											if(input.substring(27,35).trim()!= 0.0)
												port2.poe = true;
											port2.power = input.substring(27,35).trim();
											}
										});
									}
								}
                                var isUplinkPort = parseInt(upPorts) < parseInt(portNumber) ? true : false;
								if(isUplinkPort){
									if(port1.uniqueId == "Fa0" || port2.uniqueId == "Fa0"){
									continue;
									}
		                            switchObject.uplinkports.push(port1);
		                            switchObject.uplinkports.push(port2);
								}else{
									switchObject.ports[index1][index2] = [];
									switchObject.ports[index1][index2][0] = port1;
									switchObject.ports[index1][index2][1] = port2;
								}
                        }
                }
                return switchObject;
        };
	this.getStatus = function(statusStr){
		var status = 1;
                if(statusStr === "disabled"){
                         status = 2;
                } else if(statusStr === "notconnect"){
                         status= 0;
                } else if(statusStr === "err-disabled"){
                         status= 3;
                } else if(statusStr === "suspended"){
						 status= 4;
				}
		return status;
	};
	this.getSpeed = function(speedStr){
		var speed = 0;
		if(speedStr.indexOf('10000') >= 0 || speedStr == "10G"){
                        speed = 10000;
                } else if (speedStr.indexOf('1000') >= 0){
                        speed = 1000;
                } else if (speedStr.indexOf('100') >= 0){
                        speed = 100;
                } else {
        		speed = 10;
        	}
		return speed;
	};
	this.changeClusterMACAddressFormat = function(str){
                var splitDotJoin = str.split('.').join("");
                var macStrAsArr = splitDotJoin.split('');
                var MacAdd = "";
                for(var MACStr = 0; MACStr < macStrAsArr.length; MACStr++){
                        MacAdd += macStrAsArr[MACStr].toUpperCase();
                        if(MACStr % 2 !==0 && MACStr !== macStrAsArr.length-1){
                                MacAdd += ":";
                        }
                }
                return MacAdd;
        }
}]);
