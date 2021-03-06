'use strict';

var eat      = require('eat'     );
var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
  eat:            { type: Number                 },
  access_token:   { type: String                 },
  facebook_id:    { type: String, required: true },
  fb_last_update: { type: Date,                  },
  settings: {
    mem_rate_filter: { type: Number, default: 100 },
    num_buttons: {type: Number, default: 4},
    fun_meter: { type: Number, default: 0 },
    color: {
      red: { type: Number, default: 63 },
      green: { type: Number, default: 81 },
      blue: { type: Number, default: 181}
    }
  }
});

UserSchema.methods.generateToken = function generateToken(callback) {
  this.eat   = Date.now();
  this.save(function(err, user) {
    if (err) {
      console.log('Error saving new eat in user. Error: ', err);
      return callback(err, null);
    }

    eat.encode(user.eat, process.env.AUTH_SECRET, function(err, token) {
      if (err) {
        console.log("Error generating token. Error: ", err);
        return callback(err, null);
      }

      callback(null, token);
    });
  });
};

UserSchema.methods.invalidateToken = function invalidateToken(callback) {
  this.eat = null;
  this.save(function(err, user) {
    if (err) {
      console.log('Could not invalidate token. Error: ', err);
      return callback(err, null);
    }
    callback(null, user);
  })
}

module.exports = mongoose.model('User', UserSchema);
