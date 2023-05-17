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
            this.createTable("1");
        })

        this.diffBtn.on(Laya.Event.CLICK, this, () => {
            this.createTable("2");
        })
    }

    onStart() {
        this.localCoin = Laya.LocalStorage.getItem("weiqing");
        if (this.localCoin == null || this.localCoin == '') {
            this.localCoin = "0";
            Laya.LocalStorage.setItem("weiqing", this.localCoin);
        }
        this.coins.text = "金币：" + this.localCoin;
    }

    //创建游戏界面舞台
    createTable(type: string): void {
        let level: LevelEnum = type == "1" ? LevelEnum.EASY : LevelEnum.DIFF;
        Laya.loader.load("resources/prefab/game/Game.lh", Laya.PrefabImpl, null).then((res: Laya.PrefabImpl) => {
            let gameBox = res.create();
            let owner: Laya.Sprite | Laya.Sprite3D = this.owner;
            owner.parent.addChild(gameBox);
            owner.parent.getComponent(Main).Level = level;
            this.owner.destroy();
        });
    }

}