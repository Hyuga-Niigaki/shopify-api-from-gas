// Shopify APIのアクセストークンとストアドメインを設定
const ACCESS_TOKEN = '';
const STORE_DOMAIN = '';

// Shopify GraphQL APIにクエリを送信する関数
function fetchShopifyData(query, variables = {}) {
  const url = `https://${STORE_DOMAIN}/admin/api/2024-07/graphql.json`;
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ACCESS_TOKEN,
    },
    payload: JSON.stringify({ query: query, variables: variables })
  };

  const response = UrlFetchApp.fetch(url, options);
  const json = response.getContentText();
  return JSON.parse(json);
}

// 注文を削除するメイン関数
function deleteOrdersByName() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const orderNames = sheet.getRange('A2:A' + sheet.getLastRow()).getValues().flat();

  // 重複注文の追跡用セット
  const processedOrderIds = new Set();

  orderNames.forEach(orderName => {
    if (orderName) {
      const orderId = getOrderID(orderName);
      if (orderId && !processedOrderIds.has(orderId)) {
        deleteOrder(orderId);
        processedOrderIds.add(orderId); // 重複処理を防ぐためセットに追加
        Logger.log(`Order ${orderName} deleted successfully.`);
      } else if (processedOrderIds.has(orderId)) {
        Logger.log(`Order ${orderName} already processed.`);
      } else {
        Logger.log(`Order ${orderName} not found.`);
      }
    }
  });
}

// 注文名から注文IDを取得する関数
function getOrderID(orderName) {
  const query = `
    query($name: String!) {
      orders(first: 1, query: $name) {
        edges {
          node {
            id
          }
        }
      }
    }
  `;
  const variables = { name: `name:${orderName}` };
  const response = fetchShopifyData(query, variables);
  const orders = response.data.orders.edges;

  if (orders.length > 0) {
    return orders[0].node.id;
  }
  return null;
}

// 注文を削除する関数
function deleteOrder(orderId) {
  const mutation = `
    mutation($id: ID!) {
      orderDelete(orderId: $id) {
        deletedId
        userErrors {
          field
          message
        }
      }
    }
  `;
  const variables = { id: orderId };
  const response = fetchShopifyData(mutation, variables);

  // レスポンスが正しく取得できているか確認
  if (response && response.data && response.data.orderDelete) {
    if (response.data.orderDelete.userErrors.length > 0) {
      Logger.log(`Error deleting order ${orderId}: ${response.data.orderDelete.userErrors[0].message}`);
    } else {
      Logger.log(`Order ${orderId} deleted successfully.`);
    }
  } else {
    Logger.log(`Failed to delete order ${orderId}. No valid response received.`);
  }
}
