const { ScanCommand } = require('@aws-sdk/lib-dynamodb')
const { getDocClient } = require('../lib/dynamo')
const { json, error } = require('../lib/http')

function sortByNewest(first, second) {
  const firstTime = Date.parse(first.createdAt || '')
  const secondTime = Date.parse(second.createdAt || '')
  const safeFirst = Number.isNaN(firstTime) ? 0 : firstTime
  const safeSecond = Number.isNaN(secondTime) ? 0 : secondTime

  return safeSecond - safeFirst
}

exports.handler = async () => {
  const tableName = process.env.LISTINGS_TABLE
  if (!tableName) {
    return error(500, 'LISTINGS_TABLE is not configured')
  }

  const items = []
  let exclusiveStartKey

  try {
    do {
      const response = await getDocClient().send(
        new ScanCommand({
          TableName: tableName,
          ExclusiveStartKey: exclusiveStartKey
        })
      )

      items.push(...(response.Items || []))
      exclusiveStartKey = response.LastEvaluatedKey
    } while (exclusiveStartKey)

    items.sort(sortByNewest)
    return json(200, items)
  } catch (err) {
    console.error('Failed to get listings', err)
    return error(500, 'Failed to get listings')
  }
}
