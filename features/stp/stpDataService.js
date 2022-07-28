/**
 Description: Services for STP.
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.service('stpdataSourceService',['$rootScope','requestRoutingService','getStringLineService','executeCliCmdService','$filter', function($rootScope,requestRoutingService,getStringLineService,executeCliCmdService,$filter) {
  var trimVal=$filter('trimValue');
  var translate = $filter("translate");
	  return{
         sendingStpModeToDevice : function(stpModeType){
            var stpCliCommand="spanning-tree mode ";
            var stpValue=stpModeType;
            stpCliCommand=stpCliCommand+stpValue;
            var resultResponse=requestRoutingService.getConfigCmdOutput(stpCliCommand);
        },
        sendingVlanDataToDevice:function(editedObject){
            var vlanCliCommand = "";
            editedObject.forEach(function(changedTableItem){
                   if(changedTableItem.hasSpanningTree === false){
                        vlanCliCommand+="no spanning-tree vlan "+changedTableItem.vlanId+" \n";
                   }else{
                	   vlanCliCommand+="spanning-tree vlan "+changedTableItem.vlanId+"\n";
                       vlanCliCommand+="spanning-tree vlan "+changedTableItem.vlanId+" priority "+changedTableItem.bridgePriorityNumber+"\n";
                       vlanCliCommand+="spanning-tree vlan "+changedTableItem.vlanId+" forward-time "+changedTableItem.forwardTime+"\n";
                       vlanCliCommand+="spanning-tree vlan "+changedTableItem.vlanId+" hello-time "+changedTableItem.helloTime+"\n";
                       vlanCliCommand+="spanning-tree vlan "+changedTableItem.vlanId+" max-age "+changedTableItem.maxAge+"\n";
                   }
            });
            var resultResponse=requestRoutingService.getConfigCmdOutput(vlanCliCommand);
            return resultResponse;
        },
        getStpGlobalInfo:function(){
        	var arrSTPGlobalConfig=[],stpObj ={},stpModeType="",stpPortType="",stpLoopGuard="",transHeadCount="",stpBpdufilter="",stpBpduguard="";
        	var stpCLI="show running-config partition common | s spanning-tree\n";
            var stpCLIOP = deviceCommunicatorCLI.getExecCmdOutput(stpCLI);            
        	if(stpCLIOP[0].indexOf("spanning-tree mode")!=-1){
        		stpModeType= executeCliCmdService.getNextString(stpCLIOP[0],["spanning-tree mode "],["\n"]);
            }else{
            	stpModeType="rapid-pvst";
            }
        	if(stpCLIOP[0].indexOf("spanning-tree portfast edge default")!=-1){
            	stpPortType= "edge default";
            }else if(stpCLIOP[0].indexOf("spanning-tree portfast network default")!=-1){
            	stpPortType= "network default";
            }else{
            	stpPortType="normal default";
            }
            if(stpCLIOP[0].indexOf("spanning-tree portfast edge bpdufilter default")!=-1){
            	stpBpdufilter="enabled"
            }else{
            	stpBpdufilter="disabled"
            }
            if(stpCLIOP[0].indexOf("spanning-tree portfast edge bpduguard default")!=-1){
            	stpBpduguard="enabled"
            }else{
            	stpBpduguard="disabled"
            }
            if(stpCLIOP[0].indexOf("spanning-tree loopguard default")!=-1){
            	stpLoopGuard="enabled"
            }else{
            	stpLoopGuard="disabled"
            }
            if(stpCLIOP[0].indexOf("spanning-tree transmit hold-count")!=-1){
            	transHeadCount= executeCliCmdService.getNextString(stpCLIOP[0],["spanning-tree transmit hold-count "],["\n"]);
            }else{
            	transHeadCount="6";
            }            
            stpObj["stpModeType"] = stpModeType;
            stpObj["stpPortType"] = stpPortType;
            stpObj["stpBpdufilter"] = stpBpdufilter;
            stpObj["stpBpduguard"] = stpBpduguard;
            stpObj["stpLoopGuard"] = stpLoopGuard;
            stpObj["transHeadCount"] = transHeadCount;           
            arrSTPGlobalConfig.push(stpObj);          
            return arrSTPGlobalConfig;           
        },
        getVlanData:function(){
        	var arrSTP=[];
            //Sending all required CLIs of STP page
        	var stpCLI="show vlan brief\n show running-config partition common | s spanning-tree\n";
           //Returning array that contains all the given CLI O/P
            var stpCLIOP = deviceCommunicatorCLI.getExecCmdOutput(stpCLI);
            //Getting vlan brief details
            var vlanBriefData=[];
            var arrVlanBr=stpCLIOP[0].split("\n");
			for (var i=2; i < arrVlanBr.length; i++) {
				vlanPorts="";
				var arrInnerWords = arrVlanBr[i].split(" ");
				for (var k=0,j=1; k < arrInnerWords.length; k++) {
					if(arrInnerWords[k] == "") {
			 			continue;
		 			}
					if (j == 1) {
						vlanId=arrInnerWords[k];
		 			} else if (j == 2) {
		 				vlanName=arrInnerWords[k];
		 			}
		 		   	j++;
				}
				var items = {
    					"vlan"   : vlanId,
    					"name"   : vlanName
    			};
				vlanBriefData.push(items);
			}
            var arrVlanId=[];
            var arrPriority=[];
            var arrVlanId1=[];
            var arrForwardTime=[];
            var arrHelloTime=[];
            var arrMaxAge=[];
            var arrVlanIdForwardTime=[];
            var arrVlanIdHelloTime=[];
            var arrVlanIdMaxAge=[];
            
            var strLines = getStringLineService.getLines(stpCLIOP[1],["spanning-tree vlan "]);
            if (strLines != null) {
                for (var i=0; i<strLines.length; i++) {
                       var strLine = strLines[i];
                       //for disabled state vlan's
                       if(strLine.indexOf("no spanning-tree vlan")!=-1){
                    	 vlanList= executeCliCmdService.getNextString(strLine,["spanning-tree vlan "],["\n"]);
                      	 arrValList=vlanList.split(" ");
                         if(vlanList.indexOf(",")!=-1){
                        		 vlansList=arrValList[0];
                        		 arrVlansList=vlansList.split(",");
                        		 for (var j=0; j<arrVlansList.length; j++) {
                        			if(arrVlansList[j].indexOf("-")!=-1){
                        				vlanMultiList=arrVlansList[j].split("-");
                        				for (var k=vlanMultiList[0]; k<= vlanMultiList[1]; k++) {
                        					arrVlanId1.push(k);
                        				}
                        			}else{
                        				arrVlanId1.push(arrVlansList[j]);
                               		}
                        		 }
                           }else{
                          	 if(vlanList.indexOf("-")!=-1){
                     				vlanMultiList=arrValList[0].split("-");
                     				for (var k1=vlanMultiList[0]; k1<= vlanMultiList[1]; k1++) {
                     					arrVlanId1.push(k1);
                                	}
                     			}else{
                     				arrVlanId1.push(arrValList[0]);
                     			}
                         }
                       }else{
                            //for enabled state vlan's
                             vlanList= executeCliCmdService.getNextString(strLine,["spanning-tree vlan "],["\n"]);
                        	 arrValList=vlanList.split(" ");
                        	 
                        	 //For getting Priority value
                        	 if(vlanList.indexOf("priority")!=-1){
		                             if(vlanList.indexOf(",")!=-1){
		                          		 vlansList=arrValList[0];
		                          		 arrVlansList=vlansList.split(",");
		                          		 for (var j1=0; j1<arrVlansList.length; j1++) {
		                          			if(arrVlansList[j1].indexOf("-")!=-1){
		                          				vlanMultiList=arrVlansList[j1].split("-");
		                          				for (var j1k=vlanMultiList[0]; j1k<= vlanMultiList[1]; j1k++) {
		                          					arrVlanId.push(j1k);
		                                     		arrPriority.push(arrValList[2]);
		                          				}
		                          			}else{
		                          				arrVlanId.push(arrVlansList[j1]);
		                                 		arrPriority.push(arrValList[2]);
		                          			}
		                          		 }
		                             }else{
		                            	 if(vlanList.indexOf("-")!=-1){
		                       				vlanMultiList=arrValList[0].split("-");
		                       				for (var k2=vlanMultiList[0]; k2<= vlanMultiList[1]; k2++) {
		                       					arrVlanId.push(k2);
		                                  		arrPriority.push(arrValList[2]);
		                       				}
		                       			}else{
		                       				arrVlanId.push(arrValList[0]);
		                       				arrPriority.push(arrValList[2]);
		                       			}
		                           }
                        	}       
                           //End priority value
                        	 
                           //For getting forward time value
                        	 if(vlanList.indexOf("forward-time")!=-1){
		                             if(vlanList.indexOf(",")!=-1){
		                          		 vlansList=arrValList[0];
		                          		 arrVlansList=vlansList.split(",");
		                          		 for (var j1=0; j1<arrVlansList.length; j1++) {
		                          			if(arrVlansList[j1].indexOf("-")!=-1){
		                          				vlanMultiList=arrVlansList[j1].split("-");
		                          				for (var j1k=vlanMultiList[0]; j1k<= vlanMultiList[1]; j1k++) {
		                          					arrVlanIdForwardTime.push(j1k);
		                          					arrForwardTime.push(arrValList[2]);
		                          				}
		                          			}else{
		                          				arrVlanIdForwardTime.push(arrVlansList[j1]);
		                          				arrForwardTime.push(arrValList[2]);
		                          			}
		                          		 }
		                             }else{
		                            	 if(arrValList[0].indexOf("-")!=-1){
		                       				vlanMultiList=arrValList[0].split("-");
		                       				for (var k2=vlanMultiList[0]; k2<= vlanMultiList[1]; k2++) {
		                       					arrVlanIdForwardTime.push(k2);
		                       					arrForwardTime.push(arrValList[2]);
		                       				}
		                       			}else{
		                       				arrVlanIdForwardTime.push(arrValList[0]);
		                       				arrForwardTime.push(arrValList[2]);
		                       			}
		                           }
                        	}       
                           //End forward time value
                        	 
                           //For getting hello time value
                        	if(vlanList.indexOf("hello-time")!=-1){
		                             if(vlanList.indexOf(",")!=-1){
		                          		 vlansList=arrValList[0];
		                          		 arrVlansList=vlansList.split(",");
		                          		 for (var j1=0; j1<arrVlansList.length; j1++) {
		                          			if(arrVlansList[j1].indexOf("-")!=-1){
		                          				vlanMultiList=arrVlansList[j1].split("-");
		                          				for (var j1k=vlanMultiList[0]; j1k<= vlanMultiList[1]; j1k++) {
		                          					arrVlanIdHelloTime.push(j1k);
		                          					arrHelloTime.push(arrValList[2]);
		                          				}
		                          			}else{
		                          				arrVlanIdHelloTime.push(arrVlansList[j1]);
		                          				arrHelloTime.push(arrValList[2]);
		                          			}
		                          		 }
		                             }else{
		                            	 if(arrValList[0].indexOf("-")!=-1){
		                       				vlanMultiList=arrValList[0].split("-");
		                       				for (var k2=vlanMultiList[0]; k2<= vlanMultiList[1]; k2++) {
		                       					arrVlanIdHelloTime.push(k2);
		                       					arrHelloTime.push(arrValList[2]);
		                       				}
		                       			}else{
		                       				arrVlanIdHelloTime.push(arrValList[0]);
		                       				arrHelloTime.push(arrValList[2]);
		                       			}
		                           }
                        	}       
                           //End hello time value
                           
                        	//For getting max-age value
                        	if(vlanList.indexOf("max-age")!=-1){
		                             if(vlanList.indexOf(",")!=-1){
		                          		 vlansList=arrValList[0];
		                          		 arrVlansList=vlansList.split(",");
		                          		 for (var j1=0; j1<arrVlansList.length; j1++) {
		                          			if(arrVlansList[j1].indexOf("-")!=-1){
		                          				vlanMultiList=arrVlansList[j1].split("-");
		                          				for (var j1k=vlanMultiList[0]; j1k<= vlanMultiList[1]; j1k++) {
		                          					arrVlanIdMaxAge.push(j1k);
		                          					arrMaxAge.push(arrValList[2]);
		                          				}
		                          			}else{
		                          				arrVlanIdMaxAge.push(arrVlansList[j1]);
		                          				arrMaxAge.push(arrValList[2]);
		                          			}
		                          		 }
		                             }else{
		                            	 if(arrValList[0].indexOf("-")!=-1){
		                       				vlanMultiList=arrValList[0].split("-");
		                       				for (var k2=vlanMultiList[0]; k2<= vlanMultiList[1]; k2++) {
		                       					arrVlanIdMaxAge.push(k2);
		                       					arrMaxAge.push(arrValList[2]);
		                       				}
		                       			}else{
		                       				arrVlanIdMaxAge.push(arrValList[0]);
		                       				arrMaxAge.push(arrValList[2]);
		                       			}
		                           }
                        	}       
                           //End max-age value
                     }
                }
            }
       
            //populating STP Final value
            for(var item=0;item < vlanBriefData.length;item++){
            	if (vlanBriefData[item].name != "" &&  vlanBriefData[item].name != "token-ring-default" && vlanBriefData[item].name != "MGMT_VLAN" && vlanBriefData[item].name != "DataVlan" && vlanBriefData[item].name != "VoiceVlan" && vlanBriefData[item].name != "fddi-default" && vlanBriefData[item].name != "trnet-default" && vlanBriefData[item].name != "fddinet-default") {
                	var stpObj = {};
                	var count=0;
                	stpObj["vlanId"] = vlanBriefData[item].vlan;
                    stpObj["vlanName"] = vlanBriefData[item].name == "default" ? translate("port_config_default") : vlanBriefData[item].name;
                    //set default bridge priority,ST Status, forward-time, hello time,max age
                    stpObj["bridgePriorityNumber"] = "32768";
                    stpObj["hasSpanningTree"] = true;
                    stpObj["forwardTime"] = "15";
                    stpObj["helloTime"] = "2";
                    stpObj["maxAge"] = "20";
                    
                    for(var i1=0;i1 <arrVlanId.length;i1++){
                    	if(vlanBriefData[item].vlan==arrVlanId[i1]){
                    		stpObj["bridgePriorityNumber"] = arrPriority[i1];
                            stpObj["hasSpanningTree"] = true;                            
                            count++;
                    	}
                    }
                    for(var i1=0;i1 <arrVlanIdForwardTime.length;i1++){
                    	if(vlanBriefData[item].vlan==arrVlanIdForwardTime[i1]){                    		
                            stpObj["forwardTime"] = arrForwardTime[i1];                           
                    	}
                    }
                    for(var i1=0;i1 <arrVlanIdHelloTime.length;i1++){
                    	if(vlanBriefData[item].vlan==arrVlanIdHelloTime[i1]){                    		
                            stpObj["helloTime"] = arrHelloTime[i1];                           
                    	}
                    }
                    for(var i1=0;i1 <arrVlanIdMaxAge.length;i1++){
                    	if(vlanBriefData[item].vlan==arrVlanIdMaxAge[i1]){                    		
                            stpObj["maxAge"] = arrMaxAge[i1];                           
                    	}
                    }
                    for(var j2=0;j2 <arrVlanId1.length;j2++){
                    	if(vlanBriefData[item].vlan==arrVlanId1[j2]){
                    		if(count==0){
                    			stpObj["bridgePriorityNumber"] = "32768";
                    		}
                            stpObj["hasSpanningTree"] = false;
                    	}
                    }
                    arrSTP.push(stpObj);
               }
           }
           return arrSTP;
        },
        getSwitchDetails:function(){
        	 var deviceType = $rootScope.deviceInfo.type;
        	//Sending all required CLIs of Switch page
        	var switchCLI="";
        	if(deviceType.indexOf("CDB")!=-1){
        		switchCLI="show version\n show ip interface\n show ip http server history | i [0-9]+\n show running-config partition common | in ip default-gateway \n show system mtu\n show cluster\n show coap stats\n";
        	}else{
        		switchCLI="show version\n show ip interface\n show ip http server history | i [0-9]+\n show running-config partition common | in ip default-gateway \n show system mtu\n show cluster\n";
            if($rootScope.deviceInfo.type.indexOf("C2960X") != -1 || ($rootScope.deviceInfo.type.indexOf("S5960") != -1 && $rootScope.deviceInfo.type.indexOf("S5960L") == -1) ) {
              switchCLI += "show running-config interface FastEthernet0\n";
            }
        	}
           //Returning array that contains all the given CLI O/P
            var switchCLIOP = deviceCommunicatorCLI.getExecCmdOutput(switchCLI);
            var switchData={};
            var strLines = getStringLineService.getLines(switchCLIOP[0],["uptime"]);
            switchData["fastInt"] = {
              ip: "",
              subnet: ""
            }
            switchData["hostName"] = strLines[0].split(" ")[0].trim();
            if($rootScope.deviceInfo.type.indexOf("C2960X") != -1 || ($rootScope.deviceInfo.type.indexOf("S5960") != -1 && $rootScope.deviceInfo.type.indexOf("S5960L") == -1) ) {
                switchData["ipType"] = "none";
                var btIntData = executeCliCmdService.getNextString(switchCLIOP[6],["ip address "],["\n"]).trim();
                btIntData = btIntData.split(" ");
                switchData["ipv4StatusFa"]=false;
                if(btIntData.length == 2){
	                switchData["fastInt"].ip = btIntData[0].trim();
	                switchData["fastInt"].subnet = btIntData[1].trim()
	                switchData["ipType"] = "static";
	                switchData["ipv4StatusFa"]=true;
                }            
              //Populating IPV6 list for fastEthernet
    			var arrIPV6 =new Array();                       
                var ipv6Status = false;
                var ipv6AutoConfigStatus=false;
                var ipv6DhcpStatus=false;
                var ipv6RapidCommitStatus=false;
               	var ipv6List =getStringLineService.getLines(switchCLIOP[6],["ipv6 address"]);	
    			if(ipv6List.length > 0){	
    				 ipv6Status = true;                            
                	 for(var i = 0; i < ipv6List.length; i++){
                		 var ipv6Address=executeCliCmdService.getNextString(ipv6List[i],["ipv6 address "],["\n"]).trim();
                		 if(ipv6Address.indexOf("autoconfig")==-1 && ipv6Address.indexOf("dhcp")==-1){
                			 arrIPV6.push({"name":ipv6Address});                          
                		 }   
                		 if(ipv6Address.indexOf("autoconfig")!=-1){
                			 ipv6AutoConfigStatus=true;
                		 }
                		 if(ipv6Address.indexOf("dhcp")!=-1){
                			 if(ipv6Address.indexOf("dhcp rapid-commit")!=-1){
                				 ipv6RapidCommitStatus=true;
                				 ipv6DhcpStatus=true;
                			 }else{
                				 ipv6DhcpStatus=true; 
                			 }
                		 }
                	 }                            
    			}
    			switchData["ipv6ListFa"]=arrIPV6;
    			switchData["ipv6StatusFa"]=ipv6Status;
    			switchData["ipv6AutoConfigStatusFa"]=ipv6AutoConfigStatus;
    			switchData["ipv6DhcpStatusFa"]=ipv6DhcpStatus;
    			switchData["ipv6RapidCommitStatusFa"]=ipv6RapidCommitStatus;
            }
            //Setting Show Ip Interface O/P
            var switchDetailResponse=[];
            var strLinesInterface = getStringLineService.getLines(switchCLIOP[1],["line protocol is"]);
            var arrShowIPIntefaceList=switchCLIOP[1].split("line protocol is");
            for(var i = 0; i < strLinesInterface.length; i++){
            	var portsObj = {};
        		portsObj["Vlan"] = strLinesInterface[i].split(" ")[0].trim();
        		portsObj["ipAddress"] = executeCliCmdService.getNextString(arrShowIPIntefaceList[parseInt(i)+1],["Internet address is"],["\n"]).trim();
        		switchDetailResponse.push(portsObj);
            }
            var httpIpAddress = switchCLIOP[2];
            httpIpAddressList=httpIpAddress.split("\n");            
            arrayLength=httpIpAddressList.length;
           
            //For IPV4 address from http
            arrHttpIpAddress=trimVal(httpIpAddressList[arrayLength-1]).split(" ");           
            if(arrHttpIpAddress[0].indexOf(".")!=-1){   
            	mgmtIpaddress=arrHttpIpAddress[0].split(":");
                var currentIpAdddress=mgmtIpaddress[0];
                currentIpAdddress=trimVal(currentIpAdddress);             
                var vlan="";
                var ipAddress="";
                if (switchDetailResponse.length > 0) {
                    for (var i = 0; i < switchDetailResponse.length; i++) {
                    	vlan= switchDetailResponse[i].Vlan;
                    	ipAddress= switchDetailResponse[i].ipAddress;
                    	if(ipAddress!=undefined){
                    		aripAddress=ipAddress.split("/");
                    		newIP=trimVal(aripAddress[0]);
                    		if(newIP==currentIpAdddress){
                    			switchData["managementVlan"]=vlan;
                    			break;
                    		}
                    	}
                    }
                }else if (switchDetailResponse.Vlan) {
                	   vlan= switchDetailResponse.Vlan;
                	   ipAddress= switchDetailResponse.ipAddress;
                	   if(ipAddress!=undefined){
                   		aripAddress=ipAddress.split("/");
                   		newIP=trimVal(aripAddress[0]);
                   		if(newIP==currentIpAdddress){
                   			switchData["managementVlan"]=vlan;
                   		}
                   	}
                }
            }else{
            	//for IPV6 address from http
            	 arrHttpIpAddress=trimVal(httpIpAddressList[arrayLength-3]).split(" ");              
                 var currentIPV6=executeCliCmdService.getNextString(arrHttpIpAddress[0],["["],["]"]).trim();
              	 var interfaceCLIOP = deviceCommunicatorCLI.getExecCmdOutput("show running-config | s interface\n");
    			 var interfacesRunningConfig=interfaceCLIOP[0].split("interface");
    	         for(var i = 1; i < interfacesRunningConfig.length; i++){
    	            	var ipAddress="";
    	                var intShowRun="interface "+interfacesRunningConfig[i];
    	                var interfaceName= executeCliCmdService.getNextString(intShowRun,["interface"],["\n"]).trim();
    	          		if(interfaceName.indexOf("Port") != -1){
    						continue;
    					}    	    			
    	    			if(intShowRun.indexOf("ipv6 address")!=-1){
    	    				var strLinesInterface = getStringLineService.getLines(intShowRun,["ipv6 address"]);
    	    				for(var j = 0; j < strLinesInterface.length; j++){
    	    					if(strLinesInterface[j].indexOf("link-local")!=-1){
    	    						ipAddress=executeCliCmdService.getNextString(strLinesInterface[j],["ipv6 address "],["\n"]).split(" ")[0];
    	    					}else{
    	    						ipAddress=executeCliCmdService.getNextString(strLinesInterface[j],["ipv6 address "],["\n"]).split("/")[0];
    	    					}   
    	    					if(ipAddress==currentIPV6){
    	    						switchData["managementVlan"]=interfaceName;
    	    						break;
    	    					}
    	    				}	    				
    	    			}	    			
    	         }   	    
    	         
    	         
            }
            
            var strGatewayLines = getStringLineService.getLines(switchCLIOP[3],["ip default-gateway"]);
            switchData["defaultGateway"]=executeCliCmdService.getNextString(strGatewayLines[0],["ip default-gateway"],["\n"]).trim();
          //Getting IPv4address Address details
            var switchShowRunIPAddress=deviceCommunicator.getExecCmdOutput("show running-config int "+switchData["managementVlan"]+"\n");
            var switchIPAddress=executeCliCmdService.getNextString(switchShowRunIPAddress,["ip address "],["\n"]).trim();
            arrSwitchIPAddress=switchIPAddress.split(" ");
            switchData["switchIp"]=arrSwitchIPAddress[0]
            switchData["subnetMask"]=arrSwitchIPAddress[1];
            switchData["ipv4Status"]=true;
          //Populating IPV6 list
			var arrIPV6 =new Array();                       
            var ipv6Status = false;
            var ipv6AutoConfigStatus=false;
            var ipv6DhcpStatus=false;
            var ipv6RapidCommitStatus=false;
           	var ipv6List =getStringLineService.getLines(switchShowRunIPAddress,["ipv6 address"]);	
			if(ipv6List.length > 0){	
				 ipv6Status = true;                            
            	 for(var i = 0; i < ipv6List.length; i++){
            		 var ipv6Address=executeCliCmdService.getNextString(ipv6List[i],["ipv6 address "],["\n"]).trim();
            		 if(ipv6Address.indexOf("autoconfig")==-1 && ipv6Address.indexOf("dhcp")==-1){
            			 arrIPV6.push({"name":ipv6Address});                          
            		 }   
            		 if(ipv6Address.indexOf("autoconfig")!=-1){
            			 ipv6AutoConfigStatus=true;
            		 }
            		 if(ipv6Address.indexOf("dhcp")!=-1){
            			 if(ipv6Address.indexOf("dhcp rapid-commit")!=-1){
            				 ipv6RapidCommitStatus=true;
            				 ipv6DhcpStatus=true;
            			 }else{
            				 ipv6DhcpStatus=true; 
            			 }
            		 }
            	 }                            
			}
			switchData["ipv6List"]=arrIPV6;
			switchData["ipv6Status"]=ipv6Status;
			switchData["ipv6AutoConfigStatus"]=ipv6AutoConfigStatus;
			switchData["ipv6DhcpStatus"]=ipv6DhcpStatus;
			switchData["ipv6RapidCommitStatus"]=ipv6RapidCommitStatus;
            
            var strCLIOutputMTU =switchCLIOP[4];
          	switchData["mtuSize"]=executeCliCmdService.getNextString(strCLIOutputMTU,["System MTU size is "],[" bytes"]).trim();
          	//Setting Cluster Details
          	switchData["domainName"]=executeCliCmdService.getNextString(switchCLIOP[5],["switch for cluster"],["\n"]).trim();
         	//Adding selecon support
            if(deviceType.indexOf("CDB")!=-1){
	    		var coapStatus = deviceCommunicatorCLI.getExecCmdOutput("show coap stats");;
	    		if(coapStatus[0].indexOf("COAP is disabled")!=-1){
	    			switchData["switchCOAP"]=false;
	    		}else{
	    			switchData["switchCOAP"]=true;
	    		}
            }
            return switchData;
        }
    }
}]);
