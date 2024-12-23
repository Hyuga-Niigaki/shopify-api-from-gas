const API_URL = 'https://example.myshopify.com/admin/api/2024-10/graphql.json';
const ACCESS_TOKEN = '';

/**
 * メタフィールド定義を作成するメイン関数
 */
function createMetafieldDefinitions() {
  const sheetName = ''
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  
  // シートの最後の行まで取得
  const lastRow = sheet.getLastRow();
  console.log(lastRow);
  const data = sheet.getRange(23, 2, lastRow - 23 + 1, 7).getValues(); // B ~ G列 23行 ~ 最後の行
  
  data.forEach(row => {
    const [name, namespaceKey, type, description] = [row[0], row[2], row[1], row[5]];
    const [namespace, key] = namespaceKey.split('.'); // D列を分割

    // sheetNameに応じて ownerType を設定
    const ownerType = sheetName === "" ? "PRODUCT" : "PRODUCTVARIANT";

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