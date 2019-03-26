const app = getApp()

Page({
  data: {
    userInfo: null
  },

  onLoad: function() {
    let userInfo = wx.getStorageSync('userInfo')
    console.log(userInfo)
    this.setData({
      userInfo: userInfo
    })
  },

  handleItem(event) {
    // console.log(event.currentTarget.dataset.name)
    let name = event.currentTarget.dataset.name
    wx.navigateTo({
      url: `../${name}/index`,
    })
  }
})