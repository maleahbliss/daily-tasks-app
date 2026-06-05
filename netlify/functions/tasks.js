const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzpItWOS50xb3djUP2E-injgx58jtUkZTRmni_AeeOaTGGG9oYNy1wfFSFwUEg/usercallable';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const action = event.queryStringParameters?.action || 'getTasks';
    
    if (action === 'getTasks') {
      const response = await fetch(`${APPS_SCRIPT_URL}?action=getTasks`);
      const data = await response.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (action === 'updateTask') {
      const body = JSON.parse(event.body);
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateTask', id: body.id, completed: body.completed })
      });
      const data = await response.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
