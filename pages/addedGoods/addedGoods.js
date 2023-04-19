//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoad: false, //判断数据是否加载完成
    nowScrollTop: 0, //当前滚动位置
    selNum: 0,
    lowtohigh: 0,
    hotAll: false,
    selHotNum: 0,
    types: 0, //头部筛选-默认-0-全部
    productCategoryId: '', //分类id
    tourDestinationId: '', //目的地id
    tourId: '', //目的地id
    pageNum: 0, //当前页
    pageSize: 8, //显示几条
    totalPage: 0, //总页数
    categoryProduct: [], //分类列表
    hasMore: true,//列表是否加载完
    isTopMenu: 0, //判断是否点击头部菜单
    categoryList: [], //分类列表
    topMenu: ['全部分类', '销量', '佣金'],
    name: '', //头部选择地点显示当前地点名称
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let tourId = this.data.tourDestinationId;
    console.log(options);
    this.setData({
      fansUserShopId: options.shopid
    });
    console.log(this.data.fansUserShopId);
    this._load(tourId);
  },

  _load(tourId) {
    let postData = {
      businessId: app.globalData.businessId,
      productCategoryId: tourId,
      tourDestinationId: '',
      fansUserShopId: this.data.fansUserShopId,
      type: this.data.types,
      pageNum: this.data.pageNum, 
      pageSize: this.data.pageSize
    };

    console.log('上架:', postData);
    
    app.dataPost({ url: 'rest/productCategory/category', data: postData, success: this.getComData });
  },

  getComData(res) {
    console.log(res);
    //分类列表
    let categoryList = this.data.categoryList;

    if (res.data.categoryList) {
      this.setData({
        categoryList: res.data.categoryList.reverse()
      });
    };

    
    if (!res.data.categoryProduct) {
      // 首先判断是否有返回数据 没有返回数据则表示没有更多数据了 要将hasMore设为false
      this.setData({ hasMore: false });
      return;
    }
    
    if (res.data.categoryProduct.length) {
      // 将pageNum 加一 然后判断返回的data长度是否小于pageSize 小于pageSize说明无更多数据要将hasMore设为false
      let categoryProduct = this.data.categoryProduct;
      let pageNum = this.data.pageNum;
      let pageSize = this.data.pageSize;


      if (this.data.isTopMenu == 0) {
        res.data.categoryProduct.forEach(arr => {
          categoryProduct.push(arr);
        });
      } else {
        categoryProduct = res.data.categoryProduct;
      };

      if (pageNum + 1 == res.data.totalPage && (res.data.categoryProduct.length < pageSize || res.data.categoryProduct.length == pageSize)) {
        this.setData({ hasMore: false })
      };

      if (pageNum + 1 > res.data.totalPage) {
        this.setData({ hasMore: false, isLoad: true })
      } else {
        pageNum++;
        this.setData({ pageNum: pageNum, categoryProduct: categoryProduct, isLoad: true });
      };
    }
  },

  //头部菜单切换
  selMenuTab(e) {
    let lowtohigh = this.data.lowtohigh;
    let hotAll = this.data.hotAll;

    this.setData({
      selNum: e.target.dataset.index
    });

    e.target.dataset.index == 0 ? this.setData({ hotAll: !hotAll }) : this.setData({ hotAll: false });

    if (e.target.dataset.index == 2) {
      //types - 4 - 升序; 5 - 降序
      lowtohigh == 1 ? this.setData({ lowtohigh: 2, types: 4 }) : this.setData({ lowtohigh: 1, types: 5 });
    } else {
      if (e.target.dataset.index == 1) {
        this.setData({ types: e.target.dataset.index });
      };
      this.setData({ lowtohigh: 0 });
    };

    this.setData({
      pageNum: 0,
      isTopMenu: 1,
      hasMore: true
    });

    this._load(this.data.tourDestinationId);
  },

  //热门选择
  selHotTab(e) {
    this.setData({
      name: e.target.dataset.name,
      tourId: e.target.dataset.id,
      selHotNum: e.target.dataset.index,
      tourDestinationId: e.target.dataset.id
    });
  },

  //热门选择-取消-确定-按钮
  hotBtns(e) {
    let _type = e.target.dataset.type;
    let hotAll = this.data.hotAll;

    this.setData({
      hotAll: !hotAll
    });

    if (_type == 'yes') {
      this.setData({
        types: 0,
        isTopMenu: 1,
        pageNum: 0,
        categoryProduct: [], 
        tourDestinationId: e.target.dataset.desid
      });
      if (this.data.name == '全部' || this.data.name == '') {
        this.setData({
          'topMenu[0]': '全部分类'
        });
      } else {
        this.setData({
          'topMenu[0]': this.data.name
        });
      };

      console.log('当前城市', this.data.topMenu[0]);
      this._load(this.data.tourDestinationId);
    };
    if (_type == 'no') {
      this.setData({
        types: 0,
        isTopMenu: 1,
        pageNum: 0,
        categoryProduct: [], 
        tourDestinationId: ''
      });
      this._load(this.data.tourDestinationId);
    };
  },

  //进入详情页
  enterDetail(e) {
    let commodity = e.currentTarget.dataset.id;
    let isShoper = 'yes';
    let formid = '';

    wx.navigateTo({
      url: '../details/details?id=' + JSON.stringify(commodity) + '&ishop=' + isShoper + '&shopid=' + this.data.fansUserShopId + '&formid=' + formid
    });
  },

  //移出店铺-加入店铺
  removeShop(e) {
    let types = e.currentTarget.dataset.join;
    let join = 0;
    types ? join = 0 : join = 1;

    let postData = {
      fansUserShopId: this.data.fansUserShopId,
      productId: e.currentTarget.dataset.id,
      type: join,
    };

    app.dataPost({ url: 'mobile/fansUserShop/shopAddOrDeleteProduct', data: postData, success: this.shopAddOrDeleteProduct });
  },

  shopAddOrDeleteProduct(res) {
    this.setData({
      isTopMenu: 1,
      pageNum: 0
    });
    this._load(this.data.tourDestinationId);
    wx.pageScrollTo({
      scrollTop: this.data.nowScrollTop
    });
    console.log(this.data.nowScrollTop);
  },

  //滚动事件
  onPageScroll(e) {
    this.setData({
      nowScrollTop: e.scrollTop
    });
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
    this.setData({ isTopMenu: 1, hasMore: true, pageNum: 0, categoryProduct: [] });
    this._load(this.data.tourDestinationId);
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
    this.setData({
      isTopMenu: 0
    });
    this._load(this.data.tourDestinationId);
  },
})