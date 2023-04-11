'use strict';

const markdownIt = require('markdown-it');

/**
 * product controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::product.product', ({ strapi }) => ({
  async findOne(ctx) {
    // some custom logic here
    ctx.query = { ...ctx.query, local: 'en' }
    // Calling the default core action
    const { data, meta } = await super.find(ctx);
    data.attributes.descriptionHTML = markdownIt(data.attributes.description ?? '')
    return { data, meta };
  },
}));
