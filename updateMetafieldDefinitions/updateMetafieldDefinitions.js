const API_URL = 'https://example.myshopify.com/admin/api/2024-10/graphql.json';
const ACCESS_TOKEN = '';

/**
 * メタフィールド定義を更新するメイン関数
 */
function updateMetafieldDefinitions() {
  const sheetName = '';
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  
  // シートの最後の行まで取得
  const lastRow = sheet.getLastRow();
  console.log(lastRow);
  const data = sheet.getRange(23, 2, lastRow - 23 + 1, 7).getValues(); // B ~ G列 23行 ~ 最後の行
  
  data.forEach(row => {
    const [name, namespaceKey, description] = [row[0], row[2], row[5]]; // IDはG列にあると仮定
    const [namespace, key] = namespaceKey.split('.'); // D列を分割

    // sheetNameに応じて ownerType を設定
    const ownerType = sheetName === "" ? "PRODUCT" : "PRODUCTVARIANT";

    const metafieldDefinition = {
      name,
      namespace,
      key,
      description,
      ownerType
    };

    // メタフィールド定義を更新
    console.log("Updating metafieldDefinition", metafieldDefinition);
    const result = updateMetafieldDefinition(metafieldDefinition);

    if (result.success) {
      Logger.log('Metafield Definition updated: ' + result.data.id + ' (' + result.data.name + ')');
    } else {
      result.errors.forEach(error => {
        Logger.log('Error updating metafield definition: ' + error.message);
      });
    }
  });
}

/**
 * メタフィールド定義をShopify APIに送信して更新
 * 
 * @param {Object} metafieldDefinition - メタフィールド定義
 * @return {Object} - API呼び出しの結果
 */
function updateMetafieldDefinition(metafieldDefinition) {
  const query = `
    mutation UpdateMetafieldDefinition($definition: MetafieldDefinitionUpdateInput!) {
      metafieldDefinitionUpdate(definition: $definition) {
        updatedDefinition {
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
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ACCESS_TOKEN
      },
      payload
    });

    const json = JSON.parse(response.getContentText());
    console.log(json);
    const updatedDefinition = json.data?.metafieldDefinitionUpdate?.updatedDefinition;
    const userErrors = json.data?.metafieldDefinitionUpdate?.userErrors;

    if (updatedDefinition) {
      return { success: true, data: updatedDefinition };
    } else if (userErrors?.length > 0) {
      return { success: false, errors: userErrors };
    }

    return { success: false, errors: [{ message: 'Unknown error occurred' }] };
  } catch (error) {
    Logger.log('Request failed: ' + error.toString());
    return { success: false, errors: [{ message: 'Request failed: ' + error.toString() }] };
  }
}