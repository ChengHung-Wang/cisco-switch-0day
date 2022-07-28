/*!
 * Request routing Javascript library
 *
 * Copyright (c) 2008, 2011, 2014-2015 by Cisco Systems, Inc.,
 * 170 West Tasman Drive, San Jose,
 * California, 95134, U.S.A.   All rights reserved.
 *
 * @author: qsayedra
 *
 */

function RequestRoutingHandler(useLocalData){
   this.useLocalData = useLocalData;

   this.getShowCmdOutput = function getShowCmdOutput(cliCmd,odmFileName){
      $.ajaxSetup({async: false});
      if(cliCmd === null || cliCmd == undefined){
         throw "null command exception";
      } else {
          var x2js = new X2JS();
          if(useLocalData){
             cliCmd = cliCmd.replace(/ /g,'');
             if(odmFileName && odmFileName != null){
                cliCmd = cliCmd+odmFileName+".xml";
             } else {
                cliCmd = cliCmd+".txt";
             }
             var result =  $.get("resources/data/" + cliCmd);
             return x2js.xml_str2json(result.responseText);
          }else{
             if(odmFileName !== null && odmFileName !== undefined){
                cliCmd = cliCmd + " | format flash:/webui/odm/" + odmFileName + ".odm";
             }
             var result1 = deviceCommunicator.getExecCmdOutput(cliCmd);
             return x2js.xml_str2json(result1);
          }
      }
   }

   this.getConfigCmdOutput = function(cliCmd){
      $.ajaxSetup({async: false});
      if(cliCmd === null || cliCmd == undefined){
         throw "null command exception";
      }
   }
}
