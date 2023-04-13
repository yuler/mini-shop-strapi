import qs from 'qs'
import type {IApp} from '../../app'
import enchangePage from '../../enchange-page'

const $app = getApp<IApp>()

enchangePage({
  data: {
    product: null,
  },
  async onLoad(event: any) {
    const {id} = event
    const query = qs.stringify(
      {
        populate: {
          poster: {
            fields: ['url'],
          },
          carousels: {
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
  gotoConfirm(event: MP.TouchEvent) {
    const {id} = event.currentTarget.dataset
    $app.$goto(`/pages/product/confirm?id=${id}`)
  },
})
