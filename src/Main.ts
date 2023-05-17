
const { regClass, property } = Laya;

//关卡难度选择
enum LevelEnum {
    EASY = "1",
    DIFF = "2",
}

//游戏状态
enum StateEnum {
    BEGIN,
    GAME,
    OVER,
}
@regClass()

export class Main extends Laya.Script {
    public Level: LevelEnum = LevelEnum.EASY;

    onAwake(): void {

    }

    onStart() {
        this.enterGame();
    }

    //进入游戏主界面
    enterGame() {
        Laya.loader.load("resources/prefab/common/Begin.lh", Laya.PrefabImpl, null).then((res: Laya.PrefabImpl) => {
            let beginBox = res.create();
            this.owner.addChild(beginBox);
        })
    }

}