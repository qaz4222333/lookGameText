const { regClass, property } = Laya;


/**
 * time 关卡时间
 * 
 */
@regClass()
class gameCfg {
    "1": {
        easyGrade1: {
            time: 600,
            iconNum: 16,
        }
        easyGrade2: {
            time: 600,
            iconNum: 32,
        }
        easyGrade3: {
            time: 600,
            iconNum: 64,
        }
    }
    "2": {
        diffGrade1: {
            time: 300,
            iconNum: 32,
        }
        diffGrade2: {
            time: 300,
            iconNum: 64,
        }
        diffGrade3: {
            time: 300,
            iconNum: 128,
        }
    }
}

// export class Gamecfg extends Laya.Script {

// }