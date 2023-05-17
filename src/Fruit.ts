const { regClass, property } = Laya;

@regClass()
export class Fruit extends Laya.Script {

    @property(Laya.Button)
    public button: Laya.Button;

    public index: number = 0;
    public tag: string = "0";
    // public path: number[] = [];

    constructor() {
        super();
    }

    onStart(): void {

    }

    //初始化状态（当前box索引，名称，按钮图片）
    initState(type: number, i: number): void {
        this.index = i;
        this.owner.name = "Fruit" + (i + 1);
        this.button.tag = type.toString();
        let iconPath: string = "resources/ui/game/fruit_" + type + ".jpeg";
        Laya.loader.load(iconPath).then((res: Laya.Texture) => {
            this.button.texture = res;
        })
    }

    //设置透明度
    setAltha(): void {
        this.button.alpha = 0.2;
    }

    //恢复透明度
    recoverAlpha(): void {
        this.button.alpha = 1;
    }

    //onDestroy(): void {
}