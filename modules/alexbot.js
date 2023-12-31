var alexBot;
var alexBotCommands = [addCmd, describeCmd, editCmd, removeCmd];

var db = require('../modules/db.js');
var db_table = 'alexBot';
//
getAllCommands();
exports.modName = "Custom Commands";

function getAllCommands() {
  db.getAllDocuments(db_table, function(res){
    alexBot = res;
  });
}

function addCmdToDB(cmd, callback) {
  db.addDoc(db_table, alexBotHash, callback);
}

function updateCmdDB(cmd, updateJson, callback){
  var findJson = {
    "name": cmd["name"]
  };

  db.updateOneDoc(db_table, findJson, updateJson, callback);
}

function describeCmdDB(cmd, callback) {
  var updateJson = {
    $set: {
      "description": cmd["description"]
    }
  };

  updateCmdDB(cmd, updateJson, callback);
}

function changeMsgCmdDB(cmd, callback) {
  var updateJson = {
    $set: {
      "message": cmd["message"]
    }
  };

  updateCmdDB(cmd, updateJson, callback);
}

function deleteCmdFromDB(cmd, callback){
  var findJson = { "name": cmd["name"] };

  db.removeOneDoc(db_table, findJson);
}

//exports
exports.checkCommands = function(dataHash, callback) {
  for (cmd in alexBot) {
    cmd = alexBot[cmd];
    //hard coded temporarily ... maybe permanently ... losing motivation to work on this
   // if(cmd.name == 'cc') // && dataHash.currentBot.type == 'hp')
    //  continue;
    var cmdReg = new RegExp(cmd.regex, "i");
  
  if (dataHash.request.text && cmdReg.test(dataHash.request.text)){
      var val = cmdReg.exec(dataHash.request.text);
      callback(true, cmd.message, []);
//callback(true, cmd.message, cmd.attachments);
      break;
    }
  }

  for (cmd in alexBotCommands) {
    var test = alexBotCommands[cmd](dataHash.request, callback);
    if (test)
      return test;
  }
}

exports.setAll = function(cmdHash) {
  alexBot = alexBotHash;
}

exports.getAll = function() {
  return alexBot;
}

exports.getCmdListDescription = function () {
  cmdArr = [
    {cmd: "/cmd add 'name' 'message'", desc: "Add a new custom command", mod: true},
    {cmd: "/cmd describe 'name' 'description'", desc: "Adds a description to a custom command for this command list", mod: true},
    {cmd: "/cmd edit 'name' 'message with tags'", desc: "Changes the response of an existing command", mod: true},
    {cmd: "/cmd remove 'name'", desc: "Deletes a custom command", mod: true}
  ];

  for (cmd in alexBot) {
    cmdArr.push({cmd: "/" + alexBot[cmd].name, desc: alexBot[cmd].description});
  }

  return cmdArr;
}


function addCmd(request, callback) {
  var regex = /^\/cmd add (.+?) ([\s\S]+)/i;
  var reqText = request.text;

  if (regex.test(reqText)){
    var val = regex.exec(reqText);

  //  if (!isMod) {
     // var msg = "You don't have permission to add commands"
    //  callback(true, msg, []);
    //  return msg;
 //   }

    for (cmd in alexBot) {
      if (alexBot[cmd].name == val[1]) {
        var msg = val[1] + " already exists";
        callback(true, msg, []);
        return msg;
      }
    }

    var alexBotHash = {
      name: val[1].toLowerCase(),
      regex: "^\/" + val[1] + "$",
      message: val[2]
    };

    alexBot.push(alexBotHash);
    addCmdToDB(alexBotHash);
    var msg = val[1] + " command added! please use \"/cmd describe " + val[1] + " <description>\" to add a description for your new command";
    callback(true, msg, []);
    return msg;
  }
}

function describeCmd(request, callback) {
  var regex = /^\/cmd describe (.+?) ([\s\S]+)/i;
  var reqText = request.text;

  if (regex.test(reqText)){
    var val = regex.exec(reqText);

   // if (!isMod) {
    //  var msg = "You don't have permission to describe commands"
    //  callback(true, msg, []);
     // return msg;
  //  }

    for (cmd in alexBot) {
      if (alexBot[cmd].name == val[1].toLowerCase()) {
        alexBot[cmd]["description"] = val[2];
        describeCmdDB(alexBot[cmd]);

        var msg = val[1] + " description updated";
        callback(true, msg, []);
        return msg;
      }
    }

    var msg = val[1] + " doesn't exist";
    callback(true, msg, []);

    return msg;
  }
}

function removeCmd(request, callback) {
  var regex = /^\/cmd remove (.+)/i;
  var reqText = request.text.toLowerCase();

  if (regex.test(reqText)){
    var val = regex.exec(reqText);

  //  if (!isMod) {
   //   var msg = "You don't have permission to remove commands"
    //  callback(true, msg, []);
  //    return msg;
 //   }

    val[1] = val[1].toLowerCase();

    for (cmd in alexBot) {
      if (alexBot[cmd].name == val[1]) {
        deleteCmdFromDB(alexBot[cmd]);
        alexBot.splice(cmd, 1);
        var msg = val[1] + " command deleted for ever and ever and ever and ... you get it.";
        callback(true, msg, []);
        return msg;
      }
    }

    callback(true, "No such command.", []);
    return msg;
  }
}


function editCmd(request, callback) {
  var regex = /^\/cmd edit (.+?) ([\s\S]+)/i;
  var reqText = request.text;

  if (regex.test(reqText)){
    var val = regex.exec(reqText);

  //  if (!isMod) {
   //   var msg = "You don't have permission to edit commands"
    //  callback(true, msg, []);
    //  return msg;
  //  }

    val[1] = val[1].toLowerCase();
    for (cmd in alexBot) {
      if(alexBot[cmd].name == val[1]) {
        alexBot[cmd].message = val[2];
        changeMsgCmdDB(alexBot[cmd]);

        var msg = val[1] + " message updated.";
        callback(true, msg, []);
        return msg;
      }
    }

    var msg = val[1] + "doesn't exist";
    callback(true, msg, []);
    return msg;
  }
}
