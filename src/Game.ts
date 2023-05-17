import { Fruit } from "./Fruit";
import { Main } from "./Main";

//游戏状态
enum StateEnum {
    BEGIN,
    GAME,
    OVER,
}
//消除类型
enum LineEnum {
    FIRST,
    SCEOND,
    THREE,
}

const { regClass, property } = Laya;

@regClass()
export class Script extends Laya.Script {

    @property({ type: Laya.Button })
    public findBtn: Laya.Button;
    @property({ type: Laya.Button })
    public boomBtn: Laya.Button;
    @property({ type: Laya.Button })
    public backBtn: Laya.Button;
    @property({ type: Laya.Button })
    public clickAreaBtn: Laya.Button;
    @property({ type: Laya.Label })
    public coins: Laya.Label;
    @property({ type: Laya.Label })
    public score: Laya.Label;
    @property({ type: Laya.Label })
    public times: Laya.Label;
    @property({ type: Laya.Box })
    public fruitGroup: Laya.Box;

    private localCoin: string = "0"; //当前金币数量
    private curTime: number = 600;//当前关卡时间
    private grade: string = "1";//当前关卡等级
    private curScore: number = 0;//当前分数
    private curTag: number = -1;//当前按钮图片tag类型
    private preIndex: number = -1;//前一个按钮图片索引
    // private curIndex: number = -1;//当前按钮图片索引
    private curPath: number[] = [-1, -1];
    private fruitPool: any[] = [];
    private max_h: number = 0;//横面最大数量
    private max_v: number = 0;//竖面最大数量
    private allPath: number[][] = [];
    private gameState: boolean = false;//游戏状态
    private lineState: number = 0;

    private singleSize: number[] = [];
    constructor() {
        super();
    }

    onAwake(): void {

    }

    onEnable(): void {
        this.findBtn.on(Laya.Event.CLICK, this, this.onFindBtn);
        this.boomBtn.on(Laya.Event.CLICK, this, this.onBoomBtn);
        this.backBtn.on(Laya.Event.CLICK, this, this.onBackBtn);
        // this.clickAreaBtn.on(Laya.Event.CLICK, this, this.onMouseDownBound);
    }

    onStart(): void {
        this.initCoin();
        this.initFruit();
    }

    //初始化金币
    initCoin(): void {
        this.localCoin = Laya.LocalStorage.getItem("weiqing");
        if (this.localCoin == null || this.localCoin == '') {
            this.localCoin = "0";
            Laya.LocalStorage.setItem("weiqing", "0");
        }
        this.coins.text = "金币：" + this.localCoin;
        this.score.text = "分数：" + this.curScore;
    }

    //初始化关卡水果数量
    initFruit(): void {
        let type = this.owner.parent.getComponent(Main).Level;
        let fruitPool = Laya.Pool.getPoolBySign("fruit");
        let curFruit = type == "1" ? 16 : 32;
        Laya.loader.load("resources/prefab/game/Fruit.lh", Laya.PrefabImpl, null).then((res: Laya.PrefabImpl) => {
            for (let i = 0; i < curFruit; i++) {
                let fruit = res.create();
                fruitPool.push(fruit);
            }
            this.createFruit(type);
        });
    }

