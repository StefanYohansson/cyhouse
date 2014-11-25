"use strict";

var db = require('../conn');

var Module = {
    saveModule: function(module_nick, module_location, active) {
        db.modules.insert(
            {
                module_nick: module_nick,
                module_action: module_action,
                active: active
            }
        );
    },
    getModule: function(id, callback) {
        db.modules.find({_id: id}).toArray(err, mod)
        {
            callback(mod);
        }
    },
    action: {
        getActions: function(module_id) {
            db.actions.find({module_id: module_id}).toArray(err, action)
            {
                callback(action);
            }
        },
        saveActions: function(module_id, action, params) {
            db.actions.insert(
                {
                    module_id: module_id,
                    action: action,
                    params: params
                }
            );
        }
    },
};


module.exports = Module;
