import qs from 'qs'
import type {IApp} from '../../app'
import enchangePage from '../../enchange-page'

const $app = getApp<IApp>()

enchangePage({
  data: {
    id: '',
    product: null,
    quantity: 1,
    remark: '',
  },
  async onLoad(options: any) {
    const {id} = options
    this.setData({id})

    const query = qs.stringify(
      {
        populate: {
          poster: {
            fields: ['url'],
          },
        },
      },
      {
        encode: false,
      },
    )
    const {data} = await $app.$api({
      url: `products/${id}?${query}`,
      method: 'GET',
    })
    this.setData({product: data})
  },

  // Methods
  async onChooseAddress() {
    // TODO: refs: https://developers.weixin.qq.com/miniprogram/dev/api/open-api/address/wx.chooseAddress.html
    const data = await wx.chooseAddress()
    console.log(data)
  },
  onPlus() {
    this.setData({quantity: this.data.quantity + 1})
  },
  onMinus() {
    if (this.data.quantity === 1) {
      return $app.$toast('❌  不能再少了 ~')
    }
    this.setData({quantity: this.data.quantity - 1})
  },
  onSubmit() {
    // TODO: validate
    const {id, quantity, remark} = this.data
    console.log({id, quantity, remark})
  },
})
