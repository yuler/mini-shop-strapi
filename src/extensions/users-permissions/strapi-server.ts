/**
 * Plugins Extension
 * @url https://docs.strapi.io/dev-docs/plugins-extension#within-the-extensions-folder
 */

// TODO: types
import utils from '@strapi/utils'
import axios from 'axios'
import _ from 'lodash'

const { sanitize } = utils
const { ApplicationError, ValidationError } = utils.errors
const { MINIPROGRAM_APP_ID, MINIPROGRAM_SECRET } = process.env

const getService = (name: string) => {
  return strapi.plugin('users-permissions').service(name)
}

// TODO: omit some fields
const sanitizeUser = (user: any, ctx: any) => {
  const { auth } = ctx.state
  const userSchema = strapi.getModel('plugin::users-permissions.user')

  return sanitize.contentAPI.output(user, userSchema, { auth })
}

export default function (plugin: any) {
  // refs: https://github.com/strapi/strapi/blob/dec9156deac246d24ebb989c8c0cbf6e856fa331/packages/plugins/users-permissions/server/controllers/auth.js#L267-L354
  plugin.routes['content-api'].routes.push({
    method: 'POST',
    path: '/auth/miniprogram/login',
    handler: 'auth.miniprogramLogin',
    config: {
      auth: false,
      middlewares: ['plugin::users-permissions.rateLimit'],
      policies: [],
      prefix: '',
    },
  })
  plugin.controllers.auth.miniprogramLogin = async (ctx: any) => {
    const pluginStore = await strapi.store({
      type: 'plugin',
      name: 'users-permissions',
    })

    const settings = await pluginStore.get({ key: 'advanced' })

    const params = {
      ..._.pick<{ code: string }>(ctx.request.body, ['code']),
      provider: 'miniprogram',
    }

    // Validate the input
    if (!params.code) {
      throw new ValidationError('Missing code')
    }

    const role = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: settings.default_role } })

    if (!role) {
      throw new ApplicationError('Impossible to find the default role')
    }

    const { code } = params

    // refs: https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/code2Session.html
    const { data } = await axios.get(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${MINIPROGRAM_APP_ID}&secret=${MINIPROGRAM_SECRET}&js_code=${code}&grant_type=authorization_code`,
    )

    // TODO: SessionKey
    const { openid, unionid, session_key, errcode, errmsg } = data

    if (!openid) {
      throw new ApplicationError(`[${errcode}]: ${errmsg}`)
    }

    const existUser = await strapi
      .query('plugin::users-permissions.user')
      .findOne({
        where: { openid },
      })

    if (existUser) {
      return ctx.send({
        jwt: getService('jwt').issue({ id: existUser.id }),
        user: await sanitizeUser(existUser, ctx),
      })
    }

    const user = await getService('user').add({
      role: role.id,
      ...params,
    })

    return ctx.send({
      jwt: getService('jwt').issue({ id: user.id }),
      user: await sanitizeUser(user, ctx),
    })
  }

  return plugin
}
