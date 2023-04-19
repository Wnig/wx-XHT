import config from '../../utils/config.js'
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isKfMask: false, //联系客服弹窗
    reasonArray: [],
    reasonNameId: '',
    selReason: '请选择',
    imgList: [],//评价图片
    goods: [],
    progress: 0,
    content: '', //详情描述
    textNum: 0, //当前文本长度
    type: '', //订单类别
    frontCancelOrderImages: [], //图片列表
    frontCancelOrderReason: '', //详情内容
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('取消订单详情:::', options);
    let str = '';
    if (options.type == '1') {
      this.setData({
        type: 1
      });
      str = '取消订单';
      console.log('取消订单*****');
      this.setData({
        orderId: options.id
      });
    };

    if (options.type == '2') {
      this.setData({
        type: 2
      });
      str = '取消详情';
      console.log('取消详情*****');
      this.setData({
        orderId: options.id
      });
      this.orderDetail();
    };

    this.setTitleText(str);
  },

  //订单详情
  orderDetail() {
    console.log(this.data.orderId);
    app.dataGet({ url: 'mobile/order/cancelOrderDetail?orderId=' + this.data.orderId, success: this.cancelOrderDetail });
  },

  cancelOrderDetail(res) {
    console.log(res);
    this.setData({
      frontCancelOrderImages: res.data.frontCancelOrderImages,
      content: res.data.frontCancelOrderReason
    });
  },

  previewImg(idx) {
    wx.previewImage({
      current: this.data.frontCancelOrderImages[idx], // 当前显示图片的http链接
      urls: this.data.frontCancelOrderImages // 需要预览的图片http链接列表
    })
  },

  //获取formid
  postForm(e) {
    console.log('商品详情formid:::', e.detail.formId);

    this.setData({
      cancelOrderFormId: e.detail.formId
    });
  },

  //获取详情内容
  input(e) {
    let len = e.detail.value.length;
    if (len > 100) {
      let data = e.detail.value.slice(0, 100)
      this.setData({ content: data, textNum: data.length })
    } else {
      this.setData({ content: e.detail.value, textNum: len })
    }
  },

  //提交取消订单
  cancelOrder() {
    if (this.data.content == '') {
      wx.showToast({
        title: '详情描述不能为空',
        icon: 'none'
      });
    } else {
      let postData = {
        orderId: this.data.orderId,
        frontCancelOrderReason: this.data.content,
        cancelOrderFormId: this.data.cancelOrderFormId,
      };

      console.log('取消订单:::', postData);

      app.dataPost({ url: 'mobile/order/frontCancelOrder', data: postData, success: this.frontCancelOrder }); 
    } 
  },

  //客服蒙弹窗
  isMaskShow() {
    this.setData({
      isKfMask: !this.data.isKfMask
    });
  },

  // 电话客服
  callKf() {
    let customerTelephone = app.globalData.serviceField.customerTelephone;
    wx.makePhoneCall({
      phoneNumber: customerTelephone //仅为示例，并非真实的电话号码
    })
  },

  /**
   * 动态设置顶部title
   */
  setTitleText(word) {
    wx.setNavigationBarTitle({
      title: word
    });
  },

  //取消原因选择
  bindPickerChange(e) {
    for (let i = 0; i < this.data.reasonArray.length; i++) {
      if (i == e.detail.value) {
        this.setData({
          reasonNameId: this.data.reasonArray[i].reasonNameId
        });
      };
    };

    this.setData({
      selBank: '',
      index: e.detail.value
    });
  },

  upload() {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: res => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        this.data.imgList.push(res.tempFilePaths[0])
        this.setData({ imgList: this.data.imgList })
      }
    })
  },

  deleteImg(e) {
    this.data.imgList.splice((e.currentTarget.dataset.idx), 1);
    this.data.progress--;
    this.setData({ imgList: this.data.imgList, progress: this.data.progress })
  },

  previewImg(idx) {
    wx.previewImage({
      current: this.data.imgList[idx], // 当前显示图片的http链接
      urls: this.data.imgList // 需要预览的图片http链接列表
    })
  },

  frontCancelOrder(res) {
    console.log(res);

    if (res.status == 1) {
      this.data.progress = 0;
      let commentId = res.data.commentId;
      let uploadTask = [];
      let _this = this;
      if (this.data.imgList && this.data.imgList.length) {
        wx.showLoading({
          title: '图片上传中',
          mask: true,
        })
        for (let i = 0; i < this.data.imgList.length; i++) {
          uploadTask[i] = wx.uploadFile({
            url: config.restUrl + '/rest/upload/batchUpdateImage',
            filePath: this.data.imgList[i],
            name: 'file',
            formData: {
              'fileName': '123223',
              'model': 'MallOrder', 
              'field': 'front_Cancel_Order_Image_Id',
              'objectId': _this.data.orderId
            },
            success: res => {
              console.log('success')
              console.log(res)
              this.data.progress++
              if (this.data.progress == this.data.imgList.length) {
                wx.hideLoading()
                wx.showToast({
                  title: '提交成功',
                  icon: 'none',
                  duration: 2000
                })
                setTimeout(() => {
                  wx.navigateBack({
                    delta: 1
                  })
                }, 1000)
              }
            },
            fail: res => {
              wx.hideLoading()
              wx.showToast({
                title: '图片上传失败',
                icon: 'none'
              })
              console.log('fail')
              console.log(res)
            },
            complete: res => {
              wx.hideLoading()
              console.log('complete')
              console.log(res)
            }
          })

          uploadTask[i].onProgressUpdate((res) => {
            console.log('上传进度', res.progress)
            console.log('已经上传的数据长度', res.totalBytesSent)
            console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
          })

        }
      } else {
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      }
    };
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
})