/*!
 * DeviceCommunicator Javascript library v1.0
 *
 * Copyright (c) 2008, 2011, 2014-2015 by Cisco Systems, Inc.,
 * 170 West Tasman Drive, San Jose,
 * California, 95134, U.S.A.   All rights reserved.
 *
 * @author: rtv
 *
 */

var deviceCommunicatorCLI = (function() {

  //All variables go here
  var CMD_HTTP_URL = '/ios_web_exec/commandset',
    //Add router responses that are to be ignored here.
    INFO_MESSAGES = ["#exit",
      "# exit",
      "Note: Issue",
      "Not all config may be removed",
      "3G Modem is not inserted",
      "Cannot send CHV1 to modem for verification. It will be sent when the SIM becomes active.",
      "Building configuration",
      "Not all config may be removed and may reappear after",
      "set to default configuration",
      "Translating",
      "WAN interface will be disabled",
      "DSL interfaces will be disabled",
      "Cannot enable CDP on this interface",
      "Changing media to",
      "Mode no change",
      "Default route without gateway",
      "Dynamic mapping not found",
      "Unknown physical layer",
      "Warning:",
      "Policy already has same proposal set",
      "IKEv2 Profile default not found",
      "Start IPS global disable",
      "IPSec Default Profile",
      "will be treated as host",
      "If the interface doesn't support baby giant frames",
      "Remove Dialer Profile Configuration first",
      "Remove Legacy DDR Configuration first"],
    platformType = "unknown",
    interfaceTypeMap,
    deviceType,
    //url is of the form /flash:/ccpexpressng/html/demoFeature.html
    // when the full url is "http://10.104.58.234/flash:/ccpexpressng/html/demoFeature.html".
    ccpExpressInstallDir = $(location).attr('pathname').replace(/\/(.*)\/html\/.+/, '$1');
	var csrfToken = "";
	var CMD_GET_CSRF = "";
	if($(location)[0] != undefined && $(location)[0] !=""){
		CMD_GET_CSRF = $(location)[0].origin+"/"+"get_csrf";
	}

  //add Cisco http headers and footer.
  function addHeaderAndFooter(clis, isExec) {
    return "! COMMANDSET VERSION=\"1.0\"\n" +
      "! OPTIONS BEGIN\n! MODE=\"" + (isExec ? "0" : "1") + "\"\n" +
      "! OPTIONS END\n" +
      clis + "\n" +
      "! END\n! COMMANDSET END";
  }

  function isInfoMessage(resp) {
    var found = false,
      i = INFO_MESSAGES.length;
    for (i = (INFO_MESSAGES.length - 1); i >= 0; i = (i - 1)) {
      if (resp.indexOf(INFO_MESSAGES[i]) !== -1) {
        found = true;
        break;
      }
    }
    return found;
  }

  //Send out a POST request synchronously
  //Parse the response for the output and error strings if any
  function getCmdOutput(clis, isExec, asyncFlag) {
    if (!clis) {
      return;
    }

    var retResponse = "",
      throwError = {
        errorCmd: "",
        errorResponse: ""
      };
	  
	if(CMD_GET_CSRF != ""){
		csrfToken="";
		 var xmlHttp = new XMLHttpRequest();
        // false for synchronous request
		 xmlHttp.open( "GET", CMD_GET_CSRF, false );
		 xmlHttp.send( null );
		 csrfToken = xmlHttp.responseText;		 	  		 
	}
	
	if(csrfToken.indexOf("404 Not Found") == -1){
		$.ajaxSetup({headers: {'X-Csrf-Token':csrfToken}});
	}
    if (asyncFlag === true) {
      $.ajaxSetup({async: true});
    } else {
      $.ajaxSetup({async: false});
    }
    $.post(CMD_HTTP_URL, addHeaderAndFooter(clis, isExec),
      function(data) {
        if (data.indexOf("! COMMANDSET") === -1) {
          throwError.errorCmd = clis;
          throwError.errorResponse = data;
          throw throwError;
        }
        if (data.indexOf("STATUS=\"0\"") === -1) {
          throwError.errorCmd = clis;
          throwError.errorResponse = data;
          throw throwError;
        }
        var response = [],arrCLIOPBegin=[],arrCLIOPEnd=[];
        var arrCLIOPBegin=data.split("! OUTPUT BEGIN");
        for(var i = 1; i < arrCLIOPBegin.length; i++){
        	arrCLIOPEnd=arrCLIOPBegin[i].split("! OUTPUT END");
           response.push(arrCLIOPEnd[0].trim());
        }
        retResponse = response;
      }

    );

    if (asyncFlag === true) {
      $.ajaxSetup({async: false});
    } else {
      $.ajaxSetup({async: true});
    }
    return retResponse;
  }

  function getExecCmdOutput(clis) {
    //Changes for CCPExpress3.1PerformanceImprovement
    var commandOutput = getCmdOutput(clis, true);
    return commandOutput;
  }
  function getConfigCmdOutput(clis, asyncFlag) {
    var configCommandOutput = getCmdOutput(clis, false, asyncFlag);
    shRunFormatLatest = false;
    return configCommandOutput;
  }
  function getResource(resourceName) {
    var template = "",
      templatePath = resourceName,
      throwError = {
        errorCmd: "",
        errorResponse: ""
      };
    if (!resourceName) {
      throwError.errorResponse = "Specify non-empty resource name";
      throw throwError;
    }
    $.ajaxSetup({async: false});
    $.get(templatePath,
      function(data) {
        template = data;
      }
    );
    $.ajaxSetup({async: true});
    return template;
  }

  function clubShowCmdsExecuteAndSplitOutput(commandArray, outputSeparator)
  {
    var newArray = null;
    if (commandArray!=null && commandArray!=undefined && commandArray.length>0)
    {
      var outputToCheck = getExecCmdOutput(commandArray.join("\n"));
      if (outputToCheck) {
        newArray = outputToCheck.split(outputSeparator);
      }
    }
    return newArray;
  }
  function getTemplate(templateName, isDelete) {
    var templatePath = "..\/templates\/" + templateName.replace('#', '') + (isDelete ? "Delete" : "Create") + ".txt";
    return getResource(templatePath);
  }
  //This private method takes the template content instead of the template name
  function cConfigureCommandsFromTemplate(template, attrValueArray, isPreview) {
    ////consoleLog("Device Communicator - commands to execute- "+ template);
    if (!template || !attrValueArray) {
      return;
    }
    var cmds = template, argName, re,
      formItemCounter = 0;
    while (formItemCounter < attrValueArray.length) {
      argName = "\\$" + attrValueArray[formItemCounter ]['name'];
      re = new RegExp(argName, "g");
      cmds = cmds.replace(re, attrValueArray[formItemCounter ]['value']);
      formItemCounter = formItemCounter + 1;
    }
    if (isPreview === true) {
      return cmds;
    } else {
      //Need to add code here to check the template commands and then reset the corresponding cache CLI flags accordingly.
      return getConfigCmdOutput(cmds);
    }
  }

  function configureCommandsFromTemplate(templateName, attrValueArray, isPreview) {
    return cConfigureCommandsFromTemplate(getResource("../templates\/" + templateName), attrValueArray, isPreview);
  }
  function configureCommandsFromTemplate2(templateName, attrValueArray, isPreview) {
    return cConfigureCommandsFromTemplate(getResource("../templates2\/" + templateName), attrValueArray, isPreview);
  }
  function formatCli(cli) {
    var cliLine = cli.split("\n");
    var find = 'BREAK;';
    var re = new RegExp(find, 'g');
    var tempArr = [];
    var tempText = "";
    $.each(cliLine, function(index, value) {
      tempText = value.trim();
      if (tempText != "") {
        tempArr.push(tempText);
      }
      tempText = "";
    });
    var tempString = tempArr.join('\n');
    return tempString.replace(re, "\n");
  }
  function configureCommandsFrom_Template2(templateName, attrValueArray, isPreview) {
    return configureCommandsFrom_TemplateMain("../templates2\/", templateName, attrValueArray, isPreview);
  }
  function configureCommandsFrom_Template(templateName, attrValueArray, isPreview) {
    return configureCommandsFrom_TemplateMain("../templates\/", templateName, attrValueArray, isPreview);
  }
  function configureCommandsFrom_TemplateMain(folderName, templateName, attrValueArray, isPreview) {
    _.templateSettings.interpolate = /\{\{(.+?)\}\}/g;
    var templetData = getResource(folderName + templateName);
    var jsonArray = {};
    for (var countArray = 0; countArray < attrValueArray.length; countArray++) {
      var elemname = attrValueArray[countArray].name;
      var elemvalue = attrValueArray[countArray].value;
      jsonArray[elemname] = elemvalue;
    }
    var cliTemp = _.template(templetData);
    var cliCollection = formatCli(cliTemp(jsonArray));
    if (isPreview) {
      return cliCollection;
    } else {
      return getConfigCmdOutput(cliCollection);
    }
  }

  function readFromTemplate(templateName, attrValueArray, isPreview) {
    return cConfigureCommandsFromTemplate(getResource("../" + templateName), attrValueArray, isPreview);
  }
  function configureFeature(formName, isDelete, isPreview) {
    if (!formName) {
      return;
    }

    var template = getTemplate(formName, isDelete),
      arr = $(formName).formToArray();
    return cConfigureCommandsFromTemplate(template, arr, isPreview);
  }

  function getCommandsForCache(jsonFileURL) {
    var jsonObject = {};
    $.ajaxSetup({ cache: false });
    $.ajax({
      url: jsonFileURL,
      async: false,
      dataType: 'json',
      contentType: 'application/json',
      type: 'GET',
      success: function(json) {
        jsonObject=json
      }
    });
    $.ajaxSetup({ cache: true });
    return jsonObject;
  }

  function getIfType(interfaceName) {
    return interfaceName.replace(/(^[a-zA-Z]+).*$/m, '$1');
  }

  function getPhraseForInterfaceType(type, hwInterfacesXml) {
    var phrase;
    //Look for a entry for the interface type in the hwdictionary.xml
    hwInterfacesXml.each(function() {
      if ($(this).attr('type') === type) {
        phrase = $(this).attr('phrase');
        return false;
      }
    });
    return phrase;
  }

  function discoverHardware() {
    var i,
      j,
      shVer,
      lines,
      hwDictionaryXml,
      hwDeviceXml,
      hwDevice = {ifs: []},
    interfaceXml,
      interfaceName,
      interfaceType,
      interfaceList = [],
      mainBoard,
      found = false,
      hwInterfacesXml,
      returnInterfaceMap = {},
      digitsInPlatformType,
      throwError = {
        errorCmd: "",
        errorResponse: ""
      };

    //Get the platformType from shVer. The platformType is on the line with 'Cisco' and 'bytes of memory'
    shVer = getExecCmdOutput("show version");
    lines = shVer.split(/\r\n|\r|\n/);
    for (i = 0; i < lines.length; i = i + 1) {
      if (((lines[i].indexOf('Cisco') !== -1) || (lines[i].indexOf('cisco') !== -1)) && (lines[i].indexOf('bytes of memory') !== -1)) {
        platformType = lines[i].replace(/^Cisco\s(.\S+)\b.*/, '$1');
        platformType = platformType.replace(/^cisco\s(.\S+)\b.*/, '$1');
        break;
      }
    }

    //Get the hardware dictionary
    hwDictionaryXml = getResource("../js/HWDictionary.xml");
    $(hwDictionaryXml).find('device').each(function() {
      if ($(this).attr('name') === platformType) {
        found = true;
        hwDeviceXml = $(this);
        deviceType = $(this).attr('DeviceType');
        //To break from the each loop.
        return false;
      }
    });

    if (found === false) {
        $(hwDictionaryXml).find('device').each(function () {
        var deviceFromDictionary = $(this).attr('name');
                var startReg = new RegExp('^' + deviceFromDictionary, 'i');
                if (startReg.test(platformType)) {
                found = true;
                hwDeviceXml = $(this);
                deviceType = $(this).attr('DeviceType');
                return false;
        }
        });
    }
    if (found === false) {
      //Go for the nearest match device in the family. Following CCP's footstpes, we would look for another device
      //entry that matches at least 3 numeric characters in the platformType
      digitsInPlatformType = platformType.replace(/\D*(\d{3}?).*/, '$1');
      $(hwDictionaryXml).find('device').each(function() {
        if (($(this).attr('name').indexOf(digitsInPlatformType)) !== -1) {
          found = true;
          hwDeviceXml = $(this);
          //To break from the each loop.
          return false;
        }
      });
      if (found === false) {
        interfaceXml = getExecCmdOutput("show ip interface brief | format");
        $(interfaceXml).find('entry').each(function() {
          interfaceName = $(this).find('Interface').text();
          returnInterfaceMap[interfaceName] = -1;
        });
        return returnInterfaceMap;
      }
    }

    //Found device entry in hwdictionary.xml
    mainBoard = hwDeviceXml.attr('Mainboard');
    if (mainBoard) {
      found = false;
      //Since a mainboard entry was found look for a network module with the same partnumber
      $(hwDictionaryXml).find('networkmodule').each(function() {
        if ($(this).attr('partno') === mainBoard) {
          found = true;
          hwDeviceXml = $(this);
          return false;
        }
      });

      if (found === false) {
        interfaceXml = getExecCmdOutput("show ip interface brief | format");
        $(interfaceXml).find('entry').each(function() {
          interfaceName = $(this).find('Interface').text();
          returnInterfaceMap[interfaceName] = -1;
        });
        return returnInterfaceMap;
      }

      //Eureka!! found the network module too.
      $(hwDeviceXml).find('ifs').each(function() {
        interfaceType = $(this).attr('type');
        hwDevice.ifs.push(interfaceType);
        hwDevice[interfaceType] = $(this).attr('count');
      });
    } else {
      //Handle case where the details are directly under the device
      $(hwDeviceXml).find('ifs').each(function() {
        interfaceType = $(this).attr('type');
        hwDevice.ifs.push(interfaceType);
        hwDevice[interfaceType] = $(this).attr('count');
      });
    }


    interfaceXml = getExecCmdOutput("show ip interface brief | format");
    $(interfaceXml).find('entry').each(function() {
      interfaceName = $(this).find('Interface').text();
      //Ignore subinterfaces. HWDictionary cannot count subinterfaces.
      if (interfaceName.indexOf('.') === -1) {
        interfaceList.push(interfaceName);
      }
      returnInterfaceMap[interfaceName] = -1;
    });

    // An hwDevice looks like this
    // hwDevice = {
    //               ifs : [5, 4, 1],
    //               5 : 8,
    //               4 : 4,
    //               1 : 1
    //            }
    // This represents the hwDictionary.xml entry for a device stating that it supports
    // 3 kinds of  interfaces(type 5, 4 and 1) with the corresponding count for each type
    hwInterfacesXml = $(hwDictionaryXml).find('interface');
    for (i = 0; i < interfaceList.length; i = i + 1) {
      for (j = 0; j < hwDevice.ifs.length; j = j + 1) {
        if (((getPhraseForInterfaceType(hwDevice.ifs[j], hwInterfacesXml)) == (getIfType(interfaceList[i]))) && (hwDevice[hwDevice.ifs[j]] > 0)) {
          returnInterfaceMap[interfaceList[i]] = parseInt(hwDevice.ifs[j], 10);
          hwDevice[hwDevice.ifs[j]] = hwDevice[hwDevice.ifs[j]] - 1;
          break;
        } else {
          returnInterfaceMap[interfaceList[i]] = -1;
        }
      }
    }
    //finally return an associative array of the following structure
    return returnInterfaceMap;
  }

  /*
   * Obtain the interface type from the show command output instead of the HWDictionary entries
   * rtv's note : hardcoding return types that must match with HWDictionary entries is bad.
   * However adding a new js just to keep a string mapping is worse for they will not change in a lifetime.
   * This method is copied from /vob/counterpoint/cp/engine/ext/hdm/router/discovery/src/java/com/cisco/cp/engine/router/base/InterfaceUtil.java
   * findInterfaceType method that is invoked during the any device discovery flow
   */
  function getInterfaceTypeUsingShOutput(majorInterfaceName) {
    if (majorInterfaceName === "") {
      return;
    }
    try {
      var phrase = getIfType(majorInterfaceName),
        response;
      if (phrase.indexOf("GigabitEthernet") !== -1) {
        try {
          response = getExecCmdOutput("service-module " + majorInterfaceName + " session ?");
        } catch (error) {
          try {
            response = getExecCmdOutput("show interfaces " + majorInterfaceName + " switchport");
            if (response.indexOf("not a switchable port") !== -1) {
              return 4;
            } else {
              return 6;
            }
          } catch (error) {
            return 4;
          }
        }
        return 8;
      }
      else if (phrase.indexOf("FastEthernet") !== -1) {
        try {
          response = getExecCmdOutput("show interfaces " + majorInterfaceName + " switchport");
          if (response.indexOf("not a switchable port") !== -1) {
            return 1;
          } else {
            return 5;
          }
        } catch (error) {
          return 1;
        }
      }
      else if (phrase.indexOf("Ethernet") !== -1) {
        try {
          response = getExecCmdOutput("show interfaces " + majorInterfaceName);
          if (response.indexOf("VDSL") != -1) {
            return 539;
          } else {
            return 2;
          }
        } catch (error) {
          return 2;
        }
      }
      else if (phrase.indexOf("Serial") !== -1) {
        try {
          response = getExecCmdOutput("show interfaces " + majorInterfaceName + " | include Hardware");
        } catch (error) {
          return -1;
        }
        if (response.indexOf("T1 CSU/DSU") !== -1) {
          return 502;
        } else if (response.trim().toLowerCase().match(/serial$/)) {
          return 501;
        } else {
          return -1;
        }
      }
      else if (phrase.toLowerCase().indexOf("atm") !== -1) {
        return 538;
      }
      else {
        return -1;
      }
    } catch (ex) {
      return -1; // In case of enduser view login, above commands will not have permissions to execute
    }
  }
  /*
   * Method to obtain the type of an interface as specified in the HWDictionary.xml
   * given an interfacename
   */
  function getInterfaceType(interfaceName, discoverDeviceAgain) {
    var subIntIndex,
      majorInterfaceName,
      throwError = {
        errorCmd: "",
        errorResponse: ""
      };
    if (interfaceName === undefined) {
      throwError.errorResponse = "Specify non-empty interface name";
      throw throwError;
    }
    if (discoverDeviceAgain === true) {
      interfaceTypeMap = discoverHardware();
    }
    majorInterfaceName = interfaceName;
    //If the interface is a subinterface strip the text after the .
    subIntIndex = interfaceName.indexOf('.');
    if (subIntIndex !== -1) {
      majorInterfaceName = interfaceName.substring(0, subIntIndex);
    }
    if (interfaceTypeMap[majorInterfaceName] !== -1) {
      return interfaceTypeMap[majorInterfaceName];
    }
    interfaceTypeMap[interfaceName] = getInterfaceTypeUsingShOutput(majorInterfaceName);
    return interfaceTypeMap[interfaceName];
  }
  function getPlatformTypeFromShowVersionOutput(showVersionOutput) {
    if (platformType === "unknown") {
      var lines = showVersionOutput.split(/\r\n|\r|\n/);
      for (i = 0; i < lines.length; i = i + 1) {
        if (((lines[i].indexOf('Cisco') !== -1) || (lines[i].indexOf('cisco') !== -1)) && (lines[i].indexOf('bytes of memory') !== -1)) {
          platformType = lines[i].replace(/^Cisco\s(.\S+)\b.*/, '$1');
          platformType = platformType.replace(/^cisco\s(.\S+)\b.*/, '$1');
          break;
        }
      }
    }
    return platformType;
  }
  function getPlatformType() {
    if (platformType === "unknown") {
      var lines = getExecCmdOutput("show version").split(/\r\n|\r|\n/);
      for (i = 0; i < lines.length; i = i + 1) {
        if (((lines[i].indexOf('Cisco') !== -1) || (lines[i].indexOf('cisco') !== -1)) && (lines[i].indexOf('bytes of memory') !== -1)) {
          platformType = lines[i].replace(/^Cisco\s(.\S+)\b.*/, '$1');
          platformType = platformType.replace(/^cisco\s(.\S+)\b.*/, '$1');
          break;
        }
      }

    }
    return platformType;
  }

  //return a location of the form flash:/ccpexpressng
  function getInstallDir() {
    if (ccpExpressInstallDir.indexOf('archive') == -1) {
      return ccpExpressInstallDir;
    }
    else {
      return ccpExpressInstallDir.replace(/archive\/(.*)/, '$1');
    }

  }
  function discoverFRUSlotMap() {
    var i,
      j,
      blocks,
      lines,
      slotPosition,
      slotFRUMap = [];

    //Split on the FRU number and read the previos block for slot numbers.
    //the slot position starts with 0/
    blocks = getExecCmdOutput("show diag").split(/Product\s\(FRU\)\sNumber/);
    i = 0;
    while (i < blocks.length) {
      lines = blocks[i].split(/\r\n|\r|\n/);
      for (j = 0; j < lines.length; j = j + 1) {
        if (lines[j].indexOf('Slot') !== -1) {

          if (lines[j].indexOf('Slot') == 0)
          {
            slotPosition = lines[j].replace(/.*(\d+)\:/, '$1') + "/0";
          }
          else
          {
            //Creating keys for Cellular interface in array
            var headSlot = slotPosition.split("/");
            slotPosition = headSlot[0] + "/";
            slotPosition = slotPosition + (lines[j].replace(/.*(\d+)\:/, '$1'));
          }
          slotPosition = slotPosition + "/0";
        }
      }
      if (i < (blocks.length - 1)) {
        slotFRUMap[slotPosition] = blocks[i + 1].slice(blocks[i + 1].indexOf(':') + 1, blocks[i + 1].search('\r\n|\r|\n'));
      }
      i = i + 1;
    }
    return slotFRUMap;
  }
  function getProductFRUNumberOfSlot(slotPosition, discoverDeviceAgain) {
    var slotFRUMap = "", headSlot;
    if (slotPosition.indexOf("/") == -1)
    {
      slotPosition = "0/" + slotPosition + "/0";
    }
    else
    {
      // Only reading first two digits of cellular interface ,as third digit is for different profiles
      headSlot = slotPosition.split("/");
      slotPosition = headSlot[0] + "/" + headSlot[1] + "/0";
    }
    if (discoverDeviceAgain === true) {
      slotFRUMap = discoverFRUSlotMap();
    }
    return slotFRUMap[slotPosition];
  }
  function doWriteMemory() {
    try {
      getExecCmdOutput("write memory");
    } catch (error) {
    }
  }
  function getDeviceType() {
    return deviceType;
  }
  return {
    getPlatformType: getPlatformType,
    getInterfaceType: getInterfaceType,
    getExecCmdOutput: getExecCmdOutput,
    getConfigCmdOutput: getConfigCmdOutput,
    getInstallDir: getInstallDir,
    configureFeature: configureFeature,
    configureCommandsFromTemplate: configureCommandsFromTemplate,
    configureCommandsFromTemplate2: configureCommandsFromTemplate2,
    configureCommandsFrom_Template: configureCommandsFrom_Template,
    configureCommandsFrom_Template2: configureCommandsFrom_Template2,
    readFromTemplate: readFromTemplate,
    getProductFRUNumberOfSlot: getProductFRUNumberOfSlot,
    doWriteMemory: doWriteMemory,
    getCommandsForCache: getCommandsForCache,
    getDeviceType: getDeviceType,
    clubShowCmdsExecuteAndSplitOutput:clubShowCmdsExecuteAndSplitOutput,
    getPlatformTypeFromShowVersionOutput: getPlatformTypeFromShowVersionOutput
  };
}());
