const arc = require('@architect/functions')
// var passport = require('passport')
// var LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')


async function signUp (req, context) {
  let { session } = req
  console.log('session', session)
  // Setup bcrypt
  const saltRounds = 10
  const salt = bcrypt.genSaltSync(saltRounds)

  // Setup the Database
  let db = await arc.tables()
  let usersTable = db.users

  let newUserTest = await usersTable.get({ username: req.body.username })
  let result, statusCode, user
  if (newUserTest) {
    console.log('User already created')
    result = {
      message: 'User already created'
    }
    statusCode = 409
  } else {
    const passwordHash = bcrypt.hashSync(req.body.password, salt)
    try {
      const userSave = await usersTable.put({
        username: req.body.username,
        passwordHash
      })
      user = { username: userSave.username }
      result = {
        username: userSave.username,
        message: 'User created successfully!'
      }
      statusCode = 200
    } catch (error) {
      result = {
        message: 'There was an error creating the user' + error
      }
      statusCode = 500
    }

  }

  return {
    session: { user },
    body: JSON.stringify(result),
    cors: true,
    statusCode: statusCode
  }

}

exports.handler = arc.http(signUp)