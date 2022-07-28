app.service("portsDataSourceService",['$rootScope','requestRoutingService','executeCliCmdService','getStringLineService','clusterCmdService',function($rootScope,requestRoutingService,executeCliCmdService,getStringLineService,clusterCmdService){
return {
    getPortData: function (selectedPortId, switchIndex) {
        var portsObj = {};
        var portConfCLI="";
        var platformCDB = false;
        var platformC2960XR_C3560CX_C2960L_C2960X = false;
        var portConfCLIOP;
        if (switchIndex == 0) {
            if ($rootScope.deviceInfo.type.indexOf("CDB") != -1) {
                platformCDB = true;
                portConfCLI = "show interfaces " + selectedPortId + " status\n show interfaces " + selectedPortId + " switchport\n show running-config interface " + selectedPortId + "\n show running-config partition common | in lacp\n";
            } else {
                portConfCLI = "show interfaces " + selectedPortId + " status\n show interfaces " + selectedPortId + " switchport\n show running-config interface " + selectedPortId + "\n show interface " + selectedPortId + " | i media type\n show running-config partition common | in lacp\n";
            }
            if ($rootScope.deviceInfo.type.indexOf("C2960X") != -1 || $rootScope.deviceInfo.type.indexOf("C3560CX") != -1 || $rootScope.deviceInfo.type.indexOf("2960L") != -1 || $rootScope.deviceInfo.type.indexOf("C1000") != -1 || $rootScope.deviceInfo.type.indexOf("S6650L") != -1 || $rootScope.deviceInfo.type.indexOf("S5960") != -1) {
                platformC2960XR_C3560CX_C2960L_C2960X = true;
                portConfCLI += "show running-config ip dhcp pool \n";
            }
            portConfCLIOP = deviceCommunicatorCLI.getExecCmdOutput(portConfCLI);

        } else {
            var platform = $rootScope.deviceInfo.clusterMembersInfo[switchIndex].deviceType;
            selectedPortId = selectedPortId.replace(new RegExp("/", 'g'), "//");
            if (platform.indexOf("CDB") != -1) {
                platformCDB = true;
                portConfCLI = "show interfaces " + selectedPortId + " status\n show interfaces " + selectedPortId + " switchport\n show running-config interface " + selectedPortId + "\n show running-config partition common | in lacp\n";
            } else {
                portConfCLI = "show interfaces " + selectedPortId + " status\n show interfaces " + selectedPortId + " switchport\n show running-config interface " + selectedPortId + "\n show interface " + selectedPortId + " /| i media type\n show running-config partition common | in lacp\n";
            }
            if (platform.indexOf("C2960X") != -1 || platform.indexOf("C3560CX") != -1 || platform.indexOf("2960L") != -1 || platform.indexOf("C1000") != -1 || platform.indexOf("S6650L") != -1 || platform.indexOf("S5960") != -1) {
                platformC2960XR_C3560CX_C2960L_C2960X = true;
                portConfCLI += "show running-config ip dhcp pool \n";
            }
            portConfCLIOP = clusterCmdService.getMultiShowCmdOutput(portConfCLI, switchIndex);
        }
        var interfaceStatus=portConfCLIOP[0].split("\n");
        portsObj["PortId"] = interfaceStatus[1].substring(0,8).trim();
        portsObj["Status"] =interfaceStatus[1].substring(29,41).trim();
        portsObj["Duplex"] = interfaceStatus[1].substring(52,59).trim().replace(/^a-/, "");
        portsObj["Speed"] = interfaceStatus[1].substring(60,66).trim().replace(/^a-/, "");
        var portsSwitchInfo=portConfCLIOP[1];
        portsObj["SwitchMode"] = executeCliCmdService.getNextString(portsSwitchInfo,["Administrative Mode:"],["\n"]).trim();
        portsObj["accessVlan"] = executeCliCmdService.getNextString(portsSwitchInfo,["Access Mode VLAN:"],["\n"]).trim().split(" ")[0].trim();
        portsObj["voiceVlan"] = executeCliCmdService.getNextString(portsSwitchInfo,["Voice VLAN:"],["\n"]).trim().split(" ")[0].trim();
        portsObj["nativeVlan"] = executeCliCmdService.getNextString(portsSwitchInfo,["Trunking Native Mode VLAN:"],["\n"]).trim().split(" ")[0].trim();
        portsObj["vlanIDs"] = executeCliCmdService.getNextString(portsSwitchInfo,["Trunking VLANs Enabled:"],["\n"]).trim();
        var runningconfig=portConfCLIOP[2];
        portsObj["runningConfigSelectedPort"]=runningconfig;
        if(runningconfig.indexOf("ip dhcp snooping trust")!=-1){
        	portsObj["dhcpsnooping"]="trust";
        }else{
        	portsObj["dhcpsnooping"]="";
        }
        portsObj["portfast"] =executeCliCmdService.getNextString(runningconfig,["spanning-tree portfast"],["\n"]).trim();
        portsObj["portPriority"] =executeCliCmdService.getNextString(runningconfig,["spanning-tree port-priority "],["\n"]).trim();
        portsObj["flowControl"] =executeCliCmdService.getNextString(runningconfig,["flowcontrol receive "],["\n"]).trim();
        if(runningconfig.indexOf("switchport port-security")!=-1){
			portsObj["portSecurity"]=true;
		}else{
			portsObj["portSecurity"]=false;
		}
        
        //Adding LACP port priority
        if(runningconfig.indexOf("lacp port-priority")!=-1){
        	portsObj["lacpPortPriorityValue"] =executeCliCmdService.getNextString(runningconfig,["lacp port-priority "],["\n"]).trim();        	  
        }else{
        	portsObj["lacpPortPriorityValue"]="";
        }
        
        portsObj["stormControl"] =executeCliCmdService.getNextString(runningconfig,["storm-control action"],["\n"]).trim();
		portsObj["autoQOS"] =executeCliCmdService.getNextString(runningconfig,["auto qos"],["\n"]).trim();
		portsObj["Description"] =executeCliCmdService.getNextString(runningconfig,["description"],["\n"]).trim();
		//Adding selecon support
        if(platformCDB){
    		if(runningconfig.indexOf("no power inline port 2-event")!=-1){
    			portsObj["eveClassification"]=false;
    		}else{
    			portsObj["eveClassification"]=true;
    		}    		
    		// LACP System Priority
    		if(portConfCLIOP[3].indexOf("lacp system-priority")!=-1){
    			portsObj["lacpSysPriorityValue"]=executeCliCmdService.getNextString(portConfCLIOP[3],["lacp system-priority "],["\n"]).trim();
    		}else{
    			portsObj["lacpSysPriorityValue"]="";
    		}
    		
        }else{
        	if(portConfCLIOP[4].indexOf("lacp system-priority")!=-1){
    			portsObj["lacpSysPriorityValue"]=executeCliCmdService.getNextString(portConfCLIOP[4],["lacp system-priority "],["\n"]).trim();
    		}else{
    			portsObj["lacpSysPriorityValue"]="";
    		}
        }
        if(runningconfig.indexOf("power inline port poe-ha")!=-1){
			portsObj["perpetualPoE"]=true;
			if(runningconfig.indexOf("no power inline port poe-ha")!=-1){
				portsObj["perpetualPoE"]=false;				
			}
		}else{
			portsObj["perpetualPoE"]=false;
		}
        var advSetting = {};
        advSetting.broadcast =executeCliCmdService.getNextString(runningconfig,["storm-control broadcast level"],["\n"]).trim();
        advSetting.broadcast = advSetting.broadcast === undefined ? "" : advSetting.broadcast;
        var broadcastToString = advSetting.broadcast.toString();
        advSetting.multicast =executeCliCmdService.getNextString(runningconfig,["storm-control multicast level"],["\n"]).trim();
        advSetting.multicast = advSetting.multicast === undefined ? "" : advSetting.multicast;
        var multicastToString = advSetting.multicast.toString();
        advSetting.unicast =executeCliCmdService.getNextString(runningconfig,["storm-control unicast level"],["\n"]).trim();
        advSetting.unicast = advSetting.unicast === undefined ? "" : advSetting.unicast;
        var unicastToString = advSetting.unicast.toString();
        portsObj["broadcast"]=broadcastToString.split('.')[0];
        portsObj["multicast"]=multicastToString.split('.')[0];
        portsObj["unicast"]=unicastToString.split('.')[0];
        portsObj["runDuplex"]= executeCliCmdService.getNextString(runningconfig,["duplex"],["\n"]).trim();
        portsObj["runSpeed"]= executeCliCmdService.getNextString(runningconfig,["speed"],["\n"]).trim();
        //Setting LoopDetect
        if(runningconfig.indexOf("loopdetect")!=-1){
        	portsObj["loopDetectStatus"]=true;
        	portsObj["loopDetectValue"]=executeCliCmdService.getNextString(runningconfig,["loopdetect "],["\n"]).trim();;
        }else{
        	portsObj["loopDetectStatus"]=false;
        	portsObj["loopDetectValue"]="";
        }
        //setting ARP inspection
        if(runningconfig.indexOf("ip arp inspection trust")!=-1){
        	portsObj["arpInspectionStatus"]=true;        	
        }else{
        	portsObj["arpInspectionStatus"]=false;
        }
        if(runningconfig.indexOf("ip arp inspection limit rate")!=-1){
           	portsObj["arpLimitRate"]=executeCliCmdService.getNextString(runningconfig,["ip arp inspection limit rate "],["\n"]).trim();;
        }else{
           	portsObj["arpLimitRate"]="";
        }
        
        if(runningconfig.indexOf("no mdix auto")!=-1){
        	portsObj["mdixStatus"]=false;        	
        }else{
        	portsObj["mdixStatus"]=true;
        }
        if(runningconfig.indexOf("no cdp enable")!=-1){
        	portsObj["cdpStatus"]=false;        	
        }else{
        	portsObj["cdpStatus"]=true;
        }
        if(runningconfig.indexOf("no lldp receive")!=-1){
        	portsObj["lldpStatus"]=false;        	
        }else{
        	portsObj["lldpStatus"]=true;
        }
        //STP Extensions
        if(runningconfig.indexOf("spanning-tree portfast edge")!=-1){
        	portsObj["stpPortType"]="edge";
        }else if(runningconfig.indexOf("spanning-tree portfast network")!=-1){
        	portsObj["stpPortType"]="network";
        }else{
        	portsObj["stpPortType"]="disable";
        }
        if(runningconfig.indexOf("spanning-tree bpdufilter enable")!=-1){
        	portsObj["stpBpdufilter"]=true;        	
        }else{
        	portsObj["stpBpdufilter"]=false;
        }
        if(runningconfig.indexOf("spanning-tree bpduguard enable")!=-1){
        	portsObj["stpBpduguard"]=true;        	
        }else{
        	portsObj["stpBpduguard"]=false;
        }
        if(runningconfig.indexOf("spanning-tree guard loop")!=-1){
        	portsObj["stpLoopGuard"]=true;        	
        }else{
        	portsObj["stpLoopGuard"]=false;
        }
        
        if(!platformCDB){
        	portsObj["mediaCLIOP"]=portConfCLIOP[3];
        }
        if(platformC2960XR_C3560CX_C2960L_C2960X) {
            portsObj["dhcpPool"]=portConfCLIOP[5];
        }
        return portsObj;
    }
}
}]);