    //创建关卡水果
    createFruit(type: string): void {
        let random = 0;
        let createNum = 0;
        let fruitPool = Laya.Pool.getPoolBySign("fruit");
        for (let i = 0; i < fruitPool.length; i++) {
            let fruitBox: Laya.Box = fruitPool[i];
            let button: Laya.Node = fruitBox.getChildByName("button");
            this.fruitGroup.addChild(fruitBox);
            fruitBox.x = (i - 4 * Math.floor(i / 4)) * 40;
            fruitBox.y = Math.floor(i / 4) * 40;
            this.singleSize = [40, 40];
            //图片方块坐标转换方格
            this.allPath.push([(i - 4 * Math.floor(i / 4)), Math.floor(i / 4)]);
            fruitPool[i].path = [(i - 4 * Math.floor(i / 4)), Math.floor(i / 4)];
            if (createNum % 2 == 0) random = Math.floor(Math.random() * 7) + 1;
            fruitPool[i].getComponent(Fruit).initState(random, i);
            createNum++;
            //图片按钮的索引
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
    clickBlockBtn(e: any): void {
        let scr: Fruit = e.target.parent.getComponent(Fruit);
        console.log("tag,index--weiqing" + e.target.tag, scr.index);
        if (this.curTag == e.target.tag) {
            Laya.timer.once(500, this, () => {
                let state: boolean = this.checkRemSta(e, scr);
                this.createLine(e, scr);
                if (state) {
                    this.removeFruit(e, scr);
                    this.initState();
                }
            })
        } else {
            this.preIndex == -1 ? this.initState(scr, scr.index, e.target.tag) : this.initState(scr);
        }
    }

    //初始化索引状态和透明度
    initState(scr: Fruit = null, index: number = -1, tag: number = -1): void {
        console.log("curIndex", this.preIndex);
        if (this.preIndex != -1 && scr) scr = this.fruitPool[this.preIndex].getComponent(Fruit);
        if (scr) this.preIndex == -1 ? scr.setAltha() : scr.recoverAlpha();
        this.preIndex = index;
        this.curTag = tag;
    }

    //消除功能
    removeFruit(e: any, scr: Fruit): void {
        console.log("fruitName", this.fruitPool[this.preIndex].name);
        this.fruitGroup.removeChild(this.fruitPool[this.preIndex]);
        this.fruitGroup.removeChild(this.fruitPool[scr.index]);

        this.fruitPool[this.preIndex] = 0;
        this.fruitPool[scr.index] = 0;

        //存储坐标消除
        // this.allPath[this.preIndex] = 0;
        // this.allPath[scr.index] = 0;
    }

    //消除的生成线
    createLine(e: any, scr: Fruit): void {
        this.lineState = 0;
        let pos1: number[] = [this.fruitPool[scr.index].x, this.fruitPool[scr.index].y]; //当前索引图片位置
        let pos2: number[] = [this.fruitPool[this.preIndex].x, this.fruitPool[this.preIndex].y];//目前索引图片位置
        switch (this.lineState) {
            case 0:
                Laya.loader.load("atlas/comp/label.png").then(() => {
                    let image = Laya.loader.getRes("atlas/comp/label.png");
                    let line = new Laya.Image(image);
                    line.scaleX = Math.abs((pos2[0] - pos1[0]));
                    line.scaleY = Math.abs((pos2[1] - pos1[1]));
                    if (line.scaleX == 0) line.scaleX += 5;
                    if (line.scaleY == 0) line.scaleY += 5;
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
                })
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
    checkRemSta(e: any, scr: Fruit): boolean {
        let state = true;//判断是否能够消除（符合消除规则）
        let path1 = this.fruitPool[scr.index].path; //当前索引图片方格位置
        let path2 = this.fruitPool[this.preIndex].path;//目前索引图片方格位置
        let cur_x = 0;
        let cur_y = 0;
        let x1 = path1[0];
        let y1 = path1[1];
        let x2 = path2[0];
        let y2 = path2[0];
        //对比两个方格的最大和最小点
        let min_x = x1 > x2 ? x2 : x1;
        let max_x = x1 > x2 ? x1 : x2;
        let min_y = y1 > y2 ? y2 : y1;
        let max_y = y1 > y2 ? y1 : y2;
        let disX = max_x - min_x;
        let disY = max_y - min_y;
        //两个方格在同一方向竖线或者横线上,path是否在最大或者最小的xy点,存在(一根线、三根线)不存在(一根线,不消除)
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
            if (state) this.lineState = LineEnum.THREE;
        }
        //两个方格不在同一方向,两方块x轴相差比y轴小 就先从x轴遍历
        if (x1 != x2 && y1 != y2) {
            if (Math.abs(x1 - x2) <= Math.abs(y1 - y2)) {
                for (let k = min_x + 1; k <= disX; k++) {
                    for (let j = min_y; j <= disY; j++) {
                        if (!this.allPath[k][j]) {
                            cur_x = k;
                            if (cur_x <= (min_x + 1)) state = false;
                            break;
                        }
                    }
                }
                if (state) this.lineState = cur_x == max_x ? LineEnum.THREE : LineEnum.SCEOND;
            } else {
                for (let j = min_y + 1; j <= disY; j++) {
                    for (let k = min_x; k <= disY; k++) {
                        if (!this.allPath[k][j]) {
                            cur_y = j;
                            if (cur_y <= (min_y + 1)) state = false;
                            break;
                        }
                    }
                }
                if (state) this.lineState = cur_y == max_y ? LineEnum.THREE : LineEnum.SCEOND;
            }
        }
        return state;
    }

    //关卡变更，新增水果
    addFruit(): void {
        let fruitPool = Laya.Pool.getPoolBySign("fruit");
        if (fruitPool.length == 0) {
            Laya.loader.load("resources/prefab/game/Fruit.lh", Laya.PrefabImpl, null).then((res: Laya.PrefabImpl) => {
                let fruit = res.create();
                fruitPool.push(fruit);
            })
        } else {
            this.fruitGroup.addChild(fruitPool[0]);
        }
    }

    //寻找道具
    onFindBtn(): void {
        console.log("game find icon? ---weiqing");
    }

    //炸弹道具
    onBoomBtn(): void {
        if (this.curTag == -1) return;
        let scr = null;
        for (let i = 0; i < this.fruitPool.length; i++) {
            if (this.fruitPool[i]) {
                scr = this.fruitPool[i].getComponent(Fruit);
                if (scr.button.tag == this.curTag) {
                    this.fruitGroup.removeChild(this.fruitPool[i]);
                    // this.allPath[i] = 0;
                    this.fruitPool[i] = 0;
                }
            }
        }
        this.initState();
    }

    //返回按钮
    onBackBtn(): void {
        Laya.loader.load("resources/prefab/common/Begin.lh", Laya.PrefabImpl, null).then((res: Laya.PrefabImpl) => {
            let test = res.create();
            this.owner.parent.addChild(test);
            this.destroyFruit();
            this.destroy();
        })
    }

    //销毁当前水果对象池
    destroyFruit(): void {
        let fruitPool = Laya.Pool.getPoolBySign("fruit");
        for (let i = 0; i < fruitPool.length; i++) {
            if (fruitPool[i]) Laya.Pool.recover("fruit", fruitPool[i]);
        }
    }

    //游戏结束
    over() {
        Laya.loader.load("resources/prefab/common/overBox.lh", Laya.PrefabImpl, null).then((res: Laya.PrefabImpl) => {
            let overBox = res.create();
            this.owner.addChild(overBox);
        })
    }

    showTime(): void {
        let minute: string | number = (this.curTime / 60) >= 10 ? this.curTime : "0" + this.curTime;
        let second: string | number = (this.curTime % 60) >= 10 ? this.curTime : "0" + this.curTime;
        this.times.text = minute + ":" + second;
    }

    onUpdate(): void {
        if (this.curTime > 0 && this.gameState) {
            this.curTime--;
            this.showTime();
        } else {
            if (this.gameState) this.over();
            this.gameState = false;
        }
    }

}