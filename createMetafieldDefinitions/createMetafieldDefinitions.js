const API_URL = 'https://example.myshopify.com/admin/api/2024-10/graphql.json';
const ACCESS_TOKEN = '';

/**
 * メタフィールド定義を作成するメイン関数
 */
function createMetafieldDefinitions() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Product');
  
  // シートの最後の行まで取得
  const lastRow = sheet.getLastRow();
  const data = sheet.getRange(1, 2, lastRow, 6).getValues(); // B列から必要な範囲のデータを取得
  
  data.forEach(row => {
    const [ownerTypeValue, name, namespaceKey, , type, description] = row;
    const [namespace, key] = namespaceKey.split('.'); // D列を分割

    // B列の値に応じて ownerType を設定
    const ownerType = ownerTypeValue === "Product Metafield" ? "PRODUCT" : "PRODUCTVARIANT";

    const metafieldDefinition = {
      name,
      namespace,
      key,
      description,
      type,
      ownerType
    };

    // メタフィールド定義を作成
    console.log("metafieldDefinition", metafieldDefinition);
    const result = createMetafieldDefinition(metafieldDefinition);

    if (result.success) {
      Logger.log('Metafield Definition created: ' + result.data.id + ' (' + result.data.name + ')');
    } else {
      result.errors.forEach(error => {
        Logger.log('Error creating metafield definition: ' + error.message);
      });
    }
  });
}

/**
 * メタフィールド定義をShopify APIに送信して作成
 * 
 * @param {Object} metafieldDefinition - メタフィールド定義
 * @return {Object} - API呼び出しの結果
 */
function createMetafieldDefinition(metafieldDefinition) {
  const query = `
    mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition {
          id
          name
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `;

  const variables = { definition: metafieldDefinition };
  const payload = JSON.stringify({ query, variables });

  try {
    const response = UrlFetchApp.fetch(API_URL, {
      method: 'post',
      headers: {
        'content-Type': 'application/json',
        'X-Shopify-Access-Token': ACCESS_TOKEN
      },
      payload
    });

    const json = JSON.parse(response.getContentText());
    console.log(json);
    const createdDefinition = json.data?.metafieldDefinitionCreate?.createdDefinition;
    const userErrors = json.data?.metafieldDefinitionCreate?.userErrors;

    if (createdDefinition) {
      return { success: true, data: createdDefinition };
    } else if (userErrors?.length > 0) {
      return { success: false, errors: userErrors };
    }

    return { success: false, errors: [{ message: 'Unknown error occurred' }] };
  } catch (error) {
    Logger.log('Request failed: ' + error.toString());
    return { success: false, errors: [{ message: 'Request failed: ' + error.toString() }] };
  }
}
