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
app.service("switchDataService4Stack",['$rootScope','requestRoutingService','executeCliCmdService','getStringLineService','clusterCmdService','$filter',
	function($rootScope,requestRoutingService,executeCliCmdService,getStringLineService,clusterCmdService,$filter){
	var translate = $filter("translate");
	this.doReloadCluster = function(switchId, saveConfig){
 		return clusterCmdService.doReloadCluster(switchId,saveConfig);
	}
	this.getSwitchViewData = function($scope,currentMembers){
        
		var switchViewData = {};
		$scope.showDeleteBtn = true;
		$scope.showApplyBtn = true;
		$scope.showRestart = (location.hash.indexOf("troubleShoot") != -1);
        if (window.location.href.indexOf("#/portsConf") > 0 || window.location.href.indexOf("#/troubleShoot") > 0 ||
			window.location.href.indexOf("#/dashboard") > 0 || window.location.href.indexOf("#/portsMonitor") > 0) {
            $scope.showDeleteBtn = false;
            $scope.showApplyBtn = false;
        }

		//Executing all required CLIs by separating \n for switch view with stack
		var switchViewCLI="";
		if($rootScope.deviceInfo.type.indexOf("CDB")!=-1){
			if($rootScope.deviceInfo.isStackingSupported){
			    switchViewCLI="show version\n show interface status\n show power inline\n show inventory | format\n show switch | i Master\n show switch\n show version | begin Switch Ports\n show coap stats\n ";
			}else{
				switchViewCLI="show version\n show interface status\n show power inline\n show inventory | format\n show coap stats\n ";
			}
			if($rootScope.deviceInfo.stackingInfo.type === "CLUSTER"){
				switchViewCLI +="show cluster members\n show cluster members | i Cmdr\n ";
			}
			if($rootScope.deviceInfo.stackingInfo.type === "CLUSTER" && !$scope.showRestart && $rootScope.clusterCandidateAvail){
				switchViewCLI +="show cluster candidates\n";
			}
        }else{
        	if($rootScope.deviceInfo.isStackingSupported){
    			switchViewCLI="show version\n show interface status\n show power inline\n show inventory | format\n show switch | i Master\n show switch\n show version | begin Switch Ports\n ";
    		}else{
    			switchViewCLI="show version\n show interface status\n show power inline\n show inventory | format\n ";
    		}
			if($rootScope.deviceInfo.stackingInfo.type === "CLUSTER"){
				switchViewCLI +="show cluster members\n show cluster members | i Cmdr\n ";
			}
			if($rootScope.deviceInfo.stackingInfo.type === "CLUSTER" && !$scope.showRestart && $rootScope.clusterCandidateAvail){
    			switchViewCLI +="show cluster candidates\n";
			}
        }
		//Returning array that contains all the given CLI O/P
        var switchViewCLIOP = deviceCommunicatorCLI.getExecCmdOutput(switchViewCLI);
		//set coap Status for selecon device
		if($rootScope.deviceInfo.type.indexOf("CDB")!=-1){
			switchViewData.coapStatus = true;
    		var coapStatus = "";
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
        }else{
			switchViewData.coapEnabledStatus=false;
    		switchViewData.coapDisabledStatus=false;
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
		if($rootScope.deviceInfo.type == "WS-C3560CX-12PD-S" || $rootScope.deviceInfo.type == "WS-C3560CX-8XPD-S"){
                 switchViewData.masterSwitchId = $rootScope.deviceInfo.masterId;
        }
		var stackDetails = [];
		if($rootScope.deviceInfo.isStackingSupported){
			switchViewData.masterSwitchId =switchViewCLIOP[4].split(" ")[0].replace("*","");
            var result = requestRoutingService.getShowCmdOutput("show switch", "showSwitch");
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
		} else if(parseInt($rootScope.deviceInfo.numberOfPorts) === 12){
                        groupSize = 4;
        }
        var totalNumberOfGroups = Math.floor(parseInt($rootScope.deviceInfo.numberOfPorts) / groupSize);
		//What position is port number at? in Gig0/0/1 as against Gig0/1
        portNumberIndexInName = ifStatus[0].Port.split("/").length - 1;
		switchViewData.switches = [];
		var switchNo = 1;
		for(; switchNo <= switchViewData.noOfSwitches; switchNo++){
			var switchObject = {};
			switchObject.id = 0;
		    switchObject.hostname = switchViewData.hostname;
		    //Hiding cluster type for SM device and all devices since CCP 1.6 release
		    switchObject.clusterTypeHiding = true;		   
			/*if( $rootScope.deviceInfo.type.indexOf("2960L") != -1 ){
				 switchObject.clusterTypeHiding = true;
			}*/
			switchObject.type = $rootScope.deviceInfo.stackingInfo.type === "CLUSTER"? translate("switch_master"): $rootScope.deviceInfo.stackingInfo.type;
			switchObject.sn = sn;
			//TODO: in stacked switches, the MAC address has to be got for each switch from "show sw" o/p
			//TODO for stacks
			switchObject.macAdd =  $rootScope.deviceInfo.baseMacAdd;
			switchObject.showRestart = $scope.showRestart;
			switchObject.isPoECapable = $rootScope.deviceInfo.isPoECapable;
			switchObject.showFindSwitch = $rootScope.deviceInfo.type.indexOf("CDB")!=-1;
			switchObject.isStackConfigurable = $rootScope.deviceInfo.isStackingSupported;
			switchObject.modelName = $rootScope.deviceInfo.type;
			switchObject.upTime = upTime;
			switchObject.masterIdNo = $rootScope.deviceInfo.masterId;
			switchObject.restartInProgress = false;
            switchObject.software_update_restart_title = translate("software_update_restart_title");
			if(switchNo == 1){
				switchObject.iscoapVisible = true;
			}
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
			for (var powerEntryIndex=0; powerEntryIndex< powerStatus.length;powerEntryIndex++ ){
				var powerEntry = powerStatus[parseInt(powerEntryIndex)];
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
		for (var p=0; p<tempArray.length; p++){
			p = parseInt(p);
			var uniqueId = ifStatus[p].Port;
			//Ignore management port and logical ports
			if (uniqueId.substr(0,2) == "Po" || uniqueId === "Fa0"){
				continue;
			}
			var portNameParts = uniqueId.split('/');
            var switchID = parseInt(portNameParts[switchNoIndexInName].substr(2)) || 1;
            if (switchID != switchViewData.masterSwitchId) {
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
			portObject.switchId = 0;
			var isUplinkPort = (parseInt($rootScope.deviceInfo.numberOfPorts) % portNumber === parseInt($rootScope.deviceInfo.numberOfPorts));
			if( $rootScope.deviceInfo.type.indexOf("CDB-") != -1 || $rootScope.deviceInfo.type.indexOf("C2960+") != -1 || $rootScope.deviceInfo.type.indexOf("FE") != -1 ||
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
		//Add condition for cluster check
		if($rootScope.deviceInfo.stackingInfo.type === "CLUSTER"){
			var candidatesCLIOP,membersCLIOP,clusterCmdrCLIOP;
			if($rootScope.deviceInfo.type.indexOf("CDB")!=-1){
				if($rootScope.deviceInfo.isStackingSupported){
					membersCLIOP=switchViewCLIOP[8];
					clusterCmdrCLIOP=switchViewCLIOP[9];
					if(!$scope.showRestart && $rootScope.clusterCandidateAvail){
						candidatesCLIOP=switchViewCLIOP[10];
					}
				}else{
					membersCLIOP=switchViewCLIOP[5];
					clusterCmdrCLIOP=switchViewCLIOP[6];
					if(!$scope.showRestart && $rootScope.clusterCandidateAvail){
						candidatesCLIOP=switchViewCLIOP[7];
					}
				}
			}else{
	        	if($rootScope.deviceInfo.isStackingSupported){
	    	   		membersCLIOP=switchViewCLIOP[7];
					clusterCmdrCLIOP=switchViewCLIOP[8];
					if(!$scope.showRestart && $rootScope.clusterCandidateAvail){
						candidatesCLIOP=switchViewCLIOP[9];
					}
	    		}else{
	    			membersCLIOP=switchViewCLIOP[4];
					clusterCmdrCLIOP=switchViewCLIOP[5];
					if(!$scope.showRestart && $rootScope.clusterCandidateAvail){
						candidatesCLIOP=switchViewCLIOP[6];
					}
	    		}
	        }
			//Setting "show cluster candidates" CLI O/P
			var candidates=[];
			if(!$scope.showRestart && $rootScope.clusterCandidateAvail){
				var arrCandidate=candidatesCLIOP.trim().split("\n");
				for (var i=2; i < arrCandidate.length; i++) {
					var candidateObj = {};
					candidateObj["macAddress"] = arrCandidate[i].substring(0,14).trim();
					candidateObj["name"] =arrCandidate[i].substring(15,27).trim();
					candidateObj["deveiceType"] = arrCandidate[i].substring(28,43).trim();
					candidateObj["Hops"] = arrCandidate[i].substring(57,61).trim();
					candidates.push(candidateObj)
				}
			}
			//Setting "show cluster members" CLI O/P
            var members = [];
            //Setting "show cluster members | i Cmdr" O/P
            var clusterCmdr = clusterCmdrCLIOP;
            $rootScope.members = [];
            var arrMember = membersCLIOP.trim().split("\n");
            for (var i = 2; i < arrMember.length; i++) {
                var memberObj = {};
                memberObj["snValue"] = arrMember[i].substring(0, 2).trim();
                memberObj["macAddress"] = arrMember[i].substring(3, 17).trim();
                memberObj["name"] = arrMember[i].substring(18, 31).trim();
                memberObj["hops"] = arrMember[i].substring(43, 47).trim();
                memberObj["state"] = arrMember[i].substring(65, 70).trim();
                if(memberObj["state"] == "Up") {
                    var snValue = memberObj["snValue"];
                    if(currentMembers.indexOf(snValue) > -1 && snValue!="0"){  
                       	memberObj["serialNumber"] = clusterCmdService.getClusterSnNumber(snValue);
                        memberObj["modelNumber"] = clusterCmdService.getClusterModelNumber(snValue).trim();
                        memberObj["interfaceDetails"] = clusterCmdService.getClusterInterfaceDetails(snValue);
                        memberObj["powerStatus"] = clusterCmdService.getClusterInterfacePowerDetails(snValue);
                    }else{
                    	memberObj["serialNumber"] = "";
                        memberObj["modelNumber"] = clusterCmdService.getClusterModelNumber(snValue).trim();
                        memberObj["interfaceDetails"] = "";
                        memberObj["powerStatus"] = "";
                    }                    
                    var modelNumber = memberObj["modelNumber"];
                    var numPorts = 0;
                    var poeCapable = false;
                    var upoeCapable = false;
                    memberObj["showFindSwitch"] = false;
                    if (modelNumber.indexOf("CDB-") != -1) {
                        memberObj["showFindSwitch"] = true;
                        numPorts = modelNumber.split('-')[1].substr(0, 2).match(/[0-9]+/g)[0];
                        poeCapable = true;
                        upoeCapable = (modelNumber.split('-')[1].indexOf('U') != -1);
                    } else if (modelNumber.indexOf("S6650L") != -1 || modelNumber.indexOf("S5960") != -1) {
                        memberObj["showFindSwitch"] = true;
                        numPorts = modelNumber.split('-')[0].substr(0, 2).match(/[0-9]+/g)[0];
                        poeCapable = true;
                        upoeCapable = (modelNumber.split('-')[0].indexOf('U') != -1);
                    } else {
                        if (modelNumber.indexOf("C2960+") != -1) {
                            modelNumber = modelNumber.replace("+", "+-");
                        }
                        numPorts = modelNumber.split('-')[2].substr(0, 2).match(/[0-9]+/g)[0];
                        poeCapable = (modelNumber.split('-')[2].indexOf('P') != -1);
                        upoeCapable = (modelNumber.split('-')[2].indexOf('U') != -1);
                    }
                    if(currentMembers.indexOf(snValue) > -1 && snValue!="0"){ 
                    	  memberObj["numPorts"] = numPorts;
                          memberObj["poeCapable"] = poeCapable;
                          memberObj["upoeCapable"] = upoeCapable;
                    }else{
                    	  memberObj["numPorts"] = 0;
                          memberObj["poeCapable"] = false;
                          memberObj["upoeCapable"] = false;
                    }                  
                }
                $rootScope.members.push(memberObj)
            }

			//Add Members
       		try{
                for (var memberIndex in $rootScope.members) {
                    var member = $rootScope.members[memberIndex];
                    var macAddress = member.macAddress;
                    var serialNo = member.snValue;
                    if (serialNo === clusterCmdr.split(" ")[0]) {
                    	/* self switch is already added to stack */
                        continue;
                    }
                    if (member.state === "Up") {
                        var macAddrFormateChange = this.changeClusterMACAddressFormate(macAddress);
                        var noPorts = member["numPorts"];
                        var x = this.getClusterCandidateSwitch(noPorts, macAddrFormateChange, serialNo, true);
                        switchViewData.switches.push(x);                        
                    } else {
                        //Add dummy member
                        var macAddrFormateChange1 = this.changeClusterMACAddressFormate(macAddress);
                        var x1 = this.getClusterCandidateSwitch(24, macAddrFormateChange1, serialNo, !$scope.showRestart);
                        switchViewData.switches.push(x1);
                    }
                }
            } catch (e) {
            }
            //Add Candidates
            if (!$scope.showRestart) {
                try {
                    var id;
                    for (var candidate in candidates) {
                        var macAddrFormateChange2 = this.changeClusterMACAddressFormate(candidates[candidate].macAddress);
                        id = candidate;
                        var x1 = this.getClusterCandidateSwitch(24, macAddrFormateChange2, id, false);
                        switchViewData.switches.push(x1);
                        id++;
                    }
                } catch (e) {
                }
            }
		} else if($rootScope.deviceInfo.stackingInfo.type === "STACK" && stackDetails.length > 0) {
			//Required to provide restart functionality
		var inventory = switchViewCLIOP[3];
                        var x2js = new X2JS();
                        var inventoryObject = x2js.xml_str2json(inventory);
            for (var i=0; i < stackDetails.length; i++){
                    if(stackDetails[i].indexOf("*") != -1){
                            //Master has been already added. Ignore it.
                            continue;
                    }
                    var member1 = stackDetails[i].match(/\S+/g) || [];
                    if(member1.length > 0){
                            try {
                                    var memberId = member1[0];
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
                                    var type = member1[2];
                                    var cli = "show switch " + memberId;
                                    var cli1 = "show version | i Uptime";		
									var uptimeCli = deviceCommunicator.getExecCmdOutput(cli1).split("\n");
									var macCli = deviceCommunicator.getExecCmdOutput(cli);
									var StackupTime = "";
									var mac = "";
									if(memberId == "3"){ 
										StackupTime = executeCliCmdService.getNextString(uptimeCli[1],["Switch Uptime                   : "],["\n"]).trim();
										if(StackupTime == "") StackupTime = executeCliCmdService.getNextString(uptimeCli[0],["Switch Uptime                   : "],["\n"]).trim();
									}else{
										StackupTime = executeCliCmdService.getNextString(uptimeCli[0],["Switch Uptime                   : "],["\n"]).trim();
									}
									if(macCli != undefined && macCli != "" && macCli.indexOf("Mac persistency wait time") != -1){
										mac = macCli.split("\n")[5]. match(/\S+/g)[2];
									}else if(macCli != undefined && macCli != ""){
										mac = macCli.split("\n")[4]. match(/\S+/g)[2];
									}
									var slaveSwitch = this.getStackSlaveData(memberId,noOfPorts,type,mac,sn,switchViewData.hostname,StackupTime,noOfUplinkPorts);
                                    switchViewData.switches.push(slaveSwitch);
									
									//;
                            } catch(e){
                            }
                    }
            }
		}
		return switchViewData;
	};

	this.changeClusterMACAddressFormate = function(str){
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

	this.getClusterCandidateSwitch = function(noOfPorts,macAdd,id,isMember){
        var switchObject = {};
        var groupSize = 12;
        if (noOfPorts === 8 || noOfPorts === 16) {
            groupSize = 8;
        } else if (parseInt(noOfPorts) === 12) {
            groupSize = 4;
        }
        var totalNumberOfGroups = noOfPorts / groupSize;
        if (noOfPorts == 8) {
            totalNumberOfGroups = 1;
        }
		/*
		 * The subgroups can either be 4 or 6.
		 * When ports are 8 or 16, subgroups are 4, and
		 * for 24 or 48 ports subgroups are 6
		 */

        var totalNumberOfSubgroups = (noOfPorts % 6) == 0 ? 6 : 4;
        if (parseInt(noOfPorts) == 12) {
            totalNumberOfSubgroups = 2;
        }
        switchObject.id = id;
        switchObject.showRestart = (location.hash.indexOf("troubleShoot") != -1);
        switchObject.macAdd = macAdd;
        switchObject.type = translate("switch_cluster_member");
        switchObject.isPoECapable = false;
        switchObject.isStackConfigurable = false;
        switchObject.ports = [[[]]];
        switchObject.uplinkports = [];

		/* this code block is for candidates */
        if (!isMember) {
            switchObject.type = translate("switch_cluster_candidate");
            switchObject.showRestart = false;
            switchObject.isCandidate = true;
            var candidates = requestRoutingService.getShowCmdOutput("show cluster candidates", "showClusterCandidates");
            if (Object.prototype.toString.call(candidates.ShowClusterCandidates.CandidateTable.entry) === '[object Array]') {

                for (var candidate in candidates.ShowClusterCandidates.CandidateTable.entry) {
                    if (id == candidate) {
                        switchObject.hostname = candidates.ShowClusterCandidates.CandidateTable.entry[id].name;
                    }
                }
            } else if (Object.prototype.toString.call(candidates.ShowClusterCandidates.CandidateTable.entry) === "[object Object]") {
                switchObject.hostname = candidates.ShowClusterCandidates.CandidateTable.entry.name;
            }
            return switchObject;
        }
		/* this code block is for cluster members */
		var index;
		for (var ind = 0; ind < $rootScope.members.length; ind++) {
			if ($rootScope.members[ind].snValue == id) {
			    index = ind;
			}
		}
        var memberDetails = $rootScope.members[index];
        switchObject.hostname = memberDetails.name;
        switchObject.sn = memberDetails.serialNumber;
		switchObject.isMember = true;
		switchObject.modelName = memberDetails.modelNumber;
		switchObject.restartInProgress = false;
		switchObject.software_update_restart_title = translate("software_update_restart_title");
        if (memberDetails.state == "Down") {
            return switchObject;
        }
        switchObject.showFindSwitch = memberDetails.showFindSwitch;
        switchObject.isPoECapable = memberDetails.poeCapable;
        var poeData = [];
        if (switchObject.isPoECapable) {
			/* Fetch power inline */
            poeData = memberDetails.powerStatus;
        }
		/* Fetch interface info, ignore management interface */
        var intData = memberDetails.interfaceDetails;
        switchObject.isStackConfigurable = false;
        switchObject.ports = [[[]]];
        switchObject.uplinkports = [];
        var index1, index2;
        var portNumber = 0;
        for (index1 = 0; index1 < totalNumberOfGroups; index1++) {
            switchObject.ports[index1] = [];
            for (index2 = 0; index2 < totalNumberOfSubgroups; index2++) {
                var port1 = {};
                var port2 = {};
                port1.poe = false;
                var power = "";
                port1.power = 0;

				/*
				 * interface will be of the format
				 * "Gi1/0/48 notconnect 148 auto auto 10/100/1000BaseTX"
				 * Extract various fields
				 */
                var inter = intData[portNumber];
                if (switchObject.isPoECapable) {
                    power = poeData[portNumber];
                    power = power.match(/\S+/g) || [];
                    port1.power = parseFloat(power[3]);
                    if (port1.power > 0) {
                        port1.poe = true;
                    }
                }
                port1.uniqueId = inter.substr(0, 8).trim();
                var stat = inter.substr(29, 12).trim();
                port1.status = this.getStatus(stat);
                port1.speed = (stat == "connected" ? this.getSpeed(inter.substr(60, 7).trim()) : 0);
                port1.duplex = inter.substr(52, 8).trim();
                port1.portNo = ++portNumber;
                port2.poe = false;
                port2.power = 0;
                port1.switchId = id;
                port2.switchId = id;
                inter = intData[portNumber];
                if (switchObject.isPoECapable) {
                    power = poeData[portNumber];
                    power = power.match(/\S+/g) || [];
                    port2.power = parseFloat(power[3]);
                    if (port2.power > 0) {
                        port2.poe = true;
                    }
                }
                port2.uniqueId = inter.substr(0, 8).trim();
                stat = inter.substr(29, 12).trim();
                port2.status = this.getStatus(stat);
                port2.speed = (stat == "connected" ? this.getSpeed(inter.substr(60, 7).trim()) : 0);
                port2.duplex = inter.substr(52, 8).trim();
                port2.portNo = ++portNumber;

                switchObject.ports[index1][index2] = [];
                switchObject.ports[index1][index2][0] = port1;
                switchObject.ports[index1][index2][1] = port2;
            }
        }
        while (portNumber < intData.length - 1) {
            var uplinkObject = {};
            var pInter = intData[portNumber];
            if (pInter == undefined) {
                ++portNumber;
                continue;
            }
			/*
			 * interface will be of the format
			 * "Gi1/0/48 notconnect 148 auto auto 10/100/1000BaseTX"
			 * Extract various fields
			 */
            uplinkObject.uniqueId = pInter.substr(0, 8).trim();
            var stat1 = pInter.substr(29, 12).trim();
            uplinkObject.status = this.getStatus(stat1);
            uplinkObject.speed = (stat1 == "connected" ? this.getSpeed(pInter.substr(60, 7).trim()) : 0);
            uplinkObject.duplex = pInter.substr(52, 8).trim();
            uplinkObject.portNo = uplinkObject.uniqueId.split("/");
            uplinkObject.portNo = uplinkObject.portNo[uplinkObject.portNo.length - 1];
            uplinkObject.switchId = id;
            ++portNumber;
            if (uplinkObject.uniqueId == "Fa0") {
                continue;
            }
            switchObject.uplinkports.push(uplinkObject);
        }
        return switchObject;
	};

	this.getStackSlaveData = function(memberId,noOfPorts,type,mac,sn,hostname,StackupTime,noOfUplinkPorts){
		        var upPorts = noOfUplinkPorts;
                var groupSize = 12;
                if(noOfPorts === 8 ||  noOfPorts === 16){
                        groupSize = 8;
                }
                var totalNumberOfGroups = Math.ceil(noOfPorts / groupSize);
                /* if( noOfPorts == 8  || noOfPorts == 16){
                        totalNumberOfGroups = 1;
                } */
                //The subgroups can either be 4 or 6. When ports are 8 or 16, subgroups are 4, and for 24 or 48 ports subgroups are 6
		var totalNumberOfSubgroups = 4;
                if(noOfPorts >= 24){
                	totalNumberOfSubgroups = 6;
                }
                var switchObject = {};
                switchObject.id = memberId;
		if(!sn){
                        sn = "";
                }
		switchObject.sn =  sn;
		switchObject.masterIdNo = memberId;
		switchObject.upTime =  StackupTime;
		switchObject.hostname =hostname;
		switchObject.type = translate("com_stack_member");
		switchObject.macAdd =  this.changeClusterMACAddressFormate(mac);
		switchObject.showRestart = (location.hash.indexOf("troubleShoot") != -1);
		switchObject.isPoECapable = (type.split('-')[2].indexOf('P') != -1);
		switchObject.showFindSwitch = (type.indexOf('CDB') != -1);
		switchObject.restartInProgress = false;
		switchObject.physicalStackingMember = false;
		switchObject.software_update_restart_title = translate("software_update_restart_title");
		var poeData = [];
		if($rootScope.deviceInfo.isPoECapable){
			//Fetch power inline
			var powerStat = deviceCommunicator.getExecCmdOutput("show power inline module " + memberId);
			poeData = powerStat.split("\n");
			poeData = poeData.splice(7);
		}
		//Fetch interface info, ignore management interface
		var stackblkArray = [];
		var stackblockedSatus = deviceCommunicatorCLI.getExecCmdOutput("show spanning-tree \n")[0].split('\n');
		if(stackblockedSatus.length > 0){
			stackblockedSatus.forEach(function(input){
				if(input.indexOf('BLK')!=-1){
					stackblkArray.push(input.substring(0,8).trim());
				}
			});
		}
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
							
							try{
                                var port1 = {};
                                var port2 = {};
                                port1.switchId = 0;
                                port1.poe = false;
								var power = "";
                                port1.power = 0;

				// interface will be of the format
                    		// "Gi1/0/48 notconnect 148 auto auto 10/100/1000BaseTX"
                    		// Extract various fields
				var inter = intData[portNumber];
				
                                port1.uniqueId = inter.substr(0,8).trim();
				               var stat = inter.substr(29,12).trim();
				                if(stackblkArray.length > 0){
									var statusCheck = stackblkArray.filter((value) => {
										if(port1.uniqueId == value ) {
											stat = "BLK";
										}
									});
								}
                                port1.status = this.getStatus(stat);
                                port1.speed = (stat == "connected" ? this.getSpeed(inter.substr(60,7).trim()) : 0);
                                port1.duplex = inter.substr(52,8).trim();
                                port1.portNo = port1.uniqueId.split('/')[2];
                                port1.portNu = ++portNumber;
                                if($rootScope.deviceInfo.isPoECapable){
									if(poeData.length > 0){
										poeData.forEach(function(input){
										if(input.split(" ")[0].trim() == port1.uniqueId){
											if(input.substring(27,35).trim()!= "0.0"){
												port1.poe = true;
												port1.power = input.substring(27,35).trim();
											}
											}
										});
									}
								}
                                port2.switchId = 0;
                                port2.poe = false;
                                port2.power = 0;
				inter = intData[portNumber];
                                port2.uniqueId = inter.substr(0,8).trim();
				                stat = inter.substr(29,12).trim();
								if(stackblkArray.length > 0){
									var statusCheck = stackblkArray.filter((value) => {
										if(port2.uniqueId == value ) {
											stat = "BLK"
										}
									});
								}
                                port2.status = this.getStatus(stat);
                                port2.speed = (stat == "connected" ? this.getSpeed(inter.substr(60,7).trim()) : 0);
                                port2.duplex = inter.substr(52,8).trim();
                                port2.portNo = port2.uniqueId.split('/')[2]
                                port2.portNu = ++portNumber;
                                if($rootScope.deviceInfo.isPoECapable){
									if(poeData.length > 0){
										poeData.forEach(function(input){
										if(input.split(" ")[0].trim() == port2.uniqueId){
											if(input.substring(27,35).trim()!= "0.0")
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
							}catch(e){
							}
                        }
                }
				
		/* while (portNumber < noOfPorts){
                    var uplinkObject = {};
		    var pInter = intData[portNumber];
		    if(pInter == undefined){
			++portNumber;
			continue;
		    }
		    // interface will be of the format
		    // "Gi1/0/48 notconnect 148 auto auto 10/100/1000BaseTX"
		    // Extract various fields
                    uplinkObject.uniqueId = pInter.substr(0,8).trim();
		    var stat1 = pInter.substr(29,12).trim();
                    uplinkObject.status = this.getStatus(stat1);
                    uplinkObject.speed = (stat1 == "connected" ? this.getSpeed(pInter.substr(60,7).trim()) : 0);
                    uplinkObject.duplex = pInter.substr(52,8).trim();
                    uplinkObject.portNo = uplinkObject.uniqueId.split("/")[2];
                    uplinkObject.switchId = 0;
                    ++portNumber;
		    if(uplinkObject.uniqueId == "Fa0"){
			continue;
		    }
		    switchObject.uplinkports.push(uplinkObject);
                } */
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
                } else if(statusStr=== "suspended"){
						 status= 4;
				}else if(statusStr=== "BLK"){
						 status= 5;
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
}]);
