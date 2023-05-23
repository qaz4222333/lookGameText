const { regClass, property } = Laya;

@regClass()
export class Fruit extends Laya.Script {

    public index: number = 0;
    public tag: string = "0";

    constructor() {
        super();
    }

    onStart(): void {

    }

    //初始化状态（当前box索引，按钮图片）
    initState(type: string, i: number): void {
        this.index = i;
        this.owner.name = "Fruit" + (i + 1);
        this.tag = type.toString();
        let iconPath: string = "resources/ui/game/fruit_" + type + ".png";
        Laya.loader.load(iconPath).then((res: Laya.Texture) => {
            (this.owner as Laya.Button).texture = res;
        })
    }

    setIndex(i: number): void {
        this.index = i;
        this.owner.name = "Fruit" + (i + 1);
    }

    //设置透明度
    setAltha(): void {
        (this.owner as Laya.Button).alpha = 0.3;
    }

    //恢复透明度
    recoverAlpha(): void {
        (this.owner as Laya.Button).alpha = 1;
    }

}