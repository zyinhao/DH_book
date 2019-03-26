import * as echarts from '../../ec-canvas/echarts';
const app = getApp();
let optionData = {
  labels: [],
  data: []
}

Page({

  onReady: function() {
    // 获取组件
    this.ecComponent = this.selectComponent('#mychart-dom-bar');
  },

  onLoad() {
    this.getDataList()
  },

  data: {
    ec: {
      // 将 lazyLoad 设为 true 后，需要手动初始化图表
      lazyLoad: true
    },
    isLoaded: false,
    isDisposed: false,
    tabIndex: 1
  },
  getDataList(index) {
    wx.showLoading({
      title: '正在分析...',
    })

    let _this = this
    let type = index || this.data.tabIndex
    wx.cloud.callFunction({
      name: 'getUserDataList',
      data: {
        collection: 'tb_book_item',
        filter: {
          typeValue: +type
        }
      },
      complete: resp => {
        // console.log(resp.result)

        resp.result.data.forEach((item, index) => {
          // console.log(optionData.labels)
          // console.log(item.incomeName)
          let dataIndex = optionData.labels.indexOf(item.incomeName)
          // console.log(dataIndex)
          // 查找已经有的数据
          if (dataIndex <= -1) {
            optionData.labels.push(item.incomeName)
            optionData.data.push({
              name: item.incomeName,
              value: parseFloat(item.count)
            })
          } else {
            optionData.data[dataIndex].value += parseFloat(item.count)
          }
        })

        // console.log(optionData)
        wx.hideLoading()
        _this.init()
      }
    })
  },

  // 点击按钮后初始化图表
  init() {
    this.ecComponent.init((canvas, width, height) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      this.setOption(chart);

      // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
      this.chart = chart;

      this.setData({
        isLoaded: true,
        isDisposed: false
      });

      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
  },

  handleTab(event) {
    let index = event.currentTarget.dataset.index
    this.setData({
      tabIndex: index
    })
    this.getDataList(index)
  },

  dispose() {
    if (this.chart) {
      this.chart.dispose();
    }

    this.setData({
      isDisposed: true
    });
  },
  // 设置选项
  setOption(chart) {
    let _this = this
    const option = {
      title: {
        text: '收入支出统计',
        subtext: '',
        x: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: "{a} {b} : {c} ({d}%)"
      },
      legend: {
        orient: 'vertical',
        x: 'left',
        data: optionData.labels
      },
      toolbox: {
        show: true,
        feature: {
          magicType: {
            show: true,
            type: ['pie', 'funnel'],
            option: {
              funnel: {
                x: '25%',
                width: '50%',
                funnelAlign: 'left',
                max: 1548
              }
            }
          }
        }
      },
      calculable: true,
      series: [{
        name: '',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: optionData.data
      }]
    };

    chart.setOption(option);
  }
});