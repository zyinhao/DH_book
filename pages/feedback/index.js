const app = getApp()

Page({
  data: {
    content: '',
    userInfo: null
  },

  onLoad: function() {
    let user = wx.getStorageSync('userInfo')
    this.setData({
      userInfo: user
    })
  },
  bindTextAreaBlur(e) {
    // console.log(e.detail.value)
    this.setData({
      content: e.detail.value
    })
  },

  handleSave(e) {
    let entity = {
      ...this.data.userInfo,
      content: this.data.content
    }

    wx.showLoading({
      title: '正在保存...',
    })

    wx.cloud.callFunction({
      name: 'saveData',
      data: {
        collection: 'tb_feedback',
        data: entity
      },
      complete: resp => {
        // console.log(resp)
        wx.hideLoading()

        this.setData({
          content: ''
        })

        wx.showToast({
          title: '感谢您的反馈',
          icon: 'success',
          duration: 2000
        })
      }
    })
  }
})