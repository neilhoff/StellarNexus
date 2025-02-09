const arc = require('@architect/functions')
const bcrypt = require('bcrypt')


async function signIn (req, context) {
  console.log('test')
  let { session } = req
  console.log(session)
  // Setup bcrypt
  const saltRounds = 10
  const salt = bcrypt.genSaltSync(saltRounds)

  // Setup the Database
  const db = await arc.tables()
  const usersTable = db.users

  // Make sure there is an initial defaultAdmin TODO: Figure out how to seed the database on initial load
  let defaultAdmin = await usersTable.get({ username: 'admin' })
  if (!defaultAdmin) {
    const passwordHash = bcrypt.hashSync('admin', salt)
    defaultAdmin = await usersTable.put({
      username: 'admin',
      passwordHash
    })
  }

  async function validateUser (username, password) {
    const user = session.user ? session.user : await usersTable.get({ username: username })
    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.passwordHash)
      if (username === user.username && passwordMatch) {
        session.user = {
          ...user
        }
        return {
          message: 'User signed in successfully!',
          signedIn: true
        }
      } else {
        return {
          message: 'Username or password incorrect',
          signedIn: false
        }
      }
    } else {
      return {
        message: 'User does not exist. Please sign up to continue.',
        signedIn: false
      }
    }
  }

  console.log('validate user')
  const result = await validateUser(req.body.username, req.body.password)
  console.log(result, 'finish validateUser')
  return {
    session,
    body: JSON.stringify(result),
    headers: {
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN,
      'Access-Control-Allow-Credentials': 'true',
    },
    statusCode: 200
  }

}

exports.handler = arc.http(signIn)