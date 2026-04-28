const { randomUUID } = require('crypto')
const { PutCommand } = require('@aws-sdk/lib-dynamodb')
const { getDocClient } = require('../lib/dynamo')
const { json, error, parseJsonBody } = require('../lib/http')
const listingSections = require('../../frontend/src/listingSections.json')

const REQUIRED_FIELDS = ['title', 'section', 'category', 'userId']

function getClaims(event) {
  return (
    event?.requestContext?.authorizer?.jwt?.claims ||
    event?.requestContext?.authorizer?.claims ||
    {}
  )
}

function getUserId(event, body) {
  const claims = getClaims(event)

  for (const claimKey of ['sub', 'cognito:username', 'username']) {
    const claimValue = claims[claimKey]
    if (typeof claimValue === 'string' && claimValue.trim() !== '') {
      return claimValue.trim()
    }
  }

  if (typeof body.userId === 'string' && body.userId.trim() !== '') {
    return body.userId.trim()
  }

  return ''
}

function getCategoryFields(section, category) {
  return listingSections[section]?.[category] || null
}

function isMissingRequiredValue(value) {
  return typeof value !== 'string' || value.trim() === ''
}

exports.handler = async (event) => {
  const tableName = process.env.LISTINGS_TABLE
  if (!tableName) {
    return error(500, 'LISTINGS_TABLE is not configured')
  }

  const parsed = parseJsonBody(event)
  if (!parsed.ok) {
    return parsed.response
  }

  const body = parsed.value
  const payload = {
    ...body,
    userId: getUserId(event, body)
  }

  const missingFields = REQUIRED_FIELDS.filter((field) => isMissingRequiredValue(payload[field]))
  if (missingFields.length > 0) {
    return error(400, `Missing required fields: ${missingFields.join(', ')}`)
  }

  const categoryFields = getCategoryFields(payload.section, payload.category)
  if (!categoryFields) {
    return error(400, 'Invalid section/category combination')
  }

  const missingCategoryFields = categoryFields.filter((field) => isMissingRequiredValue(payload[field]))
  const allMissingFields = [...new Set(missingCategoryFields)]

  if (allMissingFields.length > 0) {
    return error(400, `Missing required fields: ${allMissingFields.join(', ')}`)
  }

  const { id: _ignoredId, createdAt: _ignoredCreatedAt, ...attributes } = payload
  const item = {
    ...attributes,
    id: randomUUID(),
    createdAt: new Date().toISOString()
  }

  try {
    await getDocClient().send(
      new PutCommand({
        TableName: tableName,
        Item: item
      })
    )

    return json(201, item)
  } catch (err) {
    console.error('Failed to create listing', err)
    return error(500, 'Failed to create listing')
  }
}
