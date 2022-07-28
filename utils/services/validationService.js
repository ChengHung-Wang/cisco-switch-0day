app.service('commonValidationService', function () {
    this.validateMaximumLength = function (value, maxValue, exact) {
        if (exact) {
            return value.length <= Number(maxValue);
        }
        return value.length < Number(maxValue);
    };
    this.validateEmptyString = function (value) {
        if (value.length < 1) {
            return false;
        }
        return true;
    };
    this.validateCheck = function(input) {
        if (!input.data('checkMsg')) {
            return true;
        }
        var val = input.val();
        if (val.indexOf('?') > -1) {
            return false;
        }
        return true;
    };
    this.validateRange =  function (input) {
        var count=0;
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
    };
    this.validateIPAddress = function(value){
        var valMsg = value.data('validateipMsg');
        var ipAddress = value.val();
        if ((valMsg == undefined)){
            return true;
		}else if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipAddress)){
            return true;
		}
        else if (ipAddress == "0.0.0.0" || ''){
            return false;
		}
        return false;
    };
    this.validateDataSpace = function (value) {
        var valMsg = value.data('dataspaceMsg');
        if ((valMsg == undefined)){
			return true;
		}
        else if ((value.val()).trim() == ''){
            return false;
		}
        return true;
    };
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
});