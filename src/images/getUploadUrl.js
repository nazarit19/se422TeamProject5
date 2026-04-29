const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { randomUUID } = require('crypto')

const s3 = new S3Client({})

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' }
  }

  try {
    const userId = event.requestContext?.authorizer?.claims?.sub
    if (!userId) {
      return { statusCode: 401, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Unauthorized' }) }
    }

    const { fileType } = JSON.parse(event.body)
    if (!fileType) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'fileType is required' }) }
    }

    const key = `listings/${userId}/${randomUUID()}`

    const url = await getSignedUrl(s3, new PutObjectCommand({
      Bucket: process.env.IMAGES_BUCKET,
      Key: key,
      ContentType: fileType
    }), { expiresIn: 60 })

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ uploadUrl: url, imageUrl: `https://${process.env.IMAGES_BUCKET}.s3.amazonaws.com/${key}` })
    }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Failed to generate upload URL' }) }
  }
}