"use strict"

module.exports = function(passport) {

  var LocalStrategy = require('passport-local').Strategy;

  var Users = [
      { id: 1, username: 'jaon', password: 'jaon', name: 'João'}
    , { id: 2, username: 'stefan', password: 'stefan', name: 'Stofo'}
    
  ];

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    findById(id, function (err, user) {
      done(err, user);
    });
  });

  passport.use(new LocalStrategy(
    function(username, password, done) {
      process.nextTick(function() {
        findByUsername(username, function(err, user) {
          if (err) { return done(err); }
          if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
          }
          if (user.password != password) {
            return done(null, false, { message: 'Incorrect password.' });
          }
          return done(null, user);
        });
      });
    })
  );

  function findById(id, fn) {
    var idx = id - 1;
    if (Users[idx]) {
      fn(null, Users[idx]);
    } else {
      fn(new Error('User ' + id + ' does not exist'));
    }
  }

  function findByUsername(username, fn) {
    for (var i = 0; i < Users.length; i++) {
      var user = Users[i];
      if (user.username === username) {
        return fn(null, user);
      }
    }
    return fn(null, null);
  }
};
