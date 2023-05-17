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

  // src/Main.ts
  var { regClass, property } = Laya;
  var Main = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.Level = "1" /* EASY */;
    }
    onAwake() {
    }
    onStart() {
      this.enterGame();
    }
    //进入游戏主界面
    enterGame() {
      Laya.loader.load("resources/prefab/common/Begin.lh", Laya.PrefabImpl, null).then((res) => {
        let beginBox = res.create();
        this.owner.addChild(beginBox);
      });
    }
  };
  __name(Main, "Main");
  Main = __decorateClass([
    regClass("7bad1742-6eed-4d8d-81c0-501dc5bf03d6", "../src/Main.ts")
  ], Main);

  // src/Begin.ts
  var { regClass: regClass2, property: property2 } = Laya;
  var Begin = class extends Laya.Script {
    constructor() {
      super();
    }
    onAwake() {
    }
    onEnable() {
      this.easyBtn.on(Laya.Event.CLICK, this, () => {
        this.createTable("1");
      });
      this.diffBtn.on(Laya.Event.CLICK, this, () => {
        this.createTable("2");
      });
    }
    onStart() {
      this.localCoin = Laya.LocalStorage.getItem("weiqing");
      if (this.localCoin == null || this.localCoin == "") {
        this.localCoin = "0";
        Laya.LocalStorage.setItem("weiqing", this.localCoin);
      }
      this.coins.text = "\u91D1\u5E01\uFF1A" + this.localCoin;
    }
    //创建游戏界面舞台
    createTable(type) {
      let level = type == "1" ? "1" /* EASY */ : "2" /* DIFF */;
      Laya.loader.load("resources/prefab/game/Game.lh", Laya.PrefabImpl, null).then((res) => {
        let gameBox = res.create();
        let owner = this.owner;
        owner.parent.addChild(gameBox);
        owner.parent.getComponent(Main).Level = level;
        this.owner.destroy();
      });
    }
  };
  __name(Begin, "Begin");
  __decorateClass([
    property2({ type: Laya.Button })
  ], Begin.prototype, "easyBtn", 2);
  __decorateClass([
    property2({ type: Laya.Button })
  ], Begin.prototype, "diffBtn", 2);
  __decorateClass([
    property2({ type: Laya.Label })
  ], Begin.prototype, "coins", 2);
  Begin = __decorateClass([
    regClass2("679b8a7e-de4e-4a96-956e-f5ef5dc28122", "../src/Begin.ts")
  ], Begin);

  // src/Fruit.ts
  var { regClass: regClass3, property: property3 } = Laya;
  var Fruit = class extends Laya.Script {
    // public path: number[] = [];
    constructor() {
      super();
      this.index = 0;
      this.tag = "0";
    }
    onStart() {
    }
    //初始化状态（当前box索引，名称，按钮图片）
    initState(type, i) {
      this.index = i;
      this.owner.name = "Fruit" + (i + 1);
      this.button.tag = type.toString();
      let iconPath = "resources/ui/game/fruit_" + type + ".jpeg";
      Laya.loader.load(iconPath).then((res) => {
        this.button.texture = res;
      });
    }
    //设置透明度
    setAltha() {
      this.button.alpha = 0.2;
    }
    //恢复透明度
    recoverAlpha() {
      this.button.alpha = 1;
    }
    //onDestroy(): void {
  };
  __name(Fruit, "Fruit");
  __decorateClass([
    property3(Laya.Button)
  ], Fruit.prototype, "button", 2);
  Fruit = __decorateClass([
    regClass3("71cd39b1-dada-4ef6-8746-3ac17095370b", "../src/Fruit.ts")
  ], Fruit);

  // src/Game.ts
  var { regClass: regClass4, property: property4 } = Laya;
  var Script = class extends Laya.Script {
    constructor() {
      super();
      this.localCoin = "0";
      //当前金币数量
      this.curTime = 600;
      //当前关卡时间
      this.grade = "1";
      //当前关卡等级
      this.curScore = 0;
      //当前分数
      this.curTag = -1;
      //当前按钮图片tag类型
      this.preIndex = -1;
      //前一个按钮图片索引
      // private curIndex: number = -1;//当前按钮图片索引
      this.curPath = [-1, -1];
      this.fruitPool = [];
      this.max_h = 0;
      //横面最大数量
      this.max_v = 0;
      //竖面最大数量
      this.allPath = [];
      this.gameState = false;
      //游戏状态
      this.lineState = 0;
      this.singleSize = [];
    }
    onAwake() {
    }
    onEnable() {
      this.findBtn.on(Laya.Event.CLICK, this, this.onFindBtn);
      this.boomBtn.on(Laya.Event.CLICK, this, this.onBoomBtn);
      this.backBtn.on(Laya.Event.CLICK, this, this.onBackBtn);
    }
    onStart() {
      this.initCoin();
      this.initFruit();
    }
    //初始化金币
    initCoin() {
      this.localCoin = Laya.LocalStorage.getItem("weiqing");
      if (this.localCoin == null || this.localCoin == "") {
        this.localCoin = "0";
        Laya.LocalStorage.setItem("weiqing", "0");
      }
      this.coins.text = "\u91D1\u5E01\uFF1A" + this.localCoin;
      this.score.text = "\u5206\u6570\uFF1A" + this.curScore;
    }
    //初始化关卡水果数量
    initFruit() {
      let type = this.owner.parent.getComponent(Main).Level;
      let fruitPool = Laya.Pool.getPoolBySign("fruit");
      let curFruit = type == "1" ? 16 : 32;
      Laya.loader.load("resources/prefab/game/Fruit.lh", Laya.PrefabImpl, null).then((res) => {
        for (let i = 0; i < curFruit; i++) {
          let fruit = res.create();
          fruitPool.push(fruit);
        }
        this.createFruit(type);
      });
    }
    //创建关卡水果
    createFruit(type) {
      let random = 0;
      let createNum = 0;
      let fruitPool = Laya.Pool.getPoolBySign("fruit");
      for (let i = 0; i < fruitPool.length; i++) {
        let fruitBox = fruitPool[i];
        let button = fruitBox.getChildByName("button");
        this.fruitGroup.addChild(fruitBox);
        fruitBox.x = (i - 4 * Math.floor(i / 4)) * 40;
        fruitBox.y = Math.floor(i / 4) * 40;
        this.singleSize = [40, 40];
        this.allPath.push([i - 4 * Math.floor(i / 4), Math.floor(i / 4)]);
        fruitPool[i].path = [i - 4 * Math.floor(i / 4), Math.floor(i / 4)];
        if (createNum % 2 == 0)
          random = Math.floor(Math.random() * 7) + 1;
        fruitPool[i].getComponent(Fruit).initState(random, i);
        createNum++;
        button.on(Laya.Event.CLICK, this, this.clickBlockBtn);
      }
      this.fruitPool = fruitPool;
    }
    // onMouseDownBound(): void {
    //     this.curTag = -1;
    //     this.preIndex = -1;
    //     console.log("seafArea click")
    // }
    //点击按钮，判断是否显示索引底色和消除按钮
    clickBlockBtn(e) {
      let scr = e.target.parent.getComponent(Fruit);
      console.log("tag,index--weiqing" + e.target.tag, scr.index);
      if (this.curTag == e.target.tag) {
        Laya.timer.once(500, this, () => {
          let state = this.checkRemSta(e, scr);
          this.createLine(e, scr);
          if (state) {
            this.removeFruit(e, scr);
            this.initState();
          }
        });
      } else {
        this.preIndex == -1 ? this.initState(scr, scr.index, e.target.tag) : this.initState(scr);
      }
    }
    //初始化索引状态和透明度
    initState(scr = null, index = -1, tag = -1) {
      console.log("curIndex", this.preIndex);
      if (this.preIndex != -1 && scr)
        scr = this.fruitPool[this.preIndex].getComponent(Fruit);
      if (scr)
        this.preIndex == -1 ? scr.setAltha() : scr.recoverAlpha();
      this.preIndex = index;
      this.curTag = tag;
    }
    //消除功能
    removeFruit(e, scr) {
      console.log("fruitName", this.fruitPool[this.preIndex].name);
      this.fruitGroup.removeChild(this.fruitPool[this.preIndex]);
      this.fruitGroup.removeChild(this.fruitPool[scr.index]);
      this.fruitPool[this.preIndex] = 0;
      this.fruitPool[scr.index] = 0;
    }
    //消除的生成线
    createLine(e, scr) {
      this.lineState = 0;
      let pos1 = [this.fruitPool[scr.index].x, this.fruitPool[scr.index].y];
      let pos2 = [this.fruitPool[this.preIndex].x, this.fruitPool[this.preIndex].y];
      switch (this.lineState) {
        case 0:
          Laya.loader.load("atlas/comp/label.png").then(() => {
            let image = Laya.loader.getRes("atlas/comp/label.png");
            let line = new Laya.Image(image);
            line.scaleX = Math.abs(pos2[0] - pos1[0]);
            line.scaleY = Math.abs(pos2[1] - pos1[1]);
            if (line.scaleX == 0)
              line.scaleX += 5;
            if (line.scaleY == 0)
              line.scaleY += 5;
            if (pos1[0] < pos2[0]) {
              line.x = pos1[0] + this.singleSize[0];
              line.y = pos1[1] + this.singleSize[1];
            } else if (pos1[0] > pos2[0]) {
              line.x = pos2[0] + this.singleSize[0];
              line.y = pos2[1] + this.singleSize[1];
            }
            if (pos1[1] > pos2[1]) {
              line.x = pos1[0] + this.singleSize[0];
              line.y = pos1[1] + this.singleSize[1];
            } else if (pos1[1] < pos2[1]) {
              line.x = pos2[0] + this.singleSize[0];
              line.y = pos2[1] + this.singleSize[1];
            }
            this.fruitGroup.addChild(line);
            console.log("add lines ---weiqing");
          });
          break;
        case 1:
          break;
        case 2:
          break;
        default:
          break;
      }
    }
    //判断消除类型以及是否能够符合规则消除
    checkRemSta(e, scr) {
      let state = true;
      let path1 = this.fruitPool[scr.index].path;
      let path2 = this.fruitPool[this.preIndex].path;
      let cur_x = 0;
      let cur_y = 0;
      let x1 = path1[0];
      let y1 = path1[1];
      let x2 = path2[0];
      let y2 = path2[0];
      let min_x = x1 > x2 ? x2 : x1;
      let max_x = x1 > x2 ? x1 : x2;
      let min_y = y1 > y2 ? y2 : y1;
      let max_y = y1 > y2 ? y1 : y2;
      let disX = max_x - min_x;
      let disY = max_y - min_y;
      if (x1 == x2 || y1 == y2) {
        if (x1 == x2) {
          for (let j = min_y + 1; j <= disX; j++) {
            if (!this.allPath[x1][j]) {
              state = false;
              break;
            }
          }
        } else {
          for (let k = min_x + 1; k <= disY; k++) {
            if (!this.allPath[k][y2]) {
              state = false;
              break;
            }
          }
        }
        if (state)
          this.lineState = 2 /* THREE */;
      }
      if (x1 != x2 && y1 != y2) {
        if (Math.abs(x1 - x2) <= Math.abs(y1 - y2)) {
          for (let k = min_x + 1; k <= disX; k++) {
            for (let j = min_y; j <= disY; j++) {
              if (!this.allPath[k][j]) {
                cur_x = k;
                if (cur_x <= min_x + 1)
                  state = false;
                break;
              }
            }
          }
          if (state)
            this.lineState = cur_x == max_x ? 2 /* THREE */ : 1 /* SCEOND */;
        } else {
          for (let j = min_y + 1; j <= disY; j++) {
            for (let k = min_x; k <= disY; k++) {
              if (!this.allPath[k][j]) {
                cur_y = j;
                if (cur_y <= min_y + 1)
                  state = false;
                break;
              }
            }
          }
          if (state)
            this.lineState = cur_y == max_y ? 2 /* THREE */ : 1 /* SCEOND */;
        }
      }
      return state;
    }
    //关卡变更，新增水果
    addFruit() {
      let fruitPool = Laya.Pool.getPoolBySign("fruit");
      if (fruitPool.length == 0) {
        Laya.loader.load("resources/prefab/game/Fruit.lh", Laya.PrefabImpl, null).then((res) => {
          let fruit = res.create();
          fruitPool.push(fruit);
        });
      } else {
        this.fruitGroup.addChild(fruitPool[0]);
      }
    }
    //寻找道具
    onFindBtn() {
      console.log("game find icon? ---weiqing");
    }
    //炸弹道具
    onBoomBtn() {
      if (this.curTag == -1)
        return;
      let scr = null;
      for (let i = 0; i < this.fruitPool.length; i++) {
        if (this.fruitPool[i]) {
          scr = this.fruitPool[i].getComponent(Fruit);
          if (scr.button.tag == this.curTag) {
            this.fruitGroup.removeChild(this.fruitPool[i]);
            this.fruitPool[i] = 0;
          }
        }
      }
      this.initState();
    }
    //返回按钮
    onBackBtn() {
      Laya.loader.load("resources/prefab/common/Begin.lh", Laya.PrefabImpl, null).then((res) => {
        let test = res.create();
        this.owner.parent.addChild(test);
        this.destroyFruit();
        this.destroy();
      });
    }
    //销毁当前水果对象池
    destroyFruit() {
      let fruitPool = Laya.Pool.getPoolBySign("fruit");
      for (let i = 0; i < fruitPool.length; i++) {
        if (fruitPool[i])
          Laya.Pool.recover("fruit", fruitPool[i]);
      }
    }
    //游戏结束
    over() {
      Laya.loader.load("resources/prefab/common/overBox.lh", Laya.PrefabImpl, null).then((res) => {
        let overBox = res.create();
        this.owner.addChild(overBox);
      });
    }
    showTime() {
      let minute = this.curTime / 60 >= 10 ? this.curTime : "0" + this.curTime;
      let second = this.curTime % 60 >= 10 ? this.curTime : "0" + this.curTime;
      this.times.text = minute + ":" + second;
    }
    onUpdate() {
      if (this.curTime > 0 && this.gameState) {
        this.curTime--;
        this.showTime();
      } else {
        if (this.gameState)
          this.over();
        this.gameState = false;
      }
    }
  };
  __name(Script, "Script");
  __decorateClass([
    property4({ type: Laya.Button })
  ], Script.prototype, "findBtn", 2);
  __decorateClass([
    property4({ type: Laya.Button })
  ], Script.prototype, "boomBtn", 2);
  __decorateClass([
    property4({ type: Laya.Button })
  ], Script.prototype, "backBtn", 2);
  __decorateClass([
    property4({ type: Laya.Button })
  ], Script.prototype, "clickAreaBtn", 2);
  __decorateClass([
    property4({ type: Laya.Label })
  ], Script.prototype, "coins", 2);
  __decorateClass([
    property4({ type: Laya.Label })
  ], Script.prototype, "score", 2);
  __decorateClass([
    property4({ type: Laya.Label })
  ], Script.prototype, "times", 2);
  __decorateClass([
    property4({ type: Laya.Box })
  ], Script.prototype, "fruitGroup", 2);
  Script = __decorateClass([
    regClass4("dd4ad674-c174-449e-9151-20d14f4eefad", "../src/Game.ts")
  ], Script);

  // src/Gamecfg.ts
  var { regClass: regClass5, property: property5 } = Laya;
  var gameCfg = class {
  };
  __name(gameCfg, "gameCfg");
  gameCfg = __decorateClass([
    regClass5("34a2f02e-8607-4fa6-acbb-bd09a217a6ad", "../src/Gamecfg.ts")
  ], gameCfg);

  // src/Over.ts
  var { regClass: regClass6, property: property6 } = Laya;
  var Script2 = class extends Laya.Script {
    constructor() {
      super();
      this.text = "";
    }
    /**
     * 组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
     */
    //onAwake(): void {}
    /**
     * 组件被启用后执行，例如节点被添加到舞台后
     */
    //onEnable(): void {}
    /**
     * 组件被禁用时执行，例如从节点从舞台移除后
     */
    //onDisable(): void {}
    /**
     * 第一次执行update之前执行，只会执行一次
     */
    //onStart(): void {}
    /**
     * 手动调用节点销毁时执行
     */
    //onDestroy(): void {
    /**
     * 每帧更新时执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
     */
    //onUpdate(): void {}
    /**
     * 每帧更新时执行，在update之后执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
     */
    //onLateUpdate(): void {}
    /**
     * 鼠标点击后执行。与交互相关的还有onMouseDown等十多个函数，具体请参阅文档。
     */
    //onMouseClick(): void {}
  };
  __name(Script2, "Script");
  __decorateClass([
    property6(String)
  ], Script2.prototype, "text", 2);
  Script2 = __decorateClass([
    regClass6("45f487d1-73ef-46a8-9004-f0f2f2fb0342", "../src/Over.ts")
  ], Script2);
})();
//# sourceMappingURL=bundle.js.map
