const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body)
  }
}

function error(statusCode, message) {
  return json(statusCode, { message })
}

function parseJsonBody(event) {
  if (!event || typeof event.body !== 'string') {
    return { ok: false, response: error(400, 'Request body must be valid JSON') }
  }

  try {
    const parsed = JSON.parse(event.body)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { ok: false, response: error(400, 'Request body must be a JSON object') }
    }

    return { ok: true, value: parsed }
  } catch (err) {
    return { ok: false, response: error(400, 'Request body must be valid JSON') }
  }
}

module.exports = {
  CORS_HEADERS,
  json,
  error,
  parseJsonBody
}
