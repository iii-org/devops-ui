const Mock = require('mockjs')
const jwt = require('jwt-simple')
const secret = 'devops'

const developer_token = jwt.encode({
  "iat": new Date().getTime(),            //issued at
  "exp": new Date().getTime()+1000*60*30, //expiration time (30mins)
  "identity": 2
}, secret);

const pm_token = jwt.encode({
  "iat": new Date().getTime(),            //issued at
  "exp": new Date().getTime()+1000*60*30, //expiration time (30mins)
  "identity": 1
}, secret);

const users_info = [{
  "identity": 1,
  "name": "hubert",
  "email": "hubert@iii.org.tw",
  "phone": "0933333666",
  "group": {
    "name": "pm"
  },
  "role": {
    "name": "pm"
  }
},{
  "identity": 2,
  "name": "becky",
  "email": "becky@iii.org.tw",
  "phone": "0933333666",
  "group": {
    "name": "developer"
  },
  "role": {
    "name": "developer"
  }
}]

module.exports = [
  // user login
  {
    url: '/user/login',
    type: 'post',
    response: config => {
      try {
        if( !'username' in config.body || !'password' in config.body ) {
          throw "valid input"
        }
        const username = config.body.username
        const password = config.body.password
        let token = ''
        if( username === 'becky' && password === 'openstack') {
          token = developer_token
        } else if ( username === 'hubert' && password === 'openstack') {
          token = pm_token
        } else {
          throw "username or password error"
        }
        return {
          message: 'success',
          data: { token }
        }
      }
      catch (e) {
        return { message: e }
      }
    }
  },

  // get user info
  {
    url: '/user/info',
    type: 'get',
    response: config => {
      try {
        if( !'authorization' in config.headers ) {
          throw "valid input"
        }
        token = config.headers.authorization.split(' ')[1]
        const payload = jwt.decode(token, secret);
        if ( !'identity' in payload ) {
          throw "valid token"
        }

        const identity = payload.identity
        user_info = users_info.find(info => {
          return info.identity === identity
        })
        if(!user_info) {
          throw "valid token"
        }

        return {
          message: 'success',
          data: user_info
        }
      }
      catch (e) {
        return { message: e }
      }
    }
  },

  // user logout
  {
    url: '/user/logout',
    type: 'post',
    response: _ => {
      return {
        message: 'success'
      }
    }
  }
]
