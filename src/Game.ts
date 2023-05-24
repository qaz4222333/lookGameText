import { Fruit } from "./Fruit";
import { Over } from "./Over";

const { regClass, property } = Laya;

@regClass()
export class Game extends Laya.Script {

    @property({ type: Laya.Button })
    public findBtn: Laya.Button;
    @property({ type: Laya.Button })
    public boomBtn: Laya.Button;
    @property({ type: Laya.Button })
    public backBtn: Laya.Button;
    @property({ type: Laya.Label })
    public grade: Laya.Label;
    @property({ type: Laya.Label })
    public coins: Laya.Label;
    @property({ type: Laya.Label })
    public score: Laya.Label;
    @property({ type: Laya.Label })
    public times: Laya.Label;
    @property({ type: Laya.Box })
    public fruitGroup: Laya.Box;
    @property({ type: Laya.Label })
    public findTimes: Laya.Label;
    @property({ type: Laya.Label })
    public boomCum: Laya.Label;
    @property({ type: Laya.ProgressBar })
    public timeBar: Laya.ProgressBar;

    private data: any = null;
    private type: string = "1";
    private localCoin: number = 0; //当前金币数量
    private allTime: number = 0;//当前关卡总时间
    private curTime: number = 0;//当前关卡时间
    private curGrade: number = 1;//当前关卡等级
    private curScore: number = 0;//当前分数
    private addScore: number = 0;//增加分数
    private curTag: string = "-1";//当前按钮图片tag类型
    private preIndex: number = -1;//前一个按钮图片索引
    private curBoxNum: number = 0;//当前加载的箱子数量
    private fruitPool: any[] = [];//按钮存储
    private allPath: number[][] = [];//按钮方格二维数组
    private gameState: boolean = false;//游戏状态（是否在游戏中）
    private gridSize: number = 0; //单个方格大小
    private bound: Laya.Vector2;//边界
    private linePath: number[][] = [];//存储线点(符合消除规则判断能够消除)
    private canTouch: boolean = true;//是否能点击按钮(消除方格时保护)
    private tipsNum: number = 3;//关卡提示数量
    private boomCoins: number = 0;//关卡使用炸弹消耗的金币
    private randomNum: number = 0;//随机图片的tag类型种类
    private maxGrade: number = 0;//最大关卡
    private isMoving: boolean = false;//困难难度方格移动
    constructor() {
        super();
    }

    onAwake(): void {
        Laya.loader.load("json/gameCfg.json", Laya.Handler.create(this, this.levelJsonLoaded), null, Laya.Loader.JSON);
    }

    onEnable(): void {
        this.findBtn.on(Laya.Event.CLICK, this, this.onFindBtn);
        this.boomBtn.on(Laya.Event.CLICK, this, this.onBoomBtn);
        this.backBtn.on(Laya.Event.CLICK, this, this.onBackBtn);
    }

    /**
     * 读取数据表
     */
    levelJsonLoaded(): void {
        let datas = Laya.loader.getRes("json/gameCfg.json").data;
        this.data = this.type == "1" ? datas.level1 : datas.level2;
        this.initFruit();
        this.gameState = true;
    }

    /**
    * 初始化金币、分数等数据
    */
    initData(type: string): void {
        this.type = type;
        this.curGrade = 1;
        let localCoin = Laya.LocalStorage.getItem("weiqing");
        if (localCoin == null || localCoin == '' || localCoin == "NaN") {
            this.localCoin = 0;
            Laya.LocalStorage.setItem("weiqing", this.localCoin.toString());
        } else {
            this.localCoin = Number(localCoin);
        }
    }

