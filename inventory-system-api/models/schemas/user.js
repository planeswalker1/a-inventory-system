const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Room = require('./room');
const config = require('../config/config');

let Schema = mongoose.Schema;
let userSchema = new Schema({
  email: { type: String, required: true, trim: true, unique: true },
  hash: { type: String, required: true },
  username: { type: String, trim: true, required: true, unique: true },
  rooms: [{ type: Schema.Types.ObjectId, ref: 'Room' }],
  token: String
});

userSchema.pre('save', function (next) {
  let user = this;

  if (!user.email) {
    return next(new Error('Missing user email'));
  }
  if (!user.hash) {
    return next(new Error('Missing user password'));
  }
  if (!user.username) {
    return next(new Error('Missing username'));
  }

  // don't hash pw if hashed
  if (!user.isModified('hash')) {
    return next();
  }
  // hash pw
  bcrypt.genSalt(config.saltRounds, function (err, salt) {
    if (err) {
      return next(err);
    }
    console.log('generated salt');
    bcrypt.hash(user.hash, salt, function (err, hash) {
      if (err) {
        return next(err);
      }
      console.log('hashed and saved');
      user.hash = hash;
      return next();
    });
  });
});

let User = mongoose.model('User', userSchema);

module.exports = User;