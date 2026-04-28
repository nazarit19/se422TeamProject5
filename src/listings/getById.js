const { GetCommand } = require('@aws-sdk/lib-dynamodb')
const { getDocClient } = require('../lib/dynamo')
const { json, error } = require('../lib/http')

exports.handler = async (event) => {
  const tableName = process.env.LISTINGS_TABLE
  if (!tableName) {
    return error(500, 'LISTINGS_TABLE is not configured')
  }

  const id = event && event.pathParameters && event.pathParameters.id
  if (!id) {
    return error(400, 'Listing id is required')
  }

  try {
    const response = await getDocClient().send(
      new GetCommand({
        TableName: tableName,
        Key: { id }
      })
    )

    if (!response.Item) {
      return error(404, 'Listing not found')
    }

    return json(200, response.Item)
  } catch (err) {
    console.error('Failed to get listing', err)
    return error(500, 'Failed to get listing')
  }
}
