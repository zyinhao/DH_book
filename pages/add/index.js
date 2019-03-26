const app = getApp()

Page({
  data: {
    books: [],
    types: [{
      name: '收入',
      value: 1
    }, {
      name: '支出',
      value: 2
    }],
    incomeTypes: [], // 收入类型
    tmpIncomeTypes: [],
    expenditureTypes: [], // 支出类型
    typeValue: 0,
    bookIndex: 0,
    incomeIndex: 0,
    date: null
  },

  onLoad: function() {
    this.setData({
      date: this.getDefaultDate()
    })

    let _this = this

    wx.cloud.callFunction({
      name: 'getUserDataList',
      data: {
        collection: 'tb_book'
      },
      complete: resp => {
        _this.setData({
          books: resp.result.data
        })
      }
    })

    wx.cloud.callFunction({
      name: 'getIncomeType',
      complete: resp => {
        let tmpInCome = []
        let tmpExpenditure = []
        // 分类筛选出收入类型和支出类型并复制
        resp.result.data.forEach(type => {

          if (type.type === 1) {
            tmpInCome.push(type)
          } else {
            tmpExpenditure.push(type)
          }
        })

        this.setData({
          incomeTypes: tmpInCome,
          tmpIncomeTypes: tmpInCome,
          expenditureTypes: tmpExpenditure
        })
      }
    })
  },

  // 初始化表单数据
  initFormData() {
    this.setData({
      typeValue: 0,
      bookIndex: 0,
      incomeIndex: 0,
      desc:'',
      count:'',
      date: this.getDefaultDate()
    })
  },

  // 账本选择发生变化
  bindBookChange(event) {
    this.setData({
      bookIndex: event.detail.value
    })
  },

  bindIncomeChange(event) {
    this.setData({
      incomeIndex: event.detail.value
    })
  },

  bindDateChange(event) {
    this.setData({
      date: event.detail.value
    })
  },

  // 处理收支类型发生变化
  bindTypeChange(event) {
    this.setData({
      typeValue: event.detail.value
    })

    // 根据收支类型变化动态给收支小类赋值
    if (this.data.types[event.detail.value].value == 1) {
      this.setData({
        incomeTypes: this.data.tmpIncomeTypes
      })
    } else {
      this.setData({
        incomeTypes: this.data.expenditureTypes
      })
    }

  },
  // 提交表单
  formSubmit(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    let _this = this
    let form = e.detail.value
    let curBook = this.data.books[form.bookIndex]
    let curType = this.data.types[form.typeValue]
    let curIncome = this.data.incomeTypes[form.incomeIndex]
    let bookItem = {
      bookName: curBook.name, // 账本名称
      bookId: curBook._id, // 账本ID
      typeValue: curType.value, // 收支类型名称
      typeText: curType.name, // 收支类型
      incomeId: curIncome._id, // 收支小类
      incomeName: curIncome.name, // 收支小类名称
      count: form.count, // 收支数量
      date: new Date(form.date).getTime(), // 收支日期
      desc: form.desc // 收支描述
    }

    // console.log(new Date(form.date).toLocaleDateString())
    // console.log(new Date(form.date).toDateString())
    // console.log(new Date(form.date).toLocaleString())
    // console.log(new Date(form.date).toLocaleTimeString())
    // console.log(new Date(form.date).toTimeString())
    // console.log(new Date(form.date).toISOString())
    // console.log(new Date(form.date).toUTCString())

    if (form.count <= 0) {
      wx.showToast({
        title: '请输入金额',
        icon: 'none',
        duration: 2000
      })
      return
    }

    wx.showLoading({
      title: '正在保存...',
    })

    wx.cloud.callFunction({
      name: 'saveData',
      data: {
        collection: 'tb_book_item',
        data: bookItem
      },
      complete: resp => {
        // console.log(resp)
        wx.setStorageSync('updateMainRecord', true)
        wx.hideLoading()
        wx.showModal({
          title: resp.result.errMsg,
          content: '是否再记一笔？',
          success(res) {
            if (res.confirm) {
              // console.log('用户点击确定')
              _this.initFormData()
            } else if (res.cancel) {
              // console.log('用户点击取消')
              wx.switchTab({
                url: '../main/index'
              })
            }
          }
        })

      }
    })
  },

  getDefaultDate() {
    let time = new Date()
    let month = time.getMonth() + 1
    let date = time.getDate()
    return `${time.getFullYear()}-${month<10?'0'+month:month}-${date<10?'0'+date:date}`
  }
})