    /**
     * 初始化关卡水果数量
     */
    initFruit(): void {
        let fruitPool = Laya.Pool.getPoolBySign("fruit");
        this.gradeData();
        let boxNum: number = this.curBoxNum == 0 ? this.data[this.curGrade].boxNum : this.data[this.curGrade].boxNum - this.curBoxNum;
        Laya.loader.load("resources/prefab/game/GameFruit.lh", Laya.PrefabImpl, null).then((res: Laya.PrefabImpl) => {
            for (let i = 0; i < boxNum; i++) {
                let fruit = res.create();
                fruitPool.push(fruit);
            }
            this.createFruit();
        });
    }
    /**
     * 获取关卡数据
     */
    gradeData(): void {
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

    /** 
    *变更分数
    */
    showScore(score: number): void {
        this.curScore += score;
        this.score.text = "当前分数：" + this.curScore;
    }

    /** 
    *更新道具，标题
    */
    showProp(): void {
        this.coins.text = "当前金币：" + this.localCoin;
        this.score.text = "当前分数：" + this.curScore;
        this.findTimes.text = "次数：" + this.tipsNum.toString();
        this.boomCum.text = "金币:" + this.boomCoins.toString();
        this.grade.text = "第" + this.curGrade.toString() + "关";
    }

    /**
     * 创建关卡水果
     * 先遍历X轴再Y轴
     */
    createFruit(): void {
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
                let fruitBox: Laya.Button = fruitPool[idx];
                fruitBox.x = i * this.gridSize;
                fruitBox.y = j * this.gridSize;
                this.allPath[j][i] = 1;
                if (createNum % 2 == 0) random++;
                if (random == this.randomNum) random = 1;
                fruitPool[idx].getComponent(Fruit).initState(random, idx);
                createNum++;
            }
        }
        this.randomFruit();
    }

    createAllPath() {
        for (let i = -1; i < this.bound.x + 1; i++) {
            this.allPath[i] = [];
            for (let j = -1; j < this.bound.y + 1; j++) {
                this.allPath[i][j] = 0;
            }
        }
    }

    /**
     * 打乱顺序
     */
    randomFruit(): void {
        let fruitPool = Laya.Pool.getPoolBySign("fruit");
        let poolLen = fruitPool.length;
        for (let i = 0; i < poolLen; i++) {
            let idxBtn: Laya.Button = fruitPool[i];
            let random = Math.floor(Math.random() * (poolLen - 1));
            let radBtn: Laya.Button = fruitPool[random];
            let initFruit: Laya.Button = idxBtn;
            let initPos: Laya.Vector2 = new Laya.Vector2(idxBtn.x, idxBtn.y);
            //互换位置和索引
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

    /**
    * 坐标转化方格
    */
    gridTrans(posX: number, posY: number): number[] {
        let path = [posX / this.gridSize, posY / this.gridSize];
        return path;
    }

    /**
     * 点击按钮，判断是否显示索引底色和消除按钮
     * pos1 当前索引图片方格位置
     * pos2 之前索引图片方格位置
     */
    clickBlockBtn(e: any): void {
        let scr: Fruit = e.target.getComponent(Fruit);
        if (!this.canTouch || this.preIndex == scr.index || this.isMoving) return;
        scr.setAltha();
        if (this.curTag == scr.tag) {
            let pos1 = this.gridTrans(this.fruitPool[scr.index].x, this.fruitPool[scr.index].y);
            let pos2 = this.gridTrans(this.fruitPool[this.preIndex].x, this.fruitPool[this.preIndex].y);
            let state: boolean = this.checkRemSta(pos1, pos2);
            if (state) {
                this.createLine();
                this.canTouch = false;
                Laya.timer.once(400, this, () => {
                    this.removeFruit(scr.index, this.preIndex);
                    this.removeLine(this.linePath.length - 1);
                    this.canTouch = true;
                    this.initState();
                })
                return;
            }
        }
        this.initState(scr.index, scr.tag, true);
    }

    /**
     * 初始化索引状态和透明度
     * index当前按钮索引
     * tag当前按钮标签(图片类型)
     * type按钮是否消除
     */
    initState(index: number = -1, tag: string = "-1", type: boolean = false): void {
        let pre_scr = null;
        if (type) {
            if (this.preIndex != -1) pre_scr = this.fruitPool[this.preIndex].getComponent(Fruit);
            if (pre_scr) pre_scr.recoverAlpha();
        }
        this.preIndex = index;
        this.curTag = tag;
        this.checkEnd();
    }

    checkEnd(): void {
        let childLength = this.fruitGroup.numChildren;
        if (childLength == 0) this.gameOver(true);
    }

    /**
     * 消除功能
     * idx1 当前索引方格位置index
     * idx2 之前索引方格位置index
     */
    removeFruit(idx1: number = 0, idx2: number = 0): void {
        let pos1 = this.gridTrans(this.fruitPool[idx1].x, this.fruitPool[idx1].y); //当前索引图片方格位置
        let pos2 = this.gridTrans(this.fruitPool[idx2].x, this.fruitPool[idx2].y);//之前索引图片方格位置
        this.fruitGroup.removeChild(this.fruitPool[idx1]);
        this.fruitGroup.removeChild(this.fruitPool[idx2]);
        this.fruitPool[idx1] = 0;
        this.fruitPool[idx2] = 0;
        this.allPath[pos1[1]][pos1[0]] = 0;
        this.allPath[pos2[1]][pos2[0]] = 0;
        this.showScore(this.addScore);
    }

    /**
     * 判断是否消除
     * matchLine直接消除
     * macthOneLine折一消除
     * macthTwoLine折二消除
     */
    checkRemSta(pos1: number[], pos2: number[]): boolean {
        if (this.matchLine(pos1, pos2)) return true;
        if (this.macthOneLine(pos1, pos2)) return true;
        if (this.macthTwoLine(pos1, pos2)) return true;
        return false;
    }

    matchLine(pos1: number[], pos2: number[]): boolean {
        let min_x = pos1[0] > pos2[0] ? pos2[0] : pos1[0];
        let max_x = pos1[0] < pos2[0] ? pos2[0] : pos1[0];
        let min_y = pos1[1] > pos2[1] ? pos2[1] : pos1[1];
        let max_y = pos1[1] < pos2[1] ? pos2[1] : pos1[1];
        if (pos1[0] == pos2[0]) {
            for (let i = min_y + 1; i <= max_y; i++) {
                if (i == max_y) {
                    this.linePath = [];
                    this.linePath.push(pos2, pos1);
                    return true;
                }
                if (this.allPath[i][pos1[0]]) return false;
            }
        } else if (pos1[1] == pos2[1]) {
            for (let i = min_x + 1; i <= max_x; i++) {
                if (i == max_x) {
                    this.linePath = [];
                    this.linePath.push(pos2, pos1);
                    return true;
                }
                if (this.allPath[pos1[1]][i]) return false;
            }
        }
    }

    macthOneLine(pos1: number[], pos2: number[]): boolean {
        let x1 = pos1[0];
        let x2 = pos2[0];
        let y1 = pos1[1];
        let y2 = pos2[1];
        let pos3: number[] = [];
        //判断XY轴方向
        if (this.allPath[y1][x2] == 0 || this.allPath[y2][x1] == 0) {
            pos3 = this.allPath[y1][x2] == 0 ? [x2, y1] : pos3 = [x1, y2];;
        }
        if (this.matchLine(pos1, pos3) && this.matchLine(pos3, pos2)) {
            this.linePath = [];
            this.linePath.push(pos2, pos3, pos1);
            return true;
        }
        return false;
    }

    macthTwoLine(pos1: number[], pos2: number[]): boolean {
        let x1 = pos1[0];
        let y1 = pos1[1];
        let cur_x = 0;
        let cur_y = -1;
        this.linePath = [];
        // 点pos1上下左右遍历是否有一折消除的情况，就能得出两折消除
        while (true) { //左
            cur_x--;
            if (cur_x < -1) break;
            if (this.allPath[y1][cur_x] != 0) break;
            if (this.matchLine([x1, y1], [cur_x, y1]) && this.macthOneLine([cur_x, y1], pos2)) {
                this.linePath.push([x1, y1]);
                return true;
            }
        }
        cur_x = x1;
        while (true) {//右
            cur_x++;
            if (cur_x >= this.bound.x + 1) break;
            if (this.allPath[y1][cur_x] != 0) break;
            if (this.matchLine([x1, y1], [cur_x, y1]) && this.macthOneLine([cur_x, y1], pos2)) {
                this.linePath.push([x1, y1]);
                return true;
            }
        }
        cur_y = y1;
        while (true) {//下
            cur_y++;
            if (cur_y >= this.bound.y + 1) break;
            if (this.allPath[cur_y][x1] != 0) break;
            if (this.matchLine([x1, y1], [x1, cur_y]) && this.macthOneLine([x1, cur_y], pos2)) {
                this.linePath.push([x1, y1]);
                return true;
            }
        }
        cur_y = y1;
        while (true) {//上
            cur_y--;
            if (cur_y < -1) break;
            if (this.allPath[cur_y][x1] != 0) break;
            if (this.matchLine([x1, y1], [x1, cur_y]) && this.macthOneLine([x1, cur_y], pos2)) {
                this.linePath.push([x1, y1]);
                return true;
            }
        }
        return false;
    }

    /**
     * 关卡变更，新增水果
     */
    addFruit(): void {
        let fruitPool = Laya.Pool.getPoolBySign("fruit");
        if (fruitPool.length == 0) {
            Laya.loader.load("resources/prefab/game/GameFruit.lh", Laya.PrefabImpl, null).then((res: Laya.PrefabImpl) => {
                let fruit = res.create();
                fruitPool.push(fruit);
            })
        } else {
            this.fruitGroup.addChild(fruitPool[0]);
        }
    }

    /**
     * 寻找道具
     */
    onFindBtn(): void {
        if (!this.canTouch || this.isMoving || this.tipsNum <= 0) return;
        let childLength = this.fruitGroup.numChildren;
        let state = false;
        for (let i = 0; i < childLength; i++) {
            for (let j = 0; j < childLength; j++) {
                if (i == j) continue;
                let fruitBox1 = (this.fruitGroup.getChildAt(i) as Laya.Button);
                let fruitBox2 = (this.fruitGroup.getChildAt(j) as Laya.Button);
                let idx1 = fruitBox1.getComponent(Fruit).index;
                let idx2 = fruitBox2.getComponent(Fruit).index;
                let tag1 = fruitBox1.getComponent(Fruit).tag;
                let tag2 = fruitBox2.getComponent(Fruit).tag;
                let pos1 = this.gridTrans(fruitBox1.x, fruitBox1.y); //当前索引图片方格位置
                let pos2 = this.gridTrans(fruitBox2.x, fruitBox2.y);//之前索引图片方格位置
                if (tag1 == tag2) state = this.checkRemSta(pos1, pos2);
                if (state) this.findRemove(idx1, idx2);
            }
        }
    }

    /**
     * 寻找道具删除
     */
    findRemove(idx1: number, idx2: number): void {
        this.tipsNum--;
        this.createLine();
        this.canTouch = false;
        Laya.timer.once(400, this, () => {
            this.canTouch = true;
            this.removeFruit(idx1, idx2);
            this.removeLine(this.linePath.length - 1);
            this.initState();
        });
        (this.findBtn.getChildAt(0) as Laya.Label).text = "次数：" + this.tipsNum.toString();
        return;
    }

    /**
     * 炸弹道具
     */
    onBoomBtn(): void {
        if (!this.canTouch || this.isMoving || this.preIndex == -1) return;
        if (this.localCoin >= this.boomCoins) {
            for (let i = 0; i < this.fruitPool.length; i++) {
                if (this.fruitPool[i]) {
                    let scr = this.fruitPool[i].getComponent(Fruit);
                    if (scr.tag == this.curTag) {
                        this.fruitGroup.removeChild(this.fruitPool[i]);
                        let path = this.gridTrans(this.fruitPool[i].x, this.fruitPool[i].y);
                        this.allPath[path[1]][path[0]] = 0;
                        this.fruitPool[i] = 0;
                    }
                }
            }
            this.updateCoin();
        }
        if (this.type == "2") this.moveBlock();
        this.initState();
    }

    updateCoin() {
        this.localCoin -= this.boomCoins;
        this.coins.text = "当前金币：" + this.localCoin.toString();
        Laya.LocalStorage.setItem("weiqing", this.localCoin.toString());
    }

    //返回按钮
    onBackBtn(): void {
        Laya.loader.load("resources/prefab/begin/BeginScene.lh", Laya.PrefabImpl, null).then((res: Laya.PrefabImpl) => {
            let test = res.create();
            this.owner.parent.addChild(test);
            this.owner.destroy();
        })
    }

    /**
     * 消除的生成线
     */
    createLine(): void {
        let pointLength = this.linePath.length;
        for (let i = 0; i < (pointLength - 1); i++) {
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
                line_spr.x = disX > 0 ? (x1 + this.gridSize / 2 - disX) : (x1 + this.gridSize / 2);
                line_spr.y = y1 + this.gridSize / 2;
            } else {
                line_spr.width = 5
                line_spr.height = Math.abs(disY);
                line_spr.x = x1 + this.gridSize / 2;
                line_spr.y = disY > 0 ? (y1 + this.gridSize / 2 - disY) : (y1 + this.gridSize / 2);
            }
            this.fruitGroup.addChild(line_spr);
        }
    }

    /**
     * 移除线
     */
    removeLine(type: number): void {
        this.linePath = [];
        for (let i = 0; i < type; i++) {
            let target = "Line_" + i;
            this.fruitGroup.removeChildByName(target);
        }
        if (this.type == "2") this.moveBlock();
    }

    /**
     * 游戏结束 
     * type:通关、失败
     */
    gameOver(type: boolean): void {
        if (type && this.curGrade < this.maxGrade) {
            this.curGrade++;
            this.onDestroy();
            this.initFruit();
            this.gameState = true;
        } else {
            let endScore = type ? Math.floor(this.curScore * (this.curTime / this.allTime)) : 0;
            this.gameState = false;
            Laya.loader.load("resources/prefab/over/OverScene.lh", Laya.PrefabImpl, null).then((res: Laya.PrefabImpl) => {
                let overBox = res.create();
                let owner: Laya.Sprite | Laya.Sprite3D = this.owner;
                owner.parent.addChild(overBox);
                overBox.getComponent(Over).showEndUI(endScore, type);
                this.owner.destroy();
            })
        }
    }

    /**
     * 时间转化
     */
    showTime(): void {
        let minute: string | number = Math.floor(this.curTime / 3600);
        let second: string | number = Math.floor(this.curTime / 60 % 60);
        minute = minute >= 10 ? minute : "0" + minute;
        second = second >= 10 ? second : "0" + second;
        this.times.text = minute + ":" + second;
        this.timeBar.value = this.curTime / this.allTime;
    }

    onUpdate(): void {
        if (this.curTime > 0 && this.gameState) {
            this.curTime--;
            this.showTime();
        } else {
            if (this.gameState) this.gameOver(false);
        }
    }

    onDestroy(): void {
        let childLength = this.fruitGroup.numChildren;
        this.fruitGroup.removeChildren(0, childLength - 1);
        Laya.Pool.clearBySign("fruit");
    }

    /**
     * 向下移动
     */
    moveBlock(): void {
        this.isMoving = true;
        let m_once_time = 500;
        let max_time = 0;
        let length = this.fruitPool.length;
        for (let i = (length - 1); i >= 0; i--) {
            let m_y = 0;
            if (!this.fruitPool[i]) continue;
            let pos = this.gridTrans(this.fruitPool[i].x, this.fruitPool[i].y);
            for (let j = 0; j < this.bound.y; j++) {
                if (j > pos[1]) {
                    if (this.allPath[j][pos[0]] == 0) m_y++;
                }
            }
            if (m_y > 0) {
                let posY = this.fruitPool[i].y + (m_y * this.gridSize);
                let prePath = pos;
                let curPath = this.gridTrans(this.fruitPool[i].x, posY);
                this.allPath[prePath[1]][prePath[0]] = 0;
                this.allPath[curPath[1]][curPath[0]] = 1;
                max_time = m_y * m_once_time;
                Laya.Tween.to(this.fruitPool[i], { y: posY }, m_y * m_once_time, null);
            }
        }
        Laya.timer.once(max_time + 300, this, () => {
            this.isMoving = false;
        })
    }

}