import {IApp} from './app'

interface Data {
  $loading: boolean
  $error: null | string | Error
}

interface Option {
  $app: IApp
}

/**
 * Override the `Page` constructor options
 * @type {WechatMiniprogram.Page.Options}
 */
type MPPageOptions<
  TData extends MP.Page.DataOption,
  TCustom extends MP.Page.CustomOption,
> = (TCustom &
  Partial<MP.Page.Data<TData>> &
  Partial<MP.Page.ILifetime> & {
    options?: MP.Component.ComponentOptions
  }) &
  ThisType<MP.Page.Instance<TData & Data, TCustom & Option>>

export default function enchangePage<T = {}, U = {}>(
  options: MPPageOptions<T, U>,
) {
  // Intercept `onLoad`
  const originOnLoad = options.onLoad
  const onLoad: MP.Page.ILifetime['onLoad'] = async function (
    this: any,
    query,
  ) {
    getApp<IApp>().$log('enchangePage => onLoad', {query})

    // Login by wx.login
    if (!wx.getStorageSync('TOKEN')) {
      try {
        // Login
        const $app = getApp<IApp>()
        const {code} = await wx.login()
        const {jwt: token} = await $app.$api({
          url: 'auth/miniprogram/login',
          method: 'POST',
          data: {
            code,
          },
        })
        wx.setStorageSync('TOKEN', token)
      } catch {}
    }

    originOnLoad?.call(this, query)
  }

  options = {
    ...options,
    data: {
      $loading: false,
      $error: null,
      ...options.data,
    },
    onLoad,
  }

  Page<T, U>(options)
}
