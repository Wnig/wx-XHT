import config from 'config.js'


function request (method, options) {

  wx.getNetworkType({
    success: function (res) {
      // 返回网络类型, 有效值：
      // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
      var networkType = res.networkType

      if (networkType == 'none') {
        wx.showToast({
          title: '当前网络不可用,请检查网络设置',
          icon: 'none'
        })
      } else {
        wx.showNavigationBarLoading()

        wx.request({
          url: config.restUrl + options.url,
          data: options.data,
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          method: method,
          success: function (res) {
            wx.hideNavigationBarLoading()
            res = res.data
            if (res.status == 0) { // 如果后台返回失败 提示失败信息
              wx.showToast({
                title: '服务器开小差! (' + res.msg + ')',
                icon: 'none'
              })
            }
            if (options.success) options.success(res)
          },
          fail: function (res) {
            wx.hideNavigationBarLoading()
            if (options.fail) options.fail()
          }
        })
      }
    }
  })

  wx.onNetworkStatusChange(function (res) {
    if (res.networkType == 'none') {
      wx.showToast({
        title: '当前网络不可用,请检查网络设置',
        icon: 'none'
      })
    }
  })
}

// get请求
function GET(options) {
  request('GET', options)
}

// post请求
function POST (options) {
  request('POST', options)
}

module.exports = {
  GET: GET,
  POST, POST
}