
const { regClass, property } = Laya;

@regClass()

export class Main extends Laya.Script {
    public data: any = null;

    onAwake(): void {
    }

    onStart() {
        this.enterGame();
    }

    //进入游戏主界面
    enterGame() {
        Laya.loader.load("resources/prefab/begin/begin_scene.lh", Laya.PrefabImpl, null).then((res: Laya.PrefabImpl) => {
            let beginBox = res.create();
            this.owner.addChild(beginBox);
        })
    }

}