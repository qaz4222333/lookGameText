import { Game } from "./Game";

const { regClass, property } = Laya;

@regClass()
export class Over extends Laya.Script {
    @property({ type: Laya.Button })
    private backBtn: Laya.Button;
    @property({ type: Laya.Label })
    private endLabel: Laya.Label;
    private localCoin: number = 0;

    constructor() {
        super();
    }

    onAwake(): void {

    }

    onEnable(): void {
        this.backBtn.on(Laya.Event.CLICK, this, () => {
            this.backBegin();
        })
    }

    onStart() {

    }

    //coins（分数、金币），type 是否通关
    showEndUI(coins: number = 0, type: boolean = false) {
        let str1 = "恭喜您通过啦，您的分数是：" + coins + "\n\n" + "您获得的奖励是：" + coins + "金币";
        let str2 = "真遗憾，您没有通关，继续努力吧";
        let width = 800;
        let str = type ? str1 : str2;
        this.endLabel.text = str;
        this.endLabel.wordWrap = true;
        this.endLabel.x = this.endLabel.width - width >> 1;
        if (type) this.storageCoin(coins);
    }

    //存储金币
    storageCoin(coins: number) {
        this.localCoin = Number(Laya.LocalStorage.getItem("weiqing"));
        if (this.localCoin == null || this.localCoin.toString() == '') this.localCoin = 0;
        this.localCoin += coins;
        Laya.LocalStorage.setItem("weiqing", this.localCoin.toString());
    }

    //返回主界面
    backBegin() {
        Laya.loader.load("resources/prefab/begin/BeginScene.lh", Laya.PrefabImpl, null).then((res: Laya.PrefabImpl) => {
            let beginBox = res.create();
            let owner: Laya.Sprite | Laya.Sprite3D = this.owner;
            owner.parent.addChild(beginBox);
            this.owner.destroy();
        });
    }
}