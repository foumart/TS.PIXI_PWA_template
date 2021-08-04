import * as PIXI from "pixi.js";
import "./style.css";
import { EventDispatcher } from "./eventDispatcher";

declare const VERSION: string;

let gameWidth = 1024;
let gameHeight = 1024;

console.log(`PIXI-PWA ${VERSION}`);

const app = new PIXI.Application({
    backgroundColor: 0x555555,
    backgroundAlpha: 0,
    width: gameWidth,
    height: gameHeight
});

const stage = app.stage;
let animatedSprite: PIXI.AnimatedSprite;
let supportText: PIXI.Text;

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

window.onload = async (): Promise<void> => {
    await loadGameAssets();

    document.body.appendChild(app.view);

    app.renderer.view.style.display = "block";

    gameWidth = window.innerWidth;
    gameHeight = window.innerHeight;

    animatedSprite = getUnit();
    animatedSprite.anchor.set(0.5, 0.5);
    animatedSprite.scale.set(8, 6);
    stage.addChild(animatedSprite);

    animatedSprite.buttonMode = true;
    animatedSprite.interactive = true;
    animatedSprite.on("click", onClick);

    supportText = new PIXI.Text("Fullscreen?", { fontSize: "10px" });
    supportText.x = gameWidth / 2 + 103;
    supportText.y = gameHeight / 2 + 63;
    stage.addChild(supportText);

    resizeCanvas();

    EventDispatcher.dispatchEvent("loading", 100);
};

function onClick(): void {
    EventDispatcher.dispatchEvent("fullscreen");
    supportText.text = "";
    stage.removeChild(supportText);
}

async function loadGameAssets(): Promise<void> {
    return new Promise((res, rej) => {
        const loader = PIXI.Loader.shared;
        loader.add("characters", "./assets/Characters.json");

        loader.onComplete.once(() => {
            res();
        });

        loader.onError.once(() => {
            rej();
        });

        loader.load();
    });
}

function resizeCanvas(): void {
    const resize = () => {
        gameWidth = window.innerWidth;
        gameHeight = window.innerHeight;
        app.renderer.resize(gameWidth, gameHeight);
        animatedSprite.position.set(gameWidth / 2, gameHeight / 2);
    };

    resize();

    window.addEventListener("resize", resize);
}

function getUnit(): PIXI.AnimatedSprite {
    const unit = new PIXI.AnimatedSprite([
        PIXI.Texture.from("kitten_1.gif"),
        PIXI.Texture.from("kitten_2.gif"),
        PIXI.Texture.from("kitten_3.gif"),
        PIXI.Texture.from("kitten_4.gif"),
        PIXI.Texture.from("kitten_5.gif")
    ]);

    unit.loop = true;
    unit.animationSpeed = 0.2;
    unit.play();

    return unit;
}
