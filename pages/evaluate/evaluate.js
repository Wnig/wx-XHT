import config from '../../utils/config.js'

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nodata: false,//人气推荐是否加载完
    pageNum: 0,
    textNum: 0,
    textareaValue: '',
    score: 0,
    imgList: [],//评价图片
    goods: [],
    progress: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      good: JSON.parse(options.item)
    });
    let item = this.data.good;

    for(let i = 0; i < item.skuProperty.length; i++) {
      if (item.skuProperty[i].field == 'departure') {
        item.departure = item.skuProperty[i].option;
      };
      if (item.skuProperty[i].field == 'departure_date') {
        item.departure_date = item.skuProperty[i].option;
      };
    };

    this.setData({
      good: item
    });

    console.log(this.data.good);
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

  input(e) {
    let len = e.detail.value.length;
    if (len > 100) {
      let data = e.detail.value.slice(0, 100)
      this.setData({ textareaValue: data, textNum: data.length })
    } else {
      this.setData({ textareaValue: e.detail.value, textNum: len })
    }
  },
  
  submit() {
    let postData = {
      orderId: this.data.good.id,
      productId: this.data.good.productId,
      productNormId: this.data.good.productNormId,
      fansUserId: this.data.good.fansUserId,
      score: this.data.score,
      content: this.data.textareaValue,
    };

    if (postData.content == '') {
      wx.showToast({
        title: '请填写评论',
        icon: 'none'
      })
      return;
    } else if (!postData.score) {
      wx.showToast({
        title: '请选择评分',
        icon: 'none'
      })
      return;
    };

    console.log(postData);

    app.dataPost({
      url: 'mobile/fansUser/commentContent', data: postData, success: this.commentContent
    });
  },

  commentContent(res) {
    console.log(res);
    
    if (res.status == 1) {
      this.data.progress = 0
      let commentId = res.data.commentId
      let uploadTask = []
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
              'model': 'MallOrderComment',
              'field': 'comment_Image_Id',
              'objectId': commentId
            },
            success: res => {
              console.log('success')
              console.log(res)
              this.data.progress++
              if (this.data.progress == this.data.imgList.length) {
                wx.hideLoading()
                wx.showToast({
                  title: '评论提交成功',
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

  getStar(e) {
    let score = e.currentTarget.dataset.index + 1;
    this.setData({ score: score })
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