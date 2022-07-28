/**
 * Contains all the common services.
 * This has 'validationService', "dialogService", 'onlineHelpService', 'httpEndPointService'
 * gridCrudService services
 */

/**
 Description: Validation service containing all validation API.
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.service('validationService', function($rootScope, $location) {

	this.validators = [];
	this.TDL_MESSAGE = "TDL_MESSAGE";
	this.WSMA_MESSAGE = "WSMA_MESSAGE";

	/**
	 * Validates a given IPV4 Address
	 * @param ipv4Address
	 * @returns {boolean}
	 */
	this.validateIpAddress = function(ipv4Address) {
		//Write the validation code here
		// return true or false boolean based on validation
		var testString;

		if ( typeof ipv4Address == 'string') {
			testString = ipv4Address;
		} else {
			testString = ipv4Address.val();
		}
		// Commented out the old regx
		if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(testString) || testString == '') {
			return true;
		};
		return false;
	};

	/**
	 * Validates a given IPV6 Address
	 * @param ipv6Address
	 * @returns {boolean}
	 */
	this.validateIpv6Address = function(ipv6Address) {
		//Write the validation code here
		// return true or false boolean based on validation
		var testString;

		if ( typeof ipv6Address == 'string') {
			testString = ipv6Address;
		} else {
			testString = ipv6Address.val();
		}

		if (new RegExp("^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$").test(testString)) {

			return true;
		};

		return false;
	};

	/**
	 * Validates if given value is not a reserved IpAddress
	 * @param ipv4Address
	 * @returns {boolean}
	 */
	this.validateReservedIpAddress = function(ipv4Address) {
		var testString;

		if ( typeof ipv4Address == 'string') {
			testString = ipv4Address;
		} else {
			testString = ipv4Address.val();
		}
		if (testString == '') {
			return true;
		}
		if (testString == "0.0.0.0" || testString == "255.255.255.255") {
			return false;
		}
		return true;
	};

	/**
	 * Validates a given Multicast IP Address
	 * @param multicastAddress
	 * @returns {boolean}
	 */
	this.validateMulticastIpAddress = function(multicastAddress) {
		//Write the validation code here
		// return true or false boolean based on validation
		var testString;

		if ( typeof multicastAddress == 'string') {
			testString = multicastAddress;
		} else {
			testString = multicastAddress.val();
		}
		if (/^(2[23][4-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(testString) || testString == '') {
			return true;
		};
		return false;
	};

	/**
	 * Validates if given value is not a localhost IpAddress
	 * @param ipv4Address
	 * @returns {boolean}
	 */
	this.validateLocalHost = function(ipv4Address) {
		var testString;

		if ( typeof ipv4Address == 'string') {
			testString = ipv4Address;
		} else {
			testString = ipv4Address.val();
		}
		if (testString == "127.0.0.0") {
			return false;
		}
		return true;
	};

	/**
	 * Validates a given Subnet Mask
	 * @param value
	 * @returns {boolean}
	 */
	this.validateSubnetMask = function(value) {
		if (_.isUndefined(value)) {
			return false;
		} else {
			var subnetRegex = "^((128|192|224|240|248|252|254)\.0\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0\.0)|(255\.(((0|128|192|224|240|248|252|254)\.0)|255\.(0|128|192|224|240|248|252|254)))))$";
			if (new RegExp(subnetRegex).test(value)) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Validates a given ACL Subnet Mask
	 * @param value
	 * @returns {boolean}
	 */
	this.validateAclSubnetMask = function(value) {
		if (_.isUndefined(value)) {
			return false;
		} else {
			var octets = value.split(".");
			if (!_.isUndefined(octets) && octets.length != 4) {
				return false
			} else {
				for (var index = 0; index < octets.length; index++) {
					if (_.isNumber(Number(octets[index])) == false) {
						return false;
					}
					if (!(Number(octets[index]) == 0 || Number(octets[index]) == 1 || Number(octets[index]) == 3 || Number(octets[index]) == 7 || Number(octets[index]) == 15 || Number(octets[index]) == 31 || Number(octets[index]) == 63 || Number(octets[index]) == 127 || Number(octets[index]) == 255)) {
						return false;
					}
				}
			}
		}
		return true;
	};

	/**
	 * Validates Special Characters like ? or space
	 * @param value
	 * @returns {boolean}
	 */
	this.validateSpecialCharacters = function(value) {
		if (_.contains(value, " ") || _.contains(value, "?")) {
			return false;
		}
		return true;
	};

	/**
	 * Check if there are invalid characters in a file path.
	 * The set of invalid characters are \ * ? < > | and space.
	 * @param value
	 * @returns {boolean}
	 */
	this.validateFilePath = function(value) {
		return ((!/[ *|<>\?]/g.test(value)) && !_.contains(value, "\\"));
	};

	/**
	 * Validates Characters like ?
	 * @param value
	 * @returns {boolean}
	 */
	this.validateQuestionMarkCharacters = function(value) {
		if (_.contains(value, "?")) {
			return false;
		}
		return true;
	};

	/**
	 * Validates if a given value has minimum characters allowed
	 * @param value
	 * @param minValue
	 * @returns {boolean}
	 */
	this.validateMinimumLength = function(value, minValue, exact) {
		if (exact) {
			return value.length >= Number(minValue);
		}
		return value.length > Number(minValue);
	};

	/**
	 * Validates if a given value is not exceeding maximum characters allowed
	 * @param value
	 * @param maxValue
	 * @returns {boolean}
	 */
	this.validateMaximumLength = function(value, maxValue, exact) {
		if (exact) {
			return value.length <= Number(maxValue);
		}
		return value.length < Number(maxValue);
	};

	/**
	 * Validates if given value is within a range string
	 * @param value
	 * @param rangeString - Given with minrange-maxrange format (Eg: 65-798)
	 * @returns {boolean}
	 */
	this.validateNumericRange = function(value, rangeString, delimiter) {
		if (delimiter == undefined) {
			delimiter = "-";
		}
		var validRange = rangeString.split(delimiter);
		//Check if all are numbers, else return false
		if ((isNaN(Number(value)) || isNaN(Number(validRange[0])) || isNaN(Number(validRange[1])))){
			return false;
		}
		//Check the range
		if (Number(value) < Number(validRange[0]) || Number(value) > Number(validRange[1])) {
			return false;
		}
		return true;
	};
	/**
	 * Validates a given VLAN
	 * @param value
	 * @returns {boolean}
	 */
	this.validateVlan = function(value) {
		var ranges = value.split(",");
		for ( i = 0; i < ranges.length; i++) {
			var vlanValues = ranges[i].split("-");
			if (vlanValues.length > 1) {

				var low = Number(vlanValues[0]);
				var high = Number(vlanValues[1]);

				//Check that both are integers
				if (isNaN(low) || isNaN(high) || parseInt(low, 10) != low || parseInt(high, 10) != high) {
					return false;
				}

				if (low >= high || low < 1 || high > 4094) {
					return false;
				}
			} else {
				var vlan = Number(vlanValues[0]);

				// Check if vlan is not an integer
				if (isNaN(vlan) || parseInt(vlan, 10) != vlan) {
					return false;
				}

				// Check if the vlan integer is a valid vlan
				if (vlan < 1 || vlan > 4094) {
					return false
				}
			}
		}

		// Return true if you don't see any validation anomaly
		return true;
	};

	/**
	 * Validates if given value is not a reserved VLAN
	 * @param value
	 * @returns {boolean}
	 */
	this.validateReservedVlan = function(value, reservedVlanList) {

		if (_.isUndefined(reservedVlanList)) {
			reservedVlanList = [1, 1002, 1003, 1004, 1005];
		}

		var ranges = value.split(",");
		for ( i = 0; i < ranges.length; i++) {

			var vlanValues = ranges[i].split("-");

			var vlanRange = [];
			/**
			 * if entered value is not the range then we have to push the entered value
			 * in the array.
			 */
			_.isUndefined(vlanValues[1]) ? vlanRange.push(Number(vlanValues[0])) : ( vlanRange = _.range(Number(vlanValues[0]), Number(vlanValues[1]) + 1))

			/**
			 * checking if the entered vlan falls under the default reserved
			 * vlans in the device.
			 */
			if (!_.isEmpty(_.intersection(vlanRange, reservedVlanList))) {
				return false;
			};
		}
		return true;
	};

	/**
	 * Validates if given value is within a range string
	 * @param value
	 * @param rangeString - Given with minrange-maxrange format (Eg: 65-798)
	 * @returns {boolean}
	 */
	this.validateNumericRangewithZero = function(value, rangeString, delimiter) {
		if (delimiter == undefined) {
			delimiter = "-";
		}
		var validRange = rangeString.split(delimiter);
		//Check if all are numbers, else return false
		if ((isNaN(Number(value)) || isNaN(Number(validRange[0])) || isNaN(Number(validRange[1])))){
			return false;
		}
		//Check the range
		if (Number(value) < Number(validRange[0]) || Number(value) > Number(validRange[1])) {
			return false;
		}
		if (value == ""){
			return false;
		}

		return true;
	};
	/**
	 * Validation to be used if the data expected from a textbox, refers to a vlan not a range.
	 * @param value
	 * @returns {boolean}
	 */
	this.validateSingleVlan = function(value) {
		return !isNaN(Number(value));
	};

	/**
	 * Validates if given name is a valid domain name
	 * @param value
	 * @returns {boolean}
	 */
	this.validateDomainName = function(value) {
		if (_.indexOf(value, '.') < 0){
			return false;
		}
		return true;
	};

	/**
	 * Validates if given port is a HTTP allowed port
	 * @param value
	 * @returns {boolean}
	 */
	this.validateHTTPPort = function(value) {
		if (value == 80) {
			return true;
		} else {
			return value <= 80 && value >= 1025;
		}
	};

	/**
	 * Validates if a given port is HTTPS allowed port
	 * @param value
	 * @returns {boolean}
	 */
	this.validateHTTPSPort = function(value) {
		if (value == 443) {
			return true;
		} else {
			return value <= 443 && value >= 1025;
		}

	};

	/**
	 * Given any value and a regular expression string, tests the expression against the value
	 * @param value
	 * @param regString - A regular expression String
	 * @returns {*|boolean}
	 */
	this.validateByRegularExpression = function(value, regString) {
		return regString.test(value);
	};

	/**
	 * Given a value, max char and min char allowed, tests if the value is within the range
	 * @param value
	 * @param maxCharacters
	 * @param minCharacters
	 * @param exactFlag - This flag is used to indicate if range matching needs to be exact or not
	 * @returns {boolean}
	 */
	this.validateLength = function(value, maxCharacters, minCharacters, exactFlag) {
		if (exactFlag) {
			if (value.length <= maxCharacters && value.length >= minCharacters) {
				return true;
			}
		} else {
			if (value.length < maxCharacters && value.length > minCharacters) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Validates exact numeric range
	 * @param value
	 * @param range
	 * @returns {boolean}
	 */
	this.validateExactRange = function(value, range) {
		var validRange = range.split("-");
		//Check if all are numbers, else return false
		if (value == ''){
			return true;
		}
		if (isNaN(value)){
			return false;
		}

		if (isNaN(value) && isNaN(validRange[0]) && isNaN(validRange[1])){
			return false;
		}
		//Check the range
		return !(Number(value) < Number(validRange[0]) || Number(value) >= Number(validRange[1]));
	};

	/**
	 * Validates duplicate value
	 * @param data
	 * @param compareValue
	 * @param  compareParamName
	 * @returns {boolean}
	 */
	this.isDuplicateObject = function(data, compareValue, compareParamName) {
		var duplicateValue = true;
		_.find(data, function(data) {
			if (data[compareParamName] === compareValue) {
				duplicateValue = false;
			}
		});
		return duplicateValue;
	};

	/**
	 * This function can be used to validate if the sum of a certain number of arguments exceeds a Max Sum.
	 * This function is a variable argument function, and the argument format should be the maxSum value,
	 * followed by the set of values on whom you want to run this validation.
	 * All the arguments are expected to be Integers (or strings that represent integers).
	 */
	this.validateSum = function() {

		// Validation needs atleast two arguments, maxSum and atleast 1 input value
		if (arguments.length < 2) {
			return false;
		}
		var maxSum = Number(arguments[0]);
		if (isNaN(maxSum)) {
			return false;
		}

		var curSum = 0,
		    curValue = 0;
		for (var i = 1; i < arguments.length; i++) {
			curValue = Number(arguments[i]);
			if (isNaN(curValue)) {
				return false;
			}
			curSum += curValue;
		}

		return curSum <= maxSum;
	};

	/**
	 * Validates if given value is a number or not
	 * @param value
	 * @returns {boolean}
	 */
	this.validateNumber = function(value) {
		if (_.isNaN(new Number(value))) {
			return false;
		}
		return true;
	};

	/**
	 *Validates a given hostname
	 * @param hostname
	 * @returns {boolean}
	 *                     */
	this.validateHostname = function(hostname) {
		//Write the validation code here
		// return true or false boolean based on validation
		var testString;

		if ( typeof hostname == 'string') {
			testString = hostname;
		} else {
			testString = hostname.val();
		}
		//Hostname RFC 1123
		if (new RegExp("^\s*((?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?)*\.?)\s*$").test(testString)) {

			return true;
		};

		return false;
	};

	/**
	 * Validates if given value is a multicat IP or not
	 * @param value
	 * @returns {boolean}
	 */
	this.multicastvalidation = function(ip) {
		var value;

		if ( typeof ip == 'string') {
			value = ip;
		} else {
			value = ip.val();
		}
		var pattern = new RegExp("(^(22[4-9]|23[0-9]))(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}$");
		return pattern.test(value);
	};

	// Write further methods here.
	this.addValidator = function(validator, stepNumber) {
		this.validators[stepNumber - 1] = validator;
	};

	this.getValidator = function(stepNumber) {
		return this.validators[stepNumber];
	};

	/**
	 * Validates ip and mask combination.
	 * The ip should not be same as network ip or the broadcast ip of the subnet created by the ip-mask combination.
	 * @param ip
	 * @param mask
	 * @returns {boolean}
	 */
	this.validateIpWithSubnetMask = function(ip, mask) {
		ip = ip.split(".");
		ip = [Number(ip[0]), Number(ip[1]), Number(ip[2]), Number(ip[3])];

		mask = mask.split(".");
		mask = [Number(mask[0]), Number(mask[1]), Number(mask[2]), Number(mask[3])];

		var networkIp = [];
		var broadcastIp = [];

		//Calculate Network IP and Broadcast IP
		for (var index = 0; index < 4; index++) {
			networkIp[index] = ip[index] & mask[index];
			broadcastIp[index] = networkIp[index] + 255 - mask[index];
		}

		ip = ip.join();
		networkIp = networkIp.join();
		broadcastIp = broadcastIp.join();
		if (ip === networkIp || ip === broadcastIp) {
			return false;
		} else {
			return true;
		}
	};

	/**
	 * Validates a given Hexadecimal
	 * @param hexadecimal
	 * @returns {boolean}
	 */
	this.validateHexaDecimalChars = function(hexadecimal) {
		//Write the validation code here
		// return true or false boolean based on validation
		var testString;

		if ( typeof hexadecimal == 'string') {
			testString = hexadecimal;
		} else {
			testString = hexadecimal.val();
		}

		if (/^[0-9a-f]+$/i.test(testString) || testString == '') {
			return true;
		};
		return false;
	};

	/**
	 * Validation for not allowing special characters like <> &
	 * which makes the nginx to treat the value as XMLTAG
	 */
	this.validateInvalidTags = function(inputValues) {
		var val = inputValues;
		if (_.contains(val, "?") || _.contains(val, "<") || _.contains(val, ">") || _.contains(val, "&")) {
			return false;
		}
		return true;
	};

	/**
	 * This method returns   MAC Address in proper format
	 */

	this.getMACAddress = function(macArray) {
		var macArrayList = [];
		if (macArray.get_length() === 6) {
			for (var i = 0; i < 6; i++) {
				macArrayList.push(("0" + (macArray.get_value(i).get_value().toString(16))).slice(-2));
			}
		}
		return macArrayList
	};

	/**
	 * This method returns time from Hexa to Loca Time
	 */

	this.hexDateConvert = function(value) {
		var dt = new Date();
		dt.setTime(parseInt(value, 16) * 1000);
		dateValue = dt.toLocaleString();
		return dateValue;
	};

	this.rmBtnDisableIE10 = function(inputButtonID, inputScopeValue) {

		if (inputButtonID != "") {
			$(inputButtonID).addClass('k-state-disabled');
			if (inputScopeValue == false) {
				$(inputButtonID).removeClass('k-state-disabled');
			}
		}

	};

	/**
	 * Validates a given Email Address
	 * @param emailtext
	 * @returns {boolean}
	 */
	this.validateEmailAddress = function(emailAddress) {
		//Write the validation code here
		// return true or false boolean based on validation
		var testString;

		if ( typeof emailAddress == 'string') {
			testString = emailAddress;
		} else {
			return false;
		}

		if (new RegExp(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i).test(testString)) {
			return true;
		};

		if (emailAddress == ""){
			return true;
		}

		return false;
	};
	/**
	 * Validates a given Phone Number
	 * @param emailtext
	 * @returns {boolean}
	 */
	this.validatePhoneNumber = function(phoneNumber) {
		//Write the validation code here
		// return true or false boolean based on validation
		var testString;

		if ( typeof phoneNumber == 'string') {
			testString = phoneNumber;
		} else {
			return false;
		}
		if (phoneNumber == ""){
			return true;
		}

		if (phoneNumber.length < 12 || phoneNumber.length > 17){
			return false;
		}

		if (new RegExp(/^[0-9+ ]*$/).test(testString)) {
			return true;
		};

		return false;
	};

	/**
	 * Validates a given URL
	 * @param emailtext
	 * @returns {boolean}
	 */
	this.validateHttpUrl = function(url) {
		//Write the validation code here
		// return true or false boolean based on validation
		var testString;

		if ( typeof url == 'string') {
			testString = url;
		} else {
			return false;
		}

		if (new RegExp(/^(http|https):\/\/[^ "]+$/).test(testString)) {
			return true;
		};

		if (url == ""){
			return true;
		}

		return false;
	};
	var urlToFeatureNameMap = {
		"/dayzero" : "DayZero",
		"/physicalInterface" : "Physical Interface",
		"/logicalInterface" : "Logical Interface",
		"/wlan" : "WLAN",
		"/wlanDashlet" : "WLAN Dashlet",
		"/dashboard" : "Dashboard",
		"/mobility" : "Wireless Mobility",
		"/ntp" : "NTP",
		"/http" : "HTTP(S)",
		"/dhcp" : "DHCP",
		"/stp" : "STP",
		"/userAdministration" : "User Administration",
		"/portUtilization" : "Port Utilization",
		"/snmp" : "SNMP",
		"/mdns" : "mDNS",
		"/multicast" : "Multicast",
		"/coredump" : "Coredump",
		"/rrm5g" : "RRM",
		"/rrm24g" : "RRM",
		"/interferers" : "Clean Air Statistics",
		"/clientControl" : "Clients",
		"/accessPoints" : "AP Statistics",
		"/qos" : "QOS",
		"/webAuth" : "Web Auth",
		"/localEAP" : "Local EAP",
		"/monitoringSecurity" : "Security",
		"/mobilityMonitoring" : "Mobility Monitoring",
		"/mDNSMonitoring" : "mDNS Monitoring",
		"/localProfiling" : "Local Profiling",
		"/commands" : "Commands",
		"/softwareActivation" : "Software Activation",
		"/rogues" : "Rogues",
		"/fqdn" : "FQDN",
		"/managementUtilization" : "Management Utilization",
		"/aaa" : "AAA",
		"/system" : "System",
		"/redundancy" : "Redundancy",
		"/cdp" : "CDP",
		"/avc" : "AVC",
		"/ports" : "Ports",
		"/statistics" : "Statistics",
		"/parameters" : "Parameters",
		"/parameters24g" : "Parameters",
		"/roguePolicies" : "Wireless Protection Policies",
		"/cleanAirConfig5g" : "Clean Air",
		"/cleanAirConfig24g" : "Clean Air",
		"/localPolicies" : "Local Policies",
		"/highT" : "High Throughput",
		"/highT24" : "High Throughput",
		"/network" : "Network",
		"/network24" : "Network",
		"/rrmMediaParams5g" : "Media Parameters",
		"/rrmMediaParams24g" : "Media Parameters",
		"/mediaStream" : "Media Stream",
		"/ap" : "Access Points",
		"/telnet" : "Configure CLI",
		"/acl" : "ACL",
		"/clientDeviceTypes" : "Client Device Types",
		"/clientsAP" : "Clients AP",
		"/cpuUtilization" : "CPU Utilization",
		"/memoryUtilization" : "Memory Utilization",
		"/apcrash" : "Ap Crash",
		"/controllercrash" : "Controller Crash",
		"/logs" : "Logs",
		"/loadBalance" : "Wireless Advanced",
		"/general" : "General",
		"/vlan" : "Vlan",
		"/wirelessInterface" : "Wireless Interface",
		"/rf" : "RF Profiles",
		"/callHome" : "Smart Call Home",
		"/atfMode" : "Airtime Fairness",
		"/atfPolicy" : "Airtime Fairness Policy",
		"/atfStatistics" : "ATF Statistics",
		"/staticRouting" : "Static Routing",
		"/diagnostic" : "Diagnostic Log",
		"/apGroups" : "AP Groups"
	};

	var getTitle = function() {
		var location = $location.url();
		var featureName = urlToFeatureNameMap[location];
		return featureName;
	};

	// Takes the tdl response object as argument, constructs the toasterMessage based on the error message if any and returns the same
	var constructTdlMessage = function(response, title_def) {
		var title1;
		if (title_def === undefined) {
			title1 = getTitle();
		} else {
			title1 = title_def;
		}
		var toasterMessage = {
			"isSuccessful" : true,
			"message" : {
				"title" : "<i class='fa fa-check toasterStatus'></i><h4 class='success'>Configuration Successfully Applied</h4>",
				"message" : title1 + " changes was successfully applied"
			}
		};

		var errorTitle = "<i class='fa fa-times toasterStatus'></i><h4 class='error'>Error in Configuring " + title1 + "</h4>";
		var errorMessage = "";
		_.forEach(response, function(responseItem) {
			if (responseItem.error_message) {
				toasterMessage.isSuccessful = false;
				toasterMessage.message.title = errorTitle;
				errorMessage = errorMessage + "\<div\>" + responseItem.error_message + "\</div\>";
				toasterMessage.message.message = errorMessage;
			}
		});

		return toasterMessage;
	};

	// Takes the wsma response object as argument, constructs the toasterMessage based on the error message if any and returns the same
	var constructWsmaMessage = function(response, title_def) {
		var title2;
		if (title_def === undefined) {
			title2 = getTitle();
		} else {
			title2 = title_def;
		}
		var toasterMessage = {
			"isSuccessful" : true,
			"message" : {
				"title" : "<i class='fa fa-check toasterStatus'></i><h4 class='success'>Configuration Successfully Applied</h4>",
				"message" : title2 + " Data was successfully applied"
			}
		};
		var errorTitle = "<i class='fa fa-times toasterStatus'></i><h4 class='error'>Error in Configuring " + title2 + "</h4>";
		if (response.status == 500) {
			toasterMessage.isSuccessful = false;
			toasterMessage.message.title = errorTitle;
			toasterMessage.message.message = "An Internal error has occured";
		} else {
			var responseData = "";
			if (response.data) {
				responseData = response.data
			} else if (response && response.length > 0) {
				responseData = response;
			}
			var toasterMessage = {
				"isSuccessful" : true,
				"message" : {
					"title" : "<i class='fa fa-check toasterStatus'></i><h4 class='success'>Configuration Successfully Applied</h4>",
					"message" : title2 + " Data was successfully applied"
				}
			};

			var errorMessage = "";
			_.forEach(responseData, function(responseItem) {
				if (responseItem.status && responseItem.status != "success" && responseItem.errorText) {
						toasterMessage.isSuccessful = false;
						toasterMessage.message.title = errorTitle;
						errorMessage = errorMessage + "\<div\>" + responseItem.errorText + "\</div\>";
						toasterMessage.message.message = errorMessage;
				}
			});
		}
		return toasterMessage;
	};

	/**
	 * displays success/error messages through kendo notifications
	 * @param response
	 * @param type - to distinguish between TDL and WSMA response objects
	 */
	this.showToasterMessage = function(response, type, title) {
		var message;
		if (type === this.TDL_MESSAGE) {
			message = constructTdlMessage(response, title);
		} else if (type === this.WSMA_MESSAGE) {
			message = constructWsmaMessage(response, title);
		} else {
			return;
		}
		$rootScope.$broadcast("toaster:configurationSuccessErrorMessage", message);
		return message.isSuccessful;
	};

	/**
	 * displays error validation messages through kendo notifications
	 * @param errorMessage
	 */
	this.showValidationToasterMessage = function(errorMessage) {
		var toasterMessage = {
			"isSuccessful" : false,
			"message" : {
				"title" : "<i class='fa fa-times toasterStatus'></i><h4>Validation Error" + title + "</h4>",
				"message" : ""
			}
		};
		toasterMessage.message.message = errorMessage;
		$rootScope.$broadcast("toaster:configurationSuccessErrorMessage", toasterMessage);
	};

});

/**
 Description: common dialog service used for information, error, confirm.
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
var callbackCall,
    closeDialog;
app.service("dialogService", function($rootScope) {
	this.dialog = function(dialogObj) {
		/*
		 * dialogObj = {
		 * 		width: '500px',
		 * 		modal: true,
		 *		id: "windowFromConfig",
		 * 		onClose: function(){alert('test')},
		 * 		title: 'Confirm',
		 * 		content: 'Testing Testing',
		 * 		messageType: "warning" // info, confirm, warning, error
		 * 		actionButtons:[
		 * 			{text:"OK", callback:"callbackevent"}}
		 * 		]
		 * }
		 */
		var windw = angular.element("<div class='dialog'></div>"),
		    buttons = "",
		    onClose = function() {
			setTimeout(function() {
				windw.data("kendoWindow").destroy();
			}, 500);
		};

		callbackCall = function(callback) {
			if (callback == "undefined") {
				closeDialog();
			} else {
				$rootScope.$broadcast(callback, {
					data : callback
				});
			}
		};

		closeDialog = function() {
			windw.data("kendoWindow").close();
		};
		windw.kendoWindow({
			width : dialogObj.width || "500px",
			modal : dialogObj.modal || true,
			resizable : dialogObj.resizable || false,
			title : dialogObj.title || "Confirm",
			actions : ["Close"],
			close : dialogObj.onClose || onClose
		});
		var content = '<div class="windowContent ' + (dialogObj.messageType || "info") + '">' + (dialogObj.content || '') + '</div>',
		    actionButtonContainer = '<div class="windowButtonContainer ' + (dialogObj.messageType || "info") + '">';
		if (dialogObj.actionButtons) {
			angular.forEach(dialogObj.actionButtons, function(obj, index) {
				if (dialogObj.messageType && dialogObj.messageType.toUpperCase() == "CONFIRM" && index == 1) {
					actionButtonContainer += "<button class='btn btn-primary k-button pull-left" + (obj.btnClass || '') + "' type='button' onclick='callbackCall(\"" + obj.callback + "\")' >" + obj.text + "</button>";
				} else {
					actionButtonContainer += "<button class='btn btn-primary k-button " + (obj.btnClass || '') + "' type='button' onclick='callbackCall(\"" + obj.callback + "\")' >" + obj.text + "</button>";
				}

			});
		}
		actionButtonContainer += "</div>";
		windw.data("kendoWindow").content(content + actionButtonContainer);
		if (dialogObj.id) {
			windw.data("kendoWindow").wrapper.attr("id", dialogObj.id);
		}
		windw.data("kendoWindow").wrapper.addClass("customDialog");
		windw.data("kendoWindow").center().open();
		return windw;
	};
});

/**
 Description: Online Help service for opening help window when user clicks on help icon.
 Copyright (c) 2015-2016 by Cisco Systems, Inc.
 All rights reserved.
 */
var openPage;
app.service('onlineHelpService', ['httpEndPointService', '$rootScope', 'dialogService',
function(httpEndPointService, $rootScope, dialogService) {
	var pageMapping = {};
	httpEndPointService.httpGet('commonutilities/jsons/onlinehelp.json').then(function(data) {
		pageMapping = data.data;
	});

	var openedChild;
	var winFeatures = "width=1000,height=700,location=0,centerscreen=yes,resizable=yes,scrollbars=yes";
	this.openOnlineHelpWindow = function(currentPage) {
		var urlToOpen = "onlinehelp/guide_web/Default.htm";
		if (pageMapping[currentPage]) {
			urlToOpen += "#topics/" + pageMapping[currentPage];
		}
		openedChild = window.open(urlToOpen, 'polarishelpwindow', winFeatures);
	};

	this.setBrowserTitle = function(currentPage, platform, desc) {
		var browTitle = "";
		if (currentPage == "/telnet") {
			browTitle = "Configure CLI";
		} else {
			browTitle = angular.element(".megamenu-menu-title a", angular.element(".submenuTitle.selectedSubmenu").parents(".megamenu-menu")).text() + " - " + angular.element(".submenuTitle.selectedSubmenu a").text();
		}

		// $rootScope.hostName is set in megaMenuCtrl.js file and generalController.js file.
		document.title = $rootScope.hostName + ":: Cisco " + platform + " " + desc + " - " + browTitle;
	};

	var dlg,
	    pageToMove;
	$rootScope.$on("okClicked_goToPage", function() {
		for (key in pageMapping) {
			if (pageToMove.indexOf(pageMapping[key]) >= 0) {
				break;
			}
		};
		if (dlg) {
			location.hash = "#" + key;
			dlg.data("kendoWindow").close();
		}
	});

	openPage = function(pageUrl) {
		pageToMove = pageUrl.substr(pageUrl.lastIndexOf("/") + 1);
		openedChild.close();
		dlg = dialogService.dialog({
			content : 'The changes in the page may be lost. Are you sure you want to move?',
			title : "Logout",
			messageType : "confirm",
			actionButtons : [{
				text : "OK",
				callback : "okClicked_goToPage"
			}, {
				text : "Cancel"
			}]
		});
	};
}]);


/**
 Description: The service provides apis to send exec and config commands to the device.
 Copyright (c) 2015-2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.service('requestRoutingService',function(){

      this.useLocalData = runFromLocalhost;
          this.getShowCmdOutput = function getShowCmdOutput(cliCmd,odmFileName){
      $.ajaxSetup({async: false});
      var usingODM = false;
      if(odmFileName !== null && odmFileName !== undefined){
         usingODM = true;
      }
      if(cliCmd === null || cliCmd == undefined){
         throw "null command exception";
      } else {
          var x2js = new X2JS();
          if(this.useLocalData){
             cliCmd = cliCmd.replace(' ','');
             if(usingODM){
                cliCmd = cliCmd+odmFileName+".xml";
             } else {
                cliCmd = cliCmd+".txt";
             }
             var result = $.get("resources/data/" + cliCmd);
             /* Some trouble.. need to sort out the below code*/
             if(usingODM){
                return x2js.xml_str2json(result.responseText);
             }
             return result;
          }else{
             if(usingODM){
                cliCmd = cliCmd + " | format flash:/webui/odm/" + odmFileName + ".odm";
             }
             var result1 = deviceCommunicator.getExecCmdOutput(cliCmd);
             if(usingODM){
                return x2js.xml_str2json(result1);
             }
             return result1;
          }
      }
   }

    /*Invoke the getConfigCmdOutput api from within a try catch block.
    The api returns an empty string in a success case.
    In case of failure, it will return an object with two parameters:
        errorCmd: the command that caused the error
        errorResponse: the error response message
    Handle the response as appropriate.
  */
   this.getConfigCmdOutput = function(cliCmd){
      $.ajaxSetup({async: false});
      var result = null;
      if(cliCmd === null || cliCmd === undefined){
         throw "null command exception";
      } else {
             try{
                result = deviceCommunicator.getConfigCmdOutput(cliCmd,false);
             }catch(exception){
                result = exception;
             }
      }
      return result;
   }

});


/**
 Description: HTTP service to Get/Send HTTP Calls to endpoints
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.service('httpEndPointService', function($http) {
	return {
		httpGet : function(url, parameters, localDataFileName) {
			if (url === undefined) {
				return;
			}
			if (runFromLocalhost == true && localDataFileName) {
				url = "../../resources/data/" + localDataFileName;
			}

			if (parameters != undefined || parameters != "") {
				angular.element("body").addClass("busy");
				return $http.get(url, {
					params : {
						"parameters" : parameters
					}

				}).success(function(data) {
					angular.element("body").removeClass("busy");
					return angular.fromJson(data);
				}).error(function() {
					angular.element("body").removeClass("busy");
				});
			} else {
				angular.element("body").addClass("busy");
				return $http.get(url).success(function(data) {
					angular.element("body").removeClass("busy");
					return angular.fromJson(data);
				}).error(function() {
					angular.element("body").removeClass("busy");
				});
			}
		},

		httpPost : function(url, postData) {
			if (url === undefined) {
				return;
			}
			angular.element("body").addClass("busy");
			return $http.post(url, angular.toJson(postData)).success(function(data) {
				angular.element("body").removeClass("busy");
				return data;
			}).error(function() {
				angular.element("body").removeClass("busy");
			});
		},

		httpGeneral : function(reqObject) {
			/*
			 reqObject = {
			 method: 'POST or GET',
			 url: 'http://example.com',
			 headers: {
			 'Content-Type': undefined
			 },
			 data: { test: 'test' },
			 cache: false
			 }*/
			return $http(reqObject).success(function(data) {
				angular.element("body").removeClass("busy");
				return data;
			}).error(function() {
				angular.element("body").removeClass("busy");
			});
		}
	};
});

/**
 Description: Kendo grid create service
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.service("gridCrudService", function() {
	this.grid_page_sizes = [10, 20, 50, 100];
	this.createDataSource = function(paramObj) {
		/*
		 * paramObj = {
		 * 	readUrl: readUrl,
		 * 	createUrl: createUrl,
		 * 	updateUrl: updateUrl,
		 * 	deleteUrl: deleteUrl,
		 * 	parameterMapCallback: parameterMapCallback,
		 * 	schemaParams: {model:{}, data:},
		 * 	changeCallback: changeCallback,
		 * 	batch: true || false,
		 * 	pageSize: 10,
		 * 	errorCallback: errorCallback,
		 * createCompleteCallback: createCompleteCallback,
		 * deleteCompleteCallback: deleteCompleteCallback,
		 * editCompleteCallback: editCompleteCallback,
		 * defaultSort: defaultSort
		 * }
		 */
		var transPort = {
			read : {
				url : paramObj.readUrl || "",
				dataType : "json"
			},
			create : {
				url : paramObj.createUrl || "",
				type : "POST",
				dataType : "json"
			},
			update : {
				url : paramObj.updateUrl || "",
				type : "POST",
				dataType : "json"
			},
			destroy : {
				url : paramObj.deleteUrl || "",
				type : "POST",
				dataType : "json"
			},
			parameterMap : function(options, operation) {
				if (paramObj.parameterMapCallback && typeof paramObj.parameterMapCallback == "function") {
					return paramObj.parameterMapCallback(options, operation);
				} else {
					if (operation !== "read" && options.models) {
						return {
							data : kendo.stringify(options.models)
						};
					}
				}
			}
		};
		if (paramObj.createCompleteCallback) {
			transPort.create.complete = paramObj.createCompleteCallback;
		}
		if (paramObj.deleteCompleteCallback) {
			transPort.destroy.complete = paramObj.deleteCompleteCallback;
		}
		if (paramObj.editCompleteCallback) {
			transPort.update.complete = paramObj.editCompleteCallback;
		}
		var dataSourceProperty = {
			transport : transPort,
			batch : paramObj.batch,
			schema : paramObj.schemaParams
		};

		if (paramObj.pageSize) {
			dataSourceProperty.pageSize = paramObj.pageSize;
		} else {
			dataSourceProperty.pageSize = 10;
		}
		if (paramObj.errorCallback) {
			dataSourceProperty.error = paramObj.errorCallback;
		}
		if (paramObj.defaultSort) {
			dataSourceProperty.sort = paramObj.defaultSort;
		}
		var dataSource = new kendo.data.DataSource(dataSourceProperty);

		return dataSource;
	};
});

/**
 Description: Kendo Notification Service
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.service("notificationService", function() {
	var template = "<div class='notiHeader'><span class='notiIcon'></span><span class='notiTitle'>#= myTitle #</span></div><div class='notiMessage'>#= myMessage #</div>";
	var notificationElement = angular.element("<div></div>").kendoNotification({
		templates : [{
			type : "warning",
			template : "<div class='notiWarning notification'>"+template+"</div>"
		}, {
			type : "success",
			template : "<div class='notiSuccess notification'>"+template+"</div>"
		}, {
			type : "error",
			template : "<div class='notiError notification'>"+template+"</div>"
		}, {
			type : "info",
			template : "<div class='notiInfo notification'>"+template+"</div>"
		}],
		autoHideAfter: 3000
	});

	this.showNotification = function(message, title, type) {
		/**
		 * message: it is to display in notification
		 * type: it is type of message e.g. success, error, info, warning
		 */
		var n = notificationElement.data("kendoNotification");

		// show a warning message using the built-in shorthand method
		n.show({
			myTitle: (title || "Applied Successfully"),
			myMessage: message
		}, (type || "success"));
	};
});

/**
 * Description: E
 * Copyright (c) 2016 by Cisco Systems, Inc.
 * 	All rights reserved.
 * 	*/
app.service("executeCliCmdService", function() {
	this.getNextString=function(strCLIOutput, arrTag, strEndDelimiter) {
		if (strCLIOutput == null || arrTag == null) {
			return "";
		}
		var intArrTagLength = arrTag.length;
		for( var i=0; i<intArrTagLength; i++) {
			var strTag = arrTag[i];
			var strOutput = getNextStr(strCLIOutput, strTag, strEndDelimiter);
			if (strOutput != null && strOutput != "") {
				return strOutput;
			}
		}
		return "";
	};
function getNextStr(strCLIOutput, strTag, strEndDelimiter) {
		if (strCLIOutput == null || strTag == null) {
			return "";
		}
		var intTagLength = strTag.length;
		var intFromTagIndex = strCLIOutput.indexOf(strTag);
		if (intFromTagIndex == -1) {
			return "";
		}
		var strFromTag = strCLIOutput.substring(intFromTagIndex + intTagLength);
		var intOuputIndex = strFromTag.indexOf(strEndDelimiter);
		if (intOuputIndex == -1) {
			return strFromTag;
		}
		if (strEndDelimiter == "\n" ) {
			intOuputIndex = intOuputIndex - 1 ;
		}
		var strOutput =  strFromTag.substring(0,intOuputIndex);
		return strOutput;
	}
});



/* This function will parse the CLI output stored in given String strCLIOutput and
 * returns the line which contains the given tag string.
 * First Argument  - The string in which the CLI output is stored.
 * Second Argument - The tag string which comes in line that is to be extracted.
 * Example:"!
 *			interface FastEthernet0/0/0
 *			 ip address 10.77.245.66 255.255.255.0
 *			 duplex full
 *			 speed auto
 *			!"
 * For this CLI output, if the tag string passed is "address", then
 * this function will extract and return the line "ip address 10.77.245.66 255.255.255.0".
 * Note: The tag String passed will be searched in the given strCLIOutput string for its
 * first occurance only. And the line corresponding to the first occurance will be returned.
 */
app.service("getStringLineService", function() {
	this.getLines=function(strCLIOutput, strTag) {
		if (strCLIOutput == null || strTag == null) {
			return "";
		}
		var arrLines = [];
		var intTagIndex = strCLIOutput.indexOf(strTag);
		while (intTagIndex != -1) {
			var intTagLength = strTag.length;
			// get the line in which this tag occurs
			var line = getLn(strCLIOutput, strTag);
			// store the line in the line array if it not empty or null
			if ( line != "" && line != null){
				arrLines.push(line);
			}
			strCLIOutput = strCLIOutput.substring(intTagIndex + intTagLength);
			var intLineEndIndex = strCLIOutput.indexOf("\n");
	 		strCLIOutput = strCLIOutput.substring(intLineEndIndex);
		 	// If no "\n" delimiter found in this line then this is the last line
			if (intLineEndIndex == -1) {
				return arrLines;
			}
			intTagIndex = strCLIOutput.indexOf(strTag);
		}
		return arrLines;
	} ;

	/* This function will parse the CLI output stored in given String strCLIOutput and
	 * returns the line which contains the given tag string.
	 * First Argument  - The string in which the CLI output is stored.
	 * Second Argument - The tag string which comes in line that is to be extracted.
	 */
	function getLn(strCLIOutput, strTag) {
		if (strCLIOutput == null || strTag == null) {
			return "";
		}
		var intTagIndex = strCLIOutput.indexOf(strTag);
		// If no matching tag found then return empty string
		if (intTagIndex == -1) {
			return "";
		}
		var strUptoTag = strCLIOutput.substring(0, intTagIndex);
		var intLineStartIndex = strUptoTag.lastIndexOf("\n");
		var strFromTag = strCLIOutput.substring(intTagIndex);
		var intLineEndIndex = strFromTag.indexOf("\n");
	 	// If no "\n" delimiter found in this line then this is the first line and the start index is 0
		if (intLineStartIndex == -1) {
			intLineStartIndex = 0;
		} else {
			intLineStartIndex = intLineStartIndex + 1; //exclude the '/n' character
		}
		// If no "\n" delimiter found in this line then this is the last line and end index is total length
		if (intLineEndIndex == -1) {
			intLineEndIndex = strFromTag.length;
		} else {
			intLineEndIndex = intLineEndIndex - 1; //exclude the '/n' character
		}
		var strLine = strCLIOutput.substring(intLineStartIndex, (intTagIndex + intLineEndIndex));
		return strLine;
	}
});

