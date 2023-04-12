/**
 * product controller
 */

import { factories } from '@strapi/strapi'
import MarkdownIt from 'markdown-it'

const markdownIt = new MarkdownIt()

export default factories.createCoreController(
  'api::product.product',
  ({ strapi }) => ({
    async findOne(ctx) {
      // some custom logic here
      ctx.query = { ...ctx.query, local: 'en' }
      // Calling the default core action
      const { data, meta } = await super.findOne(ctx)
      data.attributes.descriptionHTML = markdownIt.render(
        data.attributes.description ?? '',
      )
      return { data, meta }
    },
  }),
)
