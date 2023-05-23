(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __decorateClass = (decorators, target, key, kind) => {
    var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
    for (var i = decorators.length - 1, decorator; i >= 0; i--)
      if (decorator = decorators[i])
        result = (kind ? decorator(target, key, result) : decorator(result)) || result;
    if (kind && result)
      __defProp(target, key, result);
    return result;
  };

  // src/Fruit.ts
  var { regClass, property } = Laya;
  var Fruit = class extends Laya.Script {
    constructor() {
      super();
      this.index = 0;
      this.tag = "0";
    }
    onStart() {
    }
    //初始化状态（当前box索引，按钮图片）
    initState(type, i) {
      this.index = i;
      this.owner.name = "Fruit" + (i + 1);
      this.tag = type.toString();
      let iconPath = "resources/ui/game/fruit_" + type + ".png";
      Laya.loader.load(iconPath).then((res) => {
        this.owner.texture = res;
      });
    }
    setIndex(i) {
      this.index = i;
      this.owner.name = "Fruit" + (i + 1);
    }
    //设置透明度
    setAltha() {
      this.owner.alpha = 0.3;
    }
    //恢复透明度
    recoverAlpha() {
      this.owner.alpha = 1;
    }
  };
  __name(Fruit, "Fruit");
  Fruit = __decorateClass([
    regClass("71cd39b1-dada-4ef6-8746-3ac17095370b", "../src/Fruit.ts")
  ], Fruit);

  // src/Over.ts
  var { regClass: regClass2, property: property2 } = Laya;
  var Over = class extends Laya.Script {
    constructor() {
      super();
      this.localCoin = 0;
    }
    onAwake() {
    }
    onEnable() {
      this.backBtn.on(Laya.Event.CLICK, this, () => {
        this.backBegin();
      });
    }
    onStart() {
    }
    //coins（分数、金币），type 是否通关
    showEndUI(coins = 0, type = false) {
      let str1 = "\u606D\u559C\u60A8\u901A\u8FC7\u5566\uFF0C\u60A8\u7684\u5206\u6570\u662F\uFF1A" + coins + "\n\n\u60A8\u83B7\u5F97\u7684\u5956\u52B1\u662F\uFF1A" + coins + "\u91D1\u5E01";
      let str2 = "\u771F\u9057\u61BE\uFF0C\u60A8\u6CA1\u6709\u901A\u5173\uFF0C\u7EE7\u7EED\u52AA\u529B\u5427";
      let width = 800;
      let str = type ? str1 : str2;
      this.endLabel.text = str;
      this.endLabel.wordWrap = true;
      this.endLabel.x = this.endLabel.width - width >> 1;
      if (type)
        this.storageCoin(coins);
    }
    //存储金币
    storageCoin(coins) {
      this.localCoin = Number(Laya.LocalStorage.getItem("weiqing"));
      if (this.localCoin == null || this.localCoin.toString() == "")
        this.localCoin = 0;
      this.localCoin += coins;
      Laya.LocalStorage.setItem("weiqing", this.localCoin.toString());
    }
    //返回主界面
    backBegin() {
      Laya.loader.load("resources/prefab/begin/begin_scene.lh", Laya.PrefabImpl, null).then((res) => {
        let beginBox = res.create();
        let owner = this.owner;
        owner.parent.addChild(beginBox);
        this.owner.destroy();
      });
    }
  };
  __name(Over, "Over");
  __decorateClass([
    property2({ type: Laya.Button })
  ], Over.prototype, "backBtn", 2);
  __decorateClass([
    property2({ type: Laya.Label })
  ], Over.prototype, "endLabel", 2);
  Over = __decorateClass([
    regClass2("45f487d1-73ef-46a8-9004-f0f2f2fb0342", "../src/Over.ts")
  ], Over);

  // src/Game.ts
  var { regClass: regClass3, property: property3 } = Laya;
  var Game = class extends Laya.Script {
    //困难难度方格移动
    constructor() {
      super();
      this.data = null;
      this.type = "1";
      this.localCoin = 0;
      //当前金币数量
      this.allTime = 0;
      //当前关卡总时间
      this.curTime = 0;
      //当前关卡时间
      this.curGrade = 1;
      //当前关卡等级
      this.curScore = 0;
      //当前分数
      this.addScore = 0;
      //增加分数
      this.curTag = "-1";
      //当前按钮图片tag类型
      this.preIndex = -1;
      //前一个按钮图片索引
      this.curBoxNum = 0;
      //当前加载的箱子数量
      this.fruitPool = [];
      //按钮存储
      this.allPath = [];
      //按钮方格二维数组
      this.gameState = false;
      //游戏状态（是否在游戏中）
      this.gridSize = 0;
      //边界
      this.linePath = [];
      //存储线点(符合消除规则判断能够消除)
      this.canTouch = true;
      //是否能点击按钮(消除方格时保护)
      this.tipsNum = 3;
      //关卡提示数量
      this.boomCoins = 0;
      //关卡使用炸弹消耗的金币
      this.randomNum = 0;
      //随机图片的tag类型种类
      this.maxGrade = 0;
      //最大关卡
      this.isMoving = false;
    }
    onAwake() {
      Laya.loader.load("json/gameCfg.json", Laya.Handler.create(this, this.levelJsonLoaded), null, Laya.Loader.JSON);
    }
    onEnable() {
      this.findBtn.on(Laya.Event.CLICK, this, this.onFindBtn);
      this.boomBtn.on(Laya.Event.CLICK, this, this.onBoomBtn);
      this.backBtn.on(Laya.Event.CLICK, this, this.onBackBtn);
    }
    //读取数据表
    levelJsonLoaded() {
      let datas = Laya.loader.getRes("json/gameCfg.json").data;
      this.data = this.type == "1" ? datas.level1 : datas.level2;
      this.initFruit();
      this.gameState = true;
    }
    //初始化金币、分数等数据
    initData(type) {
      this.type = type;
      this.curGrade = 1;
      let localCoin = Laya.LocalStorage.getItem("weiqing");
      if (localCoin == null || localCoin == "" || localCoin == "NaN") {
        this.localCoin = 0;
        Laya.LocalStorage.setItem("weiqing", this.localCoin.toString());
      } else {
        this.localCoin = Number(localCoin);
      }
    }
    //初始化关卡水果数量
    initFruit() {
      let fruitPool = Laya.Pool.getPoolBySign("fruit");
      this.gradeData();
      let boxNum = this.curBoxNum == 0 ? this.data[this.curGrade].boxNum : this.data[this.curGrade].boxNum - this.curBoxNum;
      Laya.loader.load("resources/prefab/game/game_btn_fruit.lh", Laya.PrefabImpl, null).then((res) => {
        for (let i = 0; i < boxNum; i++) {
          let fruit = res.create();
          fruitPool.push(fruit);
        }
        this.createFruit();
      });
    }
    //获取关卡数据
    gradeData() {
      this.bound = new Laya.Vector2(this.data[this.curGrade].boundX, this.data[this.curGrade].boundY);
      this.gridSize = this.data[this.curGrade].size;
      this.allTime = this.data[this.curGrade].times;
      this.boomCoins = this.data[this.curGrade].boom;
      this.randomNum = this.data[this.curGrade].randomNum;
      this.addScore = this.data[this.curGrade].addscore;
      this.maxGrade = Object.keys(this.data).length;
      this.curTime = this.allTime;
      this.showProp();
    }
    //变更分数
    showScore(score) {
      this.curScore += score;
      this.score.text = "\u5F53\u524D\u5206\u6570\uFF1A" + this.curScore;
    }
    //更新道具，标题
    showProp() {
      this.coins.text = "\u5F53\u524D\u91D1\u5E01\uFF1A" + this.localCoin;
      this.score.text = "\u5F53\u524D\u5206\u6570\uFF1A" + this.curScore;
      this.findTimes.text = "\u6B21\u6570\uFF1A" + this.tipsNum.toString();
      this.boomCum.text = "\u91D1\u5E01:" + this.boomCoins.toString();
      this.grade.text = "\u7B2C" + this.curGrade.toString() + "\u5173";
    }
    //创建关卡水果
    createFruit() {
      let random = 0;
      let createNum = 0;
      let fruitPool = Laya.Pool.getPoolBySign("fruit");
      let idx = 0;
      this.fruitGroup.width = this.bound.x * this.gridSize;
      this.fruitGroup.height = this.bound.y * this.gridSize;
      this.createAllPath();
      for (let j = 0; j < this.bound.y; j++) {
        for (let i = 0; i < this.bound.x; i++) {
          idx = i + j * this.bound.y;
          let fruitBox = fruitPool[idx];
          fruitBox.x = i * this.gridSize;
          fruitBox.y = j * this.gridSize;
          this.allPath[j][i] = 1;
          if (createNum % 2 == 0)
            random++;
          if (random == this.randomNum)
            random = 1;
          fruitPool[idx].getComponent(Fruit).initState(random, idx);
          createNum++;
        }
      }
      this.randomFruit();
    }
    //创建path
    createAllPath() {
      for (let i = -1; i < this.bound.x + 1; i++) {
        this.allPath[i] = [];
        for (let j = -1; j < this.bound.y + 1; j++) {
          this.allPath[i][j] = 0;
        }
      }
    }
    //打乱顺序
    randomFruit() {
      let fruitPool = Laya.Pool.getPoolBySign("fruit");
      let poolLen = fruitPool.length;
      for (let i = 0; i < poolLen; i++) {
        let idxBtn = fruitPool[i];
        let random = Math.floor(Math.random() * (poolLen - 1));
        let radBtn = fruitPool[random];
        let initFruit = idxBtn;
        let initPos = new Laya.Vector2(idxBtn.x, idxBtn.y);
        idxBtn.x = radBtn.x;
        idxBtn.y = radBtn.y;
        radBtn.x = initPos.x;
        radBtn.y = initPos.y;
        fruitPool[i] = fruitPool[random];
        fruitPool[random] = initFruit;
      }
      this.fruitPool = fruitPool;
      for (let i = 0; i < fruitPool.length; i++) {
        let btn = this.fruitPool[i];
        btn.getComponent(Fruit).setIndex(i);
        btn.on(Laya.Event.CLICK, this, this.clickBlockBtn);
        this.fruitGroup.addChild(btn);
      }
    }
    //坐标转化方格
    gridTrans(posX, posY) {
      let path = [posX / this.gridSize, posY / this.gridSize];
      return path;
    }
    //点击按钮，判断是否显示索引底色和消除按钮
    clickBlockBtn(e) {
      let scr = e.target.getComponent(Fruit);
      if (!this.canTouch || this.preIndex == scr.index || this.isMoving)
        return;
      console.log(scr.index, scr.tag, this.preIndex);
      scr.setAltha();
      if (this.curTag == scr.tag) {
        let pos1 = this.gridTrans(this.fruitPool[scr.index].x, this.fruitPool[scr.index].y);
        let pos2 = this.gridTrans(this.fruitPool[this.preIndex].x, this.fruitPool[this.preIndex].y);
        let state = this.checkRemSta(pos1, pos2);
        if (state) {
          this.createLine();
          this.canTouch = false;
          Laya.timer.once(400, this, () => {
            this.removeFruit(scr.index, this.preIndex);
            this.removeLine(this.linePath.length - 1);
            this.canTouch = true;
            this.initState();
          });
          return;
        }
      }
      this.initState(scr.index, scr.tag, true);
    }
    //初始化索引状态和透明度 index当前按钮索引、tag当前按钮标签(图片类型)、type按钮是否消除
    initState(index = -1, tag = "-1", type = false) {
      let pre_scr = null;
      if (type) {
        if (this.preIndex != -1)
          pre_scr = this.fruitPool[this.preIndex].getComponent(Fruit);
        if (pre_scr)
          pre_scr.recoverAlpha();
      }
      this.preIndex = index;
      this.curTag = tag;
      this.checkEnd();
    }
    //检测是否结束
    checkEnd() {
      let childLength = this.fruitGroup.numChildren;
      if (childLength == 0)
        this.gameOver(true);
    }
    //消除功能 idx1 当前索引方格位置，idx2 之前索引方格位置
    removeFruit(idx1 = 0, idx2 = 0) {
      let pos1 = this.gridTrans(this.fruitPool[idx1].x, this.fruitPool[idx1].y);
      let pos2 = this.gridTrans(this.fruitPool[idx2].x, this.fruitPool[idx2].y);
      this.fruitGroup.removeChild(this.fruitPool[idx1]);
      this.fruitGroup.removeChild(this.fruitPool[idx2]);
      this.fruitPool[idx1] = 0;
      this.fruitPool[idx2] = 0;
      this.allPath[pos1[1]][pos1[0]] = 0;
      this.allPath[pos2[1]][pos2[0]] = 0;
      this.showScore(this.addScore);
    }
    //判断是否消除
    checkRemSta(pos1, pos2) {
      if (this.matchLine(pos1, pos2))
        return true;
      if (this.macthOneLine(pos1, pos2))
        return true;
      if (this.macthTwoLine(pos1, pos2))
        return true;
      return false;
    }
    //直接消除
    matchLine(pos1, pos2) {
      let min_x = pos1[0] > pos2[0] ? pos2[0] : pos1[0];
      let max_x = pos1[0] < pos2[0] ? pos2[0] : pos1[0];
      let min_y = pos1[1] > pos2[1] ? pos2[1] : pos1[1];
      let max_y = pos1[1] < pos2[1] ? pos2[1] : pos1[1];
      if (pos1[0] == pos2[0]) {
        for (let i = min_y + 1; i <= max_y; i++) {
          if (i == max_y) {
            this.linePath.push(pos2, pos1);
            return true;
          }
          if (this.allPath[i][pos1[0]])
            return false;
        }
      } else if (pos1[1] == pos2[1]) {
        for (let i = min_x + 1; i <= max_x; i++) {
          if (i == max_x) {
            this.linePath.push(pos2, pos1);
            return true;
          }
          if (this.allPath[pos1[1]][i])
            return false;
        }
      }
    }
    //折一线消除
    macthOneLine(pos1, pos2) {
      let x1 = pos1[0];
      let x2 = pos2[0];
      let y1 = pos1[1];
      let y2 = pos2[1];
      let pos3 = [];
      if (this.allPath[y1][x2] == 0 || this.allPath[y2][x1] == 0) {
        pos3 = this.allPath[y1][x2] == 0 ? [x2, y1] : pos3 = [x1, y2];
        ;
      }
      if (this.matchLine(pos1, pos3) && this.matchLine(pos3, pos2)) {
        this.linePath = [];
        this.linePath.push(pos2, pos3, pos1);
        return true;
      }
      return false;
    }
    //折两线消除
    macthTwoLine(pos1, pos2) {
      let x1 = pos1[0];
      let y1 = pos1[1];
      let cur_x = x1;
      let cur_y = y1;
      while (true) {
        cur_x--;
        if (cur_x < -1)
          break;
        if (this.allPath[y1][cur_x] != 0)
          break;
        if (this.macthOneLine([cur_x, y1], pos2)) {
          this.linePath.push([x1, y1]);
          return true;
        }
      }
      cur_x = x1;
      while (true) {
        cur_x++;
        if (cur_x >= this.bound.x + 1)
          break;
        if (this.allPath[y1][cur_x] != 0)
          break;
        if (this.macthOneLine([cur_x, y1], pos2)) {
          this.linePath.push([x1, y1]);
          return true;
        }
      }
      cur_y = y1;
      while (true) {
        cur_y++;
        if (cur_y >= this.bound.y + 1)
          break;
        if (this.allPath[cur_y][x1] != 0)
          break;
        if (this.macthOneLine([x1, cur_y], pos2)) {
          this.linePath.push([x1, y1]);
          return true;
        }
      }
      cur_y = y1;
      while (true) {
        cur_y--;
        if (cur_y < -1)
          break;
        if (this.allPath[cur_y][x1] != 0)
          break;
        if (this.macthOneLine([x1, cur_y], pos2)) {
          this.linePath.push([x1, y1]);
          return true;
        }
      }
      return false;
    }
    //关卡变更，新增水果
    addFruit() {
      let fruitPool = Laya.Pool.getPoolBySign("fruit");
      if (fruitPool.length == 0) {
        Laya.loader.load("resources/prefab/game/game_btn_fruit.lh", Laya.PrefabImpl, null).then((res) => {
          let fruit = res.create();
          fruitPool.push(fruit);
        });
      } else {
        this.fruitGroup.addChild(fruitPool[0]);
      }
    }
    //寻找道具
    onFindBtn() {
      if (!this.canTouch || this.isMoving || this.tipsNum <= 0)
        return;
      let childLength = this.fruitGroup.numChildren;
      let state = false;
      for (let i = 0; i < childLength; i++) {
        for (let j = 0; j < childLength; j++) {
          if (i == j)
            continue;
          let fruitBox1 = this.fruitGroup.getChildAt(i);
          let fruitBox2 = this.fruitGroup.getChildAt(j);
          let idx1 = fruitBox1.getComponent(Fruit).index;
          let idx2 = fruitBox2.getComponent(Fruit).index;
          let tag1 = fruitBox1.getComponent(Fruit).tag;
          let tag2 = fruitBox2.getComponent(Fruit).tag;
          let pos1 = this.gridTrans(fruitBox1.x, fruitBox1.y);
          let pos2 = this.gridTrans(fruitBox2.x, fruitBox2.y);
          if (tag1 == tag2)
            state = this.checkRemSta(pos1, pos2);
          if (state) {
            this.tipsNum--;
            this.createLine();
            this.canTouch = false;
            Laya.timer.once(400, this, () => {
              this.canTouch = true;
              this.removeFruit(idx1, idx2);
              this.removeLine(this.linePath.length - 1);
              this.initState();
            });
            this.findBtn.getChildAt(0).text = "\u6B21\u6570\uFF1A" + this.tipsNum.toString();
            return;
          }
        }
      }
    }
    //炸弹道具
    onBoomBtn() {
      if (!this.canTouch || this.isMoving)
        return;
      if (this.localCoin >= this.boomCoins) {
        let scr = null;
        let isUse = false;
        for (let i = 0; i < this.fruitPool.length; i++) {
          if (this.fruitPool[i]) {
            scr = this.fruitPool[i].getComponent(Fruit);
            if (scr.tag == this.curTag) {
              this.fruitGroup.removeChild(this.fruitPool[i]);
              let path = this.gridTrans(this.fruitPool[i].x, this.fruitPool[i].y);
              this.allPath[path[1]][path[0]] = 0;
              this.fruitPool[i] = 0;
              isUse = true;
            }
          }
        }
        if (isUse) {
          this.localCoin -= this.boomCoins;
          this.coins.text = "\u5F53\u524D\u91D1\u5E01\uFF1A" + this.localCoin.toString();
          Laya.LocalStorage.setItem("weiqing", this.localCoin.toString());
        }
      }
      if (this.type == "2")
        this.moveBlock();
      this.initState();
    }
    //返回按钮
    onBackBtn() {
      Laya.loader.load("resources/prefab/begin/begin_scene.lh", Laya.PrefabImpl, null).then((res) => {
        let test = res.create();
        this.owner.parent.addChild(test);
        this.owner.destroy();
      });
    }
    //消除的生成线
    createLine() {
      let pointLength = this.linePath.length;
      console.log("pointLength", this.linePath);
      for (let i = 0; i < pointLength - 1; i++) {
        let line_spr = new Laya.Sprite();
        line_spr.name = "Line_" + i;
        line_spr.loadImage("atlas/comp/label.png");
        let x1 = this.linePath[i][0] * this.gridSize;
        let x2 = this.linePath[i + 1][0] * this.gridSize;
        let y1 = this.linePath[i][1] * this.gridSize;
        let y2 = this.linePath[i + 1][1] * this.gridSize;
        let disX = x1 - x2;
        let disY = y1 - y2;
        if (disX != 0) {
          line_spr.width = Math.abs(disX) + 5;
          line_spr.height = 5;
          line_spr.x = disX > 0 ? x1 + this.gridSize / 2 - disX : x1 + this.gridSize / 2;
          line_spr.y = y1 + this.gridSize / 2;
        } else {
          line_spr.width = 5;
          line_spr.height = Math.abs(disY);
          line_spr.x = x1 + this.gridSize / 2;
          line_spr.y = disY > 0 ? y1 + this.gridSize / 2 - disY : y1 + this.gridSize / 2;
        }
        this.fruitGroup.addChild(line_spr);
      }
    }
    //移除线
    removeLine(type) {
      this.linePath = [];
      for (let i = 0; i < type; i++) {
        let target = "Line_" + i;
        this.fruitGroup.removeChildByName(target);
      }
      if (this.type == "2")
        this.moveBlock();
    }
    //游戏结束 type:通关、失败
    gameOver(type) {
      if (type) {
        if (this.curGrade < this.maxGrade) {
          this.curGrade++;
          this.onDestroy();
          this.initFruit();
          this.gameState = true;
        } else {
          let endScore = Math.floor(this.curScore * (this.curTime / this.allTime));
          this.gameState = false;
          Laya.loader.load("resources/prefab/over/over_scene.lh", Laya.PrefabImpl, null).then((res) => {
            let overBox = res.create();
            let owner = this.owner;
            owner.parent.addChild(overBox);
            overBox.getComponent(Over).showEndUI(endScore, type);
            this.owner.destroy();
          });
        }
      } else {
        this.gameState = false;
        Laya.loader.load("resources/prefab/over/over_scene.lh", Laya.PrefabImpl, null).then((res) => {
          let overBox = res.create();
          let owner = this.owner;
          owner.parent.addChild(overBox);
          overBox.getComponent(Over).showEndUI();
          this.owner.destroy();
        });
      }
    }
    //时间转化
    showTime() {
      let minute = Math.floor(this.curTime / 3600);
      let second = Math.floor(this.curTime / 60 % 60);
      minute = minute >= 10 ? minute : "0" + minute;
      second = second >= 10 ? second : "0" + second;
      this.times.text = minute + ":" + second;
      this.timeBar.value = this.curTime / this.allTime;
    }
    onUpdate() {
      if (this.curTime > 0 && this.gameState) {
        this.curTime--;
        this.showTime();
      } else {
        if (this.gameState)
          this.gameOver(false);
      }
    }
    onDestroy() {
      let childLength = this.fruitGroup.numChildren;
      this.fruitGroup.removeChildren(0, childLength - 1);
      Laya.Pool.clearBySign("fruit");
    }
    //向下移动
    moveBlock() {
      this.isMoving = true;
      let m_once_time = 500;
      let max_time = 0;
      let length = this.fruitPool.length;
      let prePath = [];
      let curPath = [];
      for (let i = length - 1; i >= 0; i--) {
        let m_y = 0;
        if (!this.fruitPool[i])
          continue;
        let pos = this.gridTrans(this.fruitPool[i].x, this.fruitPool[i].y);
        for (let j = 0; j < this.bound.y; j++) {
          if (j > pos[1]) {
            if (this.allPath[j][pos[0]] == 0)
              m_y++;
          }
        }
        if (m_y > 0) {
          let posY = this.fruitPool[i].y + m_y * this.gridSize;
          prePath = pos;
          curPath = this.gridTrans(this.fruitPool[i].x, posY);
          this.allPath[prePath[1]][prePath[0]] = 0;
          this.allPath[curPath[1]][curPath[0]] = 1;
          max_time = m_y * m_once_time;
          Laya.Tween.to(this.fruitPool[i], { y: posY }, m_y * m_once_time, null);
        }
      }
      console.log("\u5EF6\u8FDF\u65F6\u95F4", max_time + 300);
      Laya.timer.once(max_time + 300, this, () => {
        this.isMoving = false;
      });
    }
  };
  __name(Game, "Game");
  __decorateClass([
    property3({ type: Laya.Button })
  ], Game.prototype, "findBtn", 2);
  __decorateClass([
    property3({ type: Laya.Button })
  ], Game.prototype, "boomBtn", 2);
  __decorateClass([
    property3({ type: Laya.Button })
  ], Game.prototype, "backBtn", 2);
  __decorateClass([
    property3({ type: Laya.Label })
  ], Game.prototype, "grade", 2);
  __decorateClass([
    property3({ type: Laya.Label })
  ], Game.prototype, "coins", 2);
  __decorateClass([
    property3({ type: Laya.Label })
  ], Game.prototype, "score", 2);
  __decorateClass([
    property3({ type: Laya.Label })
  ], Game.prototype, "times", 2);
  __decorateClass([
    property3({ type: Laya.Box })
  ], Game.prototype, "fruitGroup", 2);
  __decorateClass([
    property3({ type: Laya.Label })
  ], Game.prototype, "findTimes", 2);
  __decorateClass([
    property3({ type: Laya.Label })
  ], Game.prototype, "boomCum", 2);
  __decorateClass([
    property3({ type: Laya.ProgressBar })
  ], Game.prototype, "timeBar", 2);
  Game = __decorateClass([
    regClass3("dd4ad674-c174-449e-9151-20d14f4eefad", "../src/Game.ts")
  ], Game);

  // src/Begin.ts
  var { regClass: regClass4, property: property4 } = Laya;
  var Begin = class extends Laya.Script {
    constructor() {
      super();
    }
    onAwake() {
    }
    onEnable() {
      this.easyBtn.on(Laya.Event.CLICK, this, () => {
        this.createTable("1" /* EASY */);
      });
      this.diffBtn.on(Laya.Event.CLICK, this, () => {
        this.createTable("2" /* DIFF */);
      });
      this.tipsbtn.on(Laya.Event.CLICK, this, this.onTipsbtn);
    }
    onStart() {
      this.localCoin = Laya.LocalStorage.getItem("weiqing");
      if (this.localCoin == null || this.localCoin == "") {
        this.localCoin = "0";
        Laya.LocalStorage.setItem("weiqing", this.localCoin);
      }
      this.coins.text = "\u5F53\u524D\u91D1\u5E01\uFF1A" + this.localCoin;
    }
    //创建游戏界面舞台
    createTable(type) {
      Laya.loader.load("resources/prefab/game/game_scene.lh", Laya.PrefabImpl, null).then((res) => {
        let gameBox = res.create();
        let owner = this.owner;
        owner.parent.addChild(gameBox);
        gameBox.getComponent(Game).initData(type);
        this.owner.destroy();
      });
    }
    onTipsbtn() {
      Laya.loader.load("resources/prefab/begin/tips_prefab.lh", Laya.PrefabImpl, null).then((res) => {
        let tipsBox = res.create();
        this.owner.addChild(tipsBox);
        tipsBox.on(Laya.Event.CLICK, this, () => {
          this.owner.removeChild(tipsBox);
        });
      });
    }
  };
  __name(Begin, "Begin");
  __decorateClass([
    property4({ type: Laya.Button })
  ], Begin.prototype, "easyBtn", 2);
  __decorateClass([
    property4({ type: Laya.Button })
  ], Begin.prototype, "diffBtn", 2);
  __decorateClass([
    property4({ type: Laya.Button })
  ], Begin.prototype, "tipsbtn", 2);
  __decorateClass([
    property4({ type: Laya.Label })
  ], Begin.prototype, "coins", 2);
  Begin = __decorateClass([
    regClass4("679b8a7e-de4e-4a96-956e-f5ef5dc28122", "../src/Begin.ts")
  ], Begin);

  // src/Main.ts
  var { regClass: regClass5, property: property5 } = Laya;
  var Main = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.data = null;
    }
    onAwake() {
    }
    onStart() {
      this.enterGame();
    }
    //进入游戏主界面
    enterGame() {
      Laya.loader.load("resources/prefab/begin/begin_scene.lh", Laya.PrefabImpl, null).then((res) => {
        let beginBox = res.create();
        this.owner.addChild(beginBox);
      });
    }
  };
  __name(Main, "Main");
  Main = __decorateClass([
    regClass5("7bad1742-6eed-4d8d-81c0-501dc5bf03d6", "../src/Main.ts")
  ], Main);
})();
//# sourceMappingURL=bundle.js.map
