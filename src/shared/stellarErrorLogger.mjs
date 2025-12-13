import arc from '@architect/functions'
import { blankToNull, getRandomShard } from './tableHelper.mjs'
import { getYearMonth } from './format.mjs'

/**
 * Build Dynamo DB item of the Error
 *   pk:        `error#<shard>#<YYYY-MM>`
 *   sk:        ISO timestamp
 *   errorData: 
 *
 * @param {Error} error
 * @param {Object} lambdaContext – **full Lambda context** (req + AWS context) 
 * @param {Object} extraContext  – any custom fields you want to add
 
 * @returns {Object} DynamoDB item
 */

function buildErrorItem (error, side, correlation, lambdaContext, extraContext) {
  const correlationId = correlation || crypto.randomUUID()

  const useTime = new Date()
  const isoTime = useTime.toISOString()
  const month = getYearMonth(useTime)  // "2025-11"

  // Setup the PK with a shard and month
  const shard = getRandomShard()
  const pk = `error#${shard}#${month}`
  let errorPayload

  if (side === 'server') {
    // Full Lambda context (req + AWS context) – sanitized
    const { req, context } = lambdaContext

    const sessionId = req.httpMethod === 'GET' ? req.queryStringParameters?.sessionId : req.body?.sessionId
    const userName = req.httpMethod === 'GET' ? req.queryStringParameters?.userName : req.body?.userName

    // Avoid storing huge payloads (e.g. binary bodies, large headers)
    const safeEvent = req ? {
      httpMethod: req.httpMethod,
      path: req.path,
      queryStringParameters: req.queryStringParameters,
      headers: Object.fromEntries(
        Object.entries(req.headers || {}).filter(
          ([k]) => !k.toLowerCase().includes('cookie') && !k.toLowerCase().includes('authorization')
        )
      ),
      requestContext: {
        requestId: req.requestContext?.requestId,
        connectionId: req.requestContext?.connectionId,
        domainName: req.requestContext?.domainName,
        stage: req.requestContext?.stage
      }
    } : {}

    const safeContext = context ? {
      functionName: context.functionName,
      functionVersion: context.functionVersion,
      invokedFunctionArn: context.invokedFunctionArn,
      memoryLimitInMB: context.memoryLimitInMB,
      awsRequestId: context.awsRequestId,
      logGroupName: context.logGroupName,
      logStreamName: context.logStreamName
    } : {}

    // Assemble error payload
    errorPayload = {
      timeStamp: isoTime,
      userName,
      correlationId,
      sessionId,
      errorName: error.name || 'Error',
      errorMessage: error.message || 'Unknown error',
      errorStack: error.stack || '',
      side,
      context: {
        ...extraContext,
        lambda: {
          req: safeEvent,
          context: safeContext
        }
      }
    }
  } else { // Client error
    errorPayload = {
      timeStamp: isoTime,
      correlationId,
      errorName: error.error?.name || 'Error',
      errorMessage: error.error?.message || 'Unknown error',
      errorStack: error.error?.stack || '',
      ...error
    }
  }

  return {
    pk,
    sk: isoTime,
    errorData: blankToNull(errorPayload)
  }
}

/**
 * Log error to:
 *   1. DynamoDB (stellarTracks)
 *   2. AWS CloudWatch (standard logging via console.error)
 * 
 * @param {Error} error
 * @param {String} side - 'client' or 'server' 
 * @param {String} correlationId - If there is a correlation id or null
 * @param {Object} lambdaContext  – { req, context } from your handler
 * @param {Object} extraContext - extra content you want saved to the error log
 */

export async function logError (error, side, correlationId, lambdaContext = {}, extraContext = {}) {
  const db = await arc.tables()
  const stellarTracksTable = db.stellarTracks
  const item = buildErrorItem(error, side, correlationId, lambdaContext, extraContext)
  try {
    // console.dir(item, { depth: null, colors: true })
    await stellarTracksTable.put(item)
    console.log(`[stellarLogger] Saved ${side} error →`, item.pk, item.sk)
    // return item
  } catch (putErr) {
    console.error('[stellarLogger] FAILED to write error to DB:', putErr)
  } finally {
    // Log to CloudWatch (standard AWS logging) for server side errors no matter what.
    if (side === 'server') {
      const logEntry = {
        level: 'ERROR',
        message: error.message,
        errorName: error.name,
        stack: error.stack,
        side: side,
        timestamp: new Date().toISOString(),
        lambda: {
          functionName: lambdaContext.context?.functionName || 'unknown',
          requestId: lambdaContext.context?.awsRequestId || lambdaContext.req?.requestContext?.requestId || 'unknown'
        },
        context: item.errorData.context,
        dbItem: {
          pk: item.pk,
          sk: item.sk
        }
      }
      // This appears in CloudWatch Logs as a structured, searchable entry
      console.error(JSON.stringify(logEntry))
    }
  }
  // If saved successfully to the database then return the correlationId
  return item.errorData.correlationId
}