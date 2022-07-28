/**
 Description: This is a custom translate filter used for tranlation of keys to display values.
 Copyright (c) 2016 by Cisco Systems, Inc.
 All rights reserved.
 */
app.filter('translate', function(i18nService){
     return function(input,arg) {
               var i18nValue = i18nService.getLocalizedValue(input, input);
		//Trouble in the below logic.
		//Just return the i18nValue for now
                 return i18nValue;
     };
});
