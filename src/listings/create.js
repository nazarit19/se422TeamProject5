const { randomUUID } = require('crypto')
const { PutCommand } = require('@aws-sdk/lib-dynamodb')
const { getDocClient } = require('../lib/dynamo')
const { json, error, parseJsonBody } = require('../lib/http')

const REQUIRED_FIELDS = ['title', 'section', 'category', 'userId']

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
  const missingFields = REQUIRED_FIELDS.filter((field) => {
    const value = body[field]
    return typeof value !== 'string' || value.trim() === ''
  })

  if (missingFields.length > 0) {
    return error(400, `Missing required fields: ${missingFields.join(', ')}`)
  }

  const { id: _ignoredId, createdAt: _ignoredCreatedAt, ...attributes } = body
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
