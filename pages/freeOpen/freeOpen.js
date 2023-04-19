import config from '../../utils/config.js'
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_first_action: true, //判断是否第一次点
    pFansUserId: '',
    shopName: '',
    shopAd: '',
    shopWx: '',
    imgUrl: '../../images/icons/zc_mrtx_x@3x.svg',
    imageId: '',
    // type: 1, //1: 只查找店铺信息，0：查找店铺和银行卡信息
    // isFirst: true, //判断是否第一次创建店铺
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      pFansUserId: options.userid,
      userFormId: options.formid
    });

    // this.judgeCreate();
  },

  //判断是否创建
  judgeCreate() {
    let postData = {
      fansUserId: app.globalData.userId,
      // type: this.data.type,
    };

    app.dataPost({ url: 'mobile/fansUserShop/userShopInfo', data: postData, success: this.userShopInfo });
  },

  userShopInfo(res) {
    console.log(res);

    if (res.data.userShopInfo) {
      this.setData({
        shopName: res.data.userShopInfo.shopName,
        shopAd: res.data.userShopInfo.adContent,
        shopWx: res.data.userShopInfo.wechatId,
        imgUrl: res.data.userShopInfo.logoImageUrl,
        logoImageId: res.data.userShopInfo.logoImageId,
        pFansUserId: res.data.userShopInfo.pFansUserId,
        userShopId: res.data.userShopInfo.id,
        isFirst: false,
      });
    } else {
      this.setData({
        isFirst: true
      });
    };
  },

  //上传图片
  upload() {
    let _this = this;

    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: res => {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        this.setData({
          imgUrl: res.tempFilePaths[0]
        });

        let model = 'MallFansUserShop';
        let field = 'shop_Logo_Image_Id';

        wx.uploadFile({
          url: config.restUrl + 'rest/upload/uploadImage', //仅为示例，非真实的接口地址
          filePath: _this.data.imgUrl,
          name: 'file',
          formData: {
            model: model,
            field: field
          },
          success: function (res) {
            console.log(res);
            var imgid = JSON.parse(res.data);

            _this.setData({
              imageId: imgid.imageId
            });
          }
        });
      }
    })
  },

  //进入填写页
  inPage(e) {
    let url = e.currentTarget.dataset.url;
    this.enterPage(url);
  },

  //提交
  enterNext() {
    let _this = this;
    if (this.data.is_first_action) {
      if (this.data.imgUrl == '') {
        this.tipsAlert('请选择店铺LOGO');
      } else if (this.data.shopName == '') {
        this.tipsAlert('请填写店铺名称');
      } else if (this.data.shopAd == '') {
        this.tipsAlert('请填写店铺广告语');
      } else if (this.data.shopWx == '') {
        this.tipsAlert('请填写个人微信号');
      } else {
        this.setData({
          is_first_action: false
        });
        console.log('当前点击:', this.data.is_first_action);
        // if (this.data.isFirst) {
          let postData = {
            businessId: app.globalData.businessId,
            fansUserId: app.globalData.userId,
            logoImageId: this.data.imageId,
            shopName: this.data.shopName,
            adContent: this.data.shopAd,
            wechatId: this.data.shopWx,
            pFansUserId: this.data.pFansUserId,
            formId: this.data.userFormId
          }

          app.dataPost({ url: 'mobile/fansUserShop/openShop', data: postData, success: _this.getShopInfo });
        // } 
        
        // else {
        //   let postData = {
        //     fansUserId: app.globalData.userId,
        //     pFansUserId: this.data.pFansUserId,
        //     id: this.data.userShopId,
        //     logoImageId: this.data.logoImageId,
        //     shopName: this.data.shopName,
        //     wechatId: this.data.shopWx,
        //     adContent: this.data.shopAd,
        //     formId: this.data.userFormId
        //   };

        //   console.log(postData);

        //   app.dataPost({ url: 'mobile/fansUserShop/updateUserShopInfo', data: postData, success: this.updateUserShopInfo });
        // };
      }
    };
  },

  //提交店铺信息
  getShopInfo(res) {
    console.log(res);
    wx.showLoading({
      title: '信息提交中',
    });
    if (res.data == '' && res.status == '1') {
      let url = '../createSuccess/createSuccess';
      app.globalData.isOpenShop = 1;
      wx.hideLoading();
      this.setData({
        is_first_action: true
      });
      wx.reLaunch({
        url: url,
      });
    } else {
      wx.hideLoading();
      this.setData({
        is_first_action: true
      });
      wx.showToast({
        title: res.data.msg,
        icon: 'none'
      })
    };
  },

  //第二次进入-提交信息
  updateUserShopInfo(res) {
    console.log(res);

    if (res.status == 1) {
      let url = '../bindingInfo/bindingInfo?usershopid=' + this.data.userShopId + '&formid=' + this.data.userFormId;
      this.setData({
        is_first_action: true
      });
      wx.navigateTo({
        url: url
      });
    };
  },

  // 弹窗提示
  tipsAlert(str) {
    wx.showToast({
      title: str,
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * 进入页面
   */
  enterPage(url) {
    if (url)
      wx.navigateTo({
        url: url
      })
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
    // wx.navigateTo({
    //   url: '../creatingShop/creatingShop'
    // });
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