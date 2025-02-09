const arc = require('@architect/functions')
const bcrypt = require('bcrypt')
const { createErrorInstance, createReturnError } = require('@architect/shared/serverErrors')


async function signUp (req, context) {
  let { session } = req
  console.log('session', session.user)
  // Setup bcrypt
  const saltRounds = 10
  const salt = bcrypt.genSaltSync(saltRounds)

  // Setup the Database
  let db = await arc.tables()
  let usersTable = db.users
  console.log(usersTable)
  console.log(req.body)

  let newUserTest = await usersTable.get({ username: req.body.email })
  let result, user
  if (newUserTest) {
    console.log('User already created')
    const errorInstance = createErrorInstance('UserAlreadyCreated', 'User has already been created.', 409)
    const returnObj = createReturnError(errorInstance)
    console.log(returnObj)
    return {
      ...returnObj
    }
  } else {
    const passwordHash = bcrypt.hashSync(req.body.password, salt)
    console.log('Password Hash!', passwordHash)
    try {
      user = await usersTable.put({
        username: req.body.email,
        passwordHash,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName
      })
      // user = { username: userSave.username }
      // result = {
      //   username: userSave.username,
      //   message: 'User created successfully!'
      // }
      console.log('USERSAVE====', user)
      const allUsers = await usersTable.scan()
      console.log(allUsers)
      result = {
        username: user.username,
        message: 'User was created Successfully!'
      }
      console.log('RESULT======', result)
    } catch (error) {
      console.log(error)
      const returnObj = createReturnError(error)
      return {
        ...returnObj
      }
    }
  }
  return {
    session: { user },
    body: JSON.stringify(result),
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN
    },
    statusCode: 200
  }

}

exports.handler = arc.http(signUp)