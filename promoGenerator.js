const { GraphQLClient } = require('graphql-request');

const shopifyGraphQLURL = 'https://test-shop-with-checkout-ext.myshopify.com/admin/api/2022-10/graphql.json';

let startDiscountTime = new Date();
let endDiscountTime = new Date();
endDiscountTime.setDate(endDiscountTime.getDate() + 5);

function generatePromoCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codeArray = [];

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    codeArray.push(characters.charAt(randomIndex));
  }

  return codeArray.join('');
}

function percDiscount() {
  const randomValue = Math.random() * 100;
  let disc;

  if (randomValue >= 30) {
    console.log('first variant');
    disc = 0.35;
  } else {
    console.log('second variant');
    disc = 0.15;
  }

  return disc;
}

const promoGenerate = async () => {
  const graphQLClient = new GraphQLClient(shopifyGraphQLURL, {
    headers: {
      'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_TOKEN,
    },
  });

  const mutation = `
    mutation DiscountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
        codeDiscountNode {
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              codes(first: 10) {
                nodes {
                  code
                }
              }
              startsAt
              endsAt
              customerSelection {
                ... on DiscountCustomerAll {
                  allCustomers
                }
              }
              customerGets {
                value {
                  ... on DiscountPercentage {
                    percentage
                  }
                }
                items {
                  ... on AllDiscountItems {
                    allItems
                  }
                }
              }
              appliesOncePerCustomer
            }
          }
        }
        userErrors {
          field
          code
          message
        }
      }
    }
  `;

  const variables = {
    basicCodeDiscount: {
      title: 'Minigames discount',
      code: generatePromoCode(8),
      startsAt: startDiscountTime,
      endsAt: endDiscountTime,
      appliesOncePerCustomer: true,
      customerSelection: { all: true },
      customerGets: { value: { percentage: percDiscount() }, items: { all: true } },
    },
  };

  try {
    const data = await graphQLClient.request(mutation, { basicCodeDiscount: variables.basicCodeDiscount });

    const { discountCodeBasicCreate } = data || {};
    const { codeDiscountNode, userErrors } = discountCodeBasicCreate || {};

    if (userErrors && userErrors.length > 0) {
      console.error('Error creating discount code - user errors:', userErrors);
      return { success: false, error: 'Error creating discount code' };
    }

    if (codeDiscountNode) {
        console.log('Discount code created successfully:', codeDiscountNode.codeDiscount);
        // Возвращаем объект с успехом и кодом промокода
        return { success: true, codeDiscount: codeDiscountNode.codeDiscount };
    }

    console.error('Error creating discount code - unexpected structure:', data);
    // Возвращаем объект с ошибкой
    return { success: false, error: 'GraphQL request failed' };
} catch (error) {
    console.error('GraphQL request failed:', error);
    // Возвращаем объект с ошибкой
    return { success: false, error: 'GraphQL request failed' };
}
};

module.exports = {
  promoGenerate: promoGenerate,
};
