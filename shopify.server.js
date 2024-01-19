const apiKey = 'c7939bbf4075041f5b7c2507befa006b';
const apiSecret = 'db2bd5c7970536bde93efcfe13b35c33';

// Функция для получения токена доступа
async function getAccessToken() {
  const response = await fetch('https://test-shop-with-checkout-ext.myshopify.com/admin/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: apiKey,
      client_secret: apiSecret,
      grant_type: 'client_credentials',
    }),
  });

  const data = await response.json();

  if (data.access_token) {
    return data.access_token;
  } else {
    throw new Error('Не удалось получить токен доступа');
  }
}

// Пример использования функции
getAccessToken()
  .then(token => {
    console.log('Токен доступа:', token);
    // Здесь вы можете использовать токен для выполнения запросов к GraphQL API
  })
  .catch(error => {
    console.error('Ошибка при получении токена доступа:', error);
  });
