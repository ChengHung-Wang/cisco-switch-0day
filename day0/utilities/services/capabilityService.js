/**
 Description: Capability service providing capabilities.
 June 2014
 Copyright (c) 2014,2015,2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.service('capabilityService', function() {

	/*_capabilityMap is the object which contains the final Capability content.
	*to fetch capability data call the method capabilityService.getCapability() only!
	*/
	var _capabilityMap = {};
	var _getCapabilityMap=function () {
		var GET_COMMON_CAPABILITY = "common/capability/capability.json";
		var GET_DEVICE_CAPABILITY = "/webui/rest/getDeviceCapability";
		var staticCapability={};

		var request = new XMLHttpRequest();
		request.open('GET', GET_COMMON_CAPABILITY, false);
		//synchronous request as UI shdnt proceed
		request.send(null);

		if (request.status === 200) {
			staticCapability = JSON.parse(request.responseText);
		}

		var requestForDynamicCapability = new XMLHttpRequest();
		requestForDynamicCapability.open('GET', GET_DEVICE_CAPABILITY, false);
		requestForDynamicCapability.send(null);

		if (requestForDynamicCapability.status === 200) {
			var dynamicCapabilities=JSON.parse(requestForDynamicCapability.responseText);
			//this check is whether the staticCapability object is filled or not. For routing only DynamicCapability used and static capability is not required.
			if(_.isEmpty(staticCapability)){
				var finalDeviceCapabilities={};
				finalDeviceCapabilities.platformType=dynamicCapabilities.PlatformType;
				finalDeviceCapabilities.deviceDescription=dynamicCapabilities.DeviceDescription;
				angular.extend(_capabilityMap,finalDeviceCapabilities);
			}
			else {
				var commonCapabilities = staticCapability.capabilities;
				var finalDeviceCapabilities1 = {};
				var deviceCapabilities = {};
				var platformTypeFromDevice = dynamicCapabilities.PlatformType;
				/*The following code is for device level overrides.
				 **capability.json has (commonCapabilities + device specific data which cannot be obtained from device).
				 **the device specific data is hardcoded as "5760":{"isSwitchingSupported":"false","isMobilityAgent":"false"} along with the capabilities.
				 ** This device specific data is overriden and final capability data is captured.
				 */
				if (_.contains(Object.keys(staticCapability), platformTypeFromDevice)) {
					deviceCapabilities = staticCapability[platformTypeFromDevice];
					finalDeviceCapabilities1 = deviceCapabilities;
					var keysOfCommonCapabilities = Object.keys(commonCapabilities);
					var keysOfDeviceCapabilities = Object.keys(deviceCapabilities);
					var differenceArray = {};
					differenceArray = _.difference(keysOfCommonCapabilities, keysOfDeviceCapabilities);
					for (var index = 0; index < differenceArray.length; index++) {
						finalDeviceCapabilities1[differenceArray[index]] = commonCapabilities[differenceArray[index]];
					}
					//append the data obtained from device say platformType and device description to the finalDeviceCapabilities1.
					finalDeviceCapabilities1.platformType = platformTypeFromDevice;
					finalDeviceCapabilities1.deviceDescription = dynamicCapabilities.DeviceDescription;
					angular.extend(_capabilityMap, finalDeviceCapabilities1);
				}//if hardcoded device specific data is not present append the data obtained from device.
				else {
					staticCapability.capabilities.platformType = dynamicCapabilities.PlatformType;
					staticCapability.capabilities.deviceDescription = dynamicCapabilities.DeviceDescription;
					angular.extend(_capabilityMap, staticCapability.capabilities);
				}
			}
		}
	};
	var capabilityServiceMethods = {
		getCapability:function(){
			/*First time when the capabilityService.getCapability() is called it checks whether _capabilityMap is empty and fills the object
			* subsequent calls to getCapability() will just return the data.
			*/
			if(_.isEmpty(_capabilityMap)){
				_getCapabilityMap();
				return _capabilityMap;
			}
			else{
				return _capabilityMap;
			}
		}
	};
	return capabilityServiceMethods;
});