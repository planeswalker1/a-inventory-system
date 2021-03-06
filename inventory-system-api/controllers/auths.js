const jwt = require('jsonwebtoken');
const User = require('../models/schemas/user');
const config = require('../models/config/config');

// this function is going to create a token and assign it to a user
// this works by checking:
  // if the request has a email and password
  // check the user db for a user with that email
  // check if the passwords match
  // if all are true
    // create and return a token containing the user's: id and email

/**
  find a user and compare passwords
  @param {String} req.body.email - user email
  @param {String} req.body.password - user password
  @return {Object} token - user token
*/

exports.loginUser = function (req, res, next) {
  console.log('loginUser called');
  console.log(req.body.email, typeof req.body.email);
  console.log(req.body.password, typeof req.body.password);
  // **validate inputs
  if (typeof req.body.email !== 'string') {
    return res.status(400).send('Missing user email');
  }
  if (typeof req.body.password !== 'string') {
    return res.status(400).send('Missing user password');
  }
  
  console.log('finding a user');
  // **find user
  User.findOne({email: req.body.email}, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).send('No user with that email');
    }

    console.log('found user', user);
    console.log('comparing password');
    // **compare pw with user hash
    user.comparePassword(req.body.password, function (err, isMatch) {
      if (err) {
        return next(err);
      }
      if (!isMatch) {
        return res.status(401).send('Incorrect password');
      }

      // **create token and add to user
      console.log('creating token');
      let payload = {
        id: user._id,
        email: user.email
      };
      console.log('payload', payload);
      let token = jwt.sign(payload, config.secret);
      console.log('token in loginUser', token);
      user.token = token;

      // **save and return token
      user.save(function (err, user) {
        if (err) {
          return next(err);
        }
        console.log('sending token');
        return res.json({token: token});
      });
    });
  });
}

// this function is going to search for a token in the req.body, url, or headers (x-access-token or authorization)
// try to decode the token
  // set req.user to decoded token
// else
  // return 403 error
// send to next middleware transporting the token

/**
  decode token middleware
  @param {String} req.headers.authorization - req.headers token
  @return {Object} next call();
*/
exports.validateToken = function (req, res, next) {
  console.log('validateToken ran');
  // **check for token
  var token = req.body.token || req.headers['authorization'];
  console.log('token that was caught', token);

  if (!token) {
    return res.status(403).send('This endpoint requires a token');
  }

  // **decode token
  try {
    var decoded = jwt.verify(token, config.secret);
  } catch (err) {
    return res.status(403).send('Failed to authenticate token');
  }

  console.log('finding user to attach token');
  // **find user with decoded token id
  User.findById(decoded.id, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(403).send('Invalid user');
    }
    if (token !== user.token) {
      return res.status(403).send('Expired token');
    }

    console.log('found user');
    console.log('user.token', user.token);
    // **add decoded token and token to request
    req.user = decoded;
    console.log('req.user', req.user);
    req.token = user.token;
    console.log('req.token', req.token);
    next();
  });
}

/**
  log out user
  @param {String} req.user.id - user id from token
  @return {Object} response
*/
exports.logOutUser = function (req, res, next) {
  console.log('logOut user ran');
  console.log(req.user)

  // **find user with decoded token id
  User.findById(req.user.id, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(404).send('No user with that ID');
    }
    console.log('found user', user);

    // **remove token from user in db and decoded token from req
    user.token = '';
    req.user = '';
    console.log('user token was removed', user);
    user.save(function (err, user) {
      if (err) {
        return next(err);
      }
      console.log('user updated! deleted their token');
      return res.status(200).send('ok');
    })
  })
}