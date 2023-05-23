import { Game } from "./Game";
import { Main } from "./Main";

const { regClass, property } = Laya;

enum LevelEnum {
    EASY = "1",
    DIFF = "2",
}
@regClass()
export class Begin extends Laya.Script {
    @property({ type: Laya.Button })
    private easyBtn: Laya.Button;
    @property({ type: Laya.Button })
    private diffBtn: Laya.Button;
    @property({ type: Laya.Button })
    private tipsbtn: Laya.Button;
    @property({ type: Laya.Label })
    private coins: Laya.Label;

    private localCoin: string;

    constructor() {
        super();
    }

    onAwake(): void {

    }

    onEnable(): void {
        this.easyBtn.on(Laya.Event.CLICK, this, () => {
            this.createTable(LevelEnum.EASY);
        })
        this.diffBtn.on(Laya.Event.CLICK, this, () => {
            this.createTable(LevelEnum.DIFF);
        })
        this.tipsbtn.on(Laya.Event.CLICK, this, this.onTipsbtn)
    }

    onStart() {
        this.localCoin = Laya.LocalStorage.getItem("weiqing");
        if (this.localCoin == null || this.localCoin == '') {
            this.localCoin = "0";
            Laya.LocalStorage.setItem("weiqing", this.localCoin);
        }
        this.coins.text = "当前金币：" + this.localCoin;
    }

    //创建游戏界面舞台
    createTable(type: string): void {
        Laya.loader.load("resources/prefab/game/game_scene.lh", Laya.PrefabImpl, null).then((res: Laya.PrefabImpl) => {
            let gameBox = res.create();
            let owner: Laya.Sprite | Laya.Sprite3D = this.owner;
            owner.parent.addChild(gameBox);
            gameBox.getComponent(Game).initData(type);
            this.owner.destroy();
        });
    }

    onTipsbtn() {
        Laya.loader.load("resources/prefab/begin/tips_prefab.lh", Laya.PrefabImpl, null).then((res: Laya.PrefabImpl) => {
            let tipsBox = res.create();
            this.owner.addChild(tipsBox);
            (tipsBox as Laya.Button).on(Laya.Event.CLICK, this, () => {
                this.owner.removeChild(tipsBox);
            })
        });
    }

}