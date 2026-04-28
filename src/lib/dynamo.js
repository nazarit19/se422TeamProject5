const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')

let docClient

function resolveRegion() {
  return process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1'
}

function getDocClient() {
  if (!docClient) {
    docClient = DynamoDBDocumentClient.from(
      new DynamoDBClient({
        region: resolveRegion()
      })
    )
  }

  return docClient
}

module.exports = {
  getDocClient,
  resolveRegion
}
