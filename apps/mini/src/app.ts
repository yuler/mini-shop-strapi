import mitt from 'mitt'

import {TABS} from './constants'
import {api as $api} from './api'

const emitter = mitt()

/**
 * Wrap for `wx.showLoading` & `wx.hideLoading`
 */
const $loading = {
  show(options?: MP.ShowLoadingOption) {
    wx.showLoading(Object.assign({mask: true}, options))
  },
  hide() {
    wx.hideLoading()
  },
}

export interface IApp {
  $system?: MP.SystemInfo

  $log: typeof $log
  $api: typeof $api
  $goto: typeof $goto
  $redirect: typeof $redirect
  $loading: typeof $loading
  $toast: typeof $toast
  $vibrate: typeof $vibrate

  $events: typeof emitter.all
  $on: typeof emitter.on
  $emit: typeof emitter.emit

  debug: boolean
  gloablData: any
}

App<IApp>({
  // Store System info
  $system: undefined,

  // Helper functions
  $log,
  $api,
  $goto,
  $redirect,
  $loading,
  $toast,
  $vibrate,

  // Events
  $events: emitter.all,
  $on: emitter.on,
  $emit: emitter.emit,

  // Global state & data
  debug: false,
  gloablData: {},

  onLaunch() {
    /**
     * Save system info to `$system`
     * @url https://developers.weixin.qq.com/miniprogram/dev/api/base/system/wx.getSystemInfo.html
     */
    wx.getSystemInfo()
      .then(data => {
        this.$system = data
      })
      .catch(_ => {})

    /**
     * Event emit to `home` page
     * @example events
     */
    setInterval(() => {
      this.$emit('app:tick', 'tick')
    }, 1000)
  },
})

/**
 * Wrap `console.log` with debug mode
 */
function $log(this: IApp, namespace: string, ...args: unknown[]) {
  getApp<IApp>().debug && console.log(`[${namespace}]: `, ...args)
}

/**
 * Wrap for `wx.navigateTo`
 * @param url The page path
 */
function $goto(url: string) {
  if (TABS.includes(url)) {
    wx.switchTab({url})
    return
  }
  wx.navigateTo({url})
}

/**
 * Wrap for `wx.redirectTo`
 * @param url The page path
 */
function $redirect(url: string) {
  wx.redirectTo({url})
}

/**
 * Wrap for `wx.showToast`
 * @param message The message to show
 * @param duration @default 2000 The duration of the toast
 */
function $toast(message: string, duration = 2000) {
  wx.showToast({
    title: message,
    icon: 'none',
    duration,
  })
}

/**
 * Wrap for `wx.vibrateShort` & `wx.vibrateLong`
 * @param type short(15ms) or long(400ms)
 * @param intensity string
 */
function $vibrate(
  type: 'short' | 'long' = 'short',
  intensity: 'heavy' | 'medium' | 'light' = 'medium',
) {
  if (type === 'short') {
    wx.vibrateShort({
      type: intensity,
    })
    return
  }

  wx.vibrateLong()
}
