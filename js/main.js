/*Z Layers:
2 - blocks

6 - grid

10 - player
*/

class Game{
    static onceready() {
        //Classes
        class Player extends PIXI.Graphics{
            constructor(){
                super();
                this.addChild(new PIXI.Graphics());
                this.children[0].beginFill(0x000000);
                this.children[0].drawRect(-16, -16, 32, 32);
                this.children[0].endFill();

                this.addChild(new PIXI.Graphics());

                this.type = "entity";

                this.draggingThing = null;
                this.moveSpeed = 3;
                this.dragPrecision = 64;
                this.zIndex = 10;
            }
            Update(){
                if(Game.keys.includes(Game.Binds.Up)){
                    this.position.y -= this.moveSpeed;
                }
                if(Game.keys.includes(Game.Binds.Down)){
                    this.position.y += this.moveSpeed;
                }
                if(Game.keys.includes(Game.Binds.Left)){
                    this.position.x -= this.moveSpeed;
                }
                if(Game.keys.includes(Game.Binds.Right)){
                    this.position.x += this.moveSpeed;
                }
                if(Game.keysPressed.includes(Game.Binds.Inventory)){
                    Game.uiContainer.children[0].visible = !Game.uiContainer.children[0].visible;
                }
                Game.worldContainer.position.x = -this.position.x + Game.canvas.width / 2;
                Game.worldContainer.position.y = -this.position.y + Game.canvas.width / 2;
                if(Game.MBsPressed[0]){
                    (Game.worldContainer.children).forEach(thing => {
                        if(thing.moveable && Game.intersectpos(thing.position.x, thing.position.y, thing.width, thing.height, Game.worldContainer.mousePos.x, Game.worldContainer.mousePos.y)){
                            this.draggingThing = thing;
                            this.children[1].visible = true;
                        }
                    });
                }
                if(this.draggingThing != null){
                    if(Game.MBsReleased[0]){
                        this.draggingThing = null;
                        this.children[1].visible = false;
                    }
                    else{
                        let targetx = Math.round(Game.worldContainer.mousePos.x / this.dragPrecision) * this.dragPrecision;
                        let targety = Math.round(Game.worldContainer.mousePos.y / this.dragPrecision) * this.dragPrecision;

                        let collide = false;
                        Game.worldContainer.children.forEach(thing => {
                            if(thing !== this.draggingThing && thing !== Game.grid && thing !== Game.player && Game.intersect(targetx, targety, 64, 64, thing.x, thing.y, thing.width, thing.height)){
                                collide = true;
                            }
                        });
                        if(!collide){
                            this.draggingThing.position.x = targetx;
                            this.draggingThing.position.y = targety;
                        }

                        this.children[1].clear();
                        this.children[1].lineStyle(8, 0xffd700);
                        this.children[1].moveTo(0, 0);
                        let dragX = this.draggingThing.position.x + Game.worldContainer.position.x - Game.canvas.width / 2;
                        let dragY = this.draggingThing.position.y + Game.worldContainer.position.y - Game.canvas.width / 2;
                        this.children[1].lineTo(dragX, dragY);
                        this.children[1].beginFill(0xffd700);
                        this.children[1].drawCircle(0, 0, 3);
                        this.children[1].drawCircle(dragX, dragY, 6);
                        this.children[1].endFill();
                    }
                }
            }
        }
        class Square extends PIXI.Graphics{
            constructor(x, y){
                super();
                this.addChild(new PIXI.Graphics());
                this.children[0].beginFill(0x000000);
                this.children[0].drawRect(-32, -32, 64, 64);
                this.children[0].endFill();
                this.position.x = x;
                this.position.y = y;
                this.moveable = true;
                this.type = "block";
                this.zIndex = 2;
            }
            Update(){
            }
        }
        class SquareMaker extends PIXI.Graphics{
            constructor(x, y){
                super();
                this.addChild(new PIXI.Graphics());
                this.children[0].beginFill(0x000000);
                this.children[0].drawRect(-32, -32, 64, 64);
                this.children[0].endFill();
                this.children[0].beginFill(0xffffff);
                this.children[0].drawPolygon([
                    new PIXI.Point(0, -20),
                    new PIXI.Point(-15, -10),
                    new PIXI.Point(15, -10)
                ]);
                this.children[0].endFill();
                this.moveable = true;
                this.zIndex = 2;
                this.timer = 0;
                this.type = "block";
                this.spawnTime = 100;
                this.position.x = x;
                this.position.y = y;
            }
            Update(dif){
                if(this.timer >= this.spawnTime){
                    let collide = false;
                    Game.worldContainer.children.forEach(thing => {
                        if(thing !== this && thing !== Game.grid && thing !== Game.player && Game.intersect(this.position.x, this.position.y - 64, 64, 64, thing.x, thing.y, thing.width, thing.height)){
                            collide = true;
                        }
                    });
                    if(!collide){
                        this.lastGen = new Square(this.position.x, this.position.y - 64);
                        Game.worldContainer.addChild(this.lastGen);
                    }
                    this.timer = 0;
                }
                this.timer += dif;
            }
        }
        class Piston extends PIXI.Graphics{
            constructor(x, y){
                super();
                this.addChild(new PIXI.Graphics());
                this.children[0].beginFill(0x000000);
                this.children[0].drawRect(-32, -32, 64, 64);
                this.children[0].endFill();
                this.addChild(new PIXI.Graphics());
                this.children[1].beginFill(0xffffff);
                this.children[1].drawPolygon([
                    new PIXI.Point(-15, -20),
                    new PIXI.Point(-15, -10),
                    new PIXI.Point(15, -10),
                    new PIXI.Point(15, -20)
                ]);
                this.children[1].endFill();
                this.type = "block";
                this.moveable = true;
                this.zIndex = 2;
                this.timer = 50;
                this.spawnTime = 100;
                this.pushx = 0;
                this.pushy = -64;
                this.targetx = 0;
                this.targety = -64;
                this.position.x = x;
                this.position.y = y;
            }
            Update(dif){
                if(this.timer >= this.spawnTime){
                    let hit = null;
                    Game.worldContainer.children.forEach(thing => {
                        if(thing.moveable && thing !== this && thing !== Game.grid && thing !== Game.player && Game.intersect(this.position.x + this.targetx, this.position.y + this.targety, 64, 64, thing.x, thing.y, thing.width, thing.height)){
                            hit = thing;
                        }
                    });
                    if(hit){
                        this.PushThing(hit, this.pushx, this.pushy);
                    }
                    this.timer = 0;
                }
                this.timer += dif;
                if(Game.MBsPressed[2] && Game.intersectpos(this.x, this.y, this.width, this.height, Game.worldContainer.mousePos.x, Game.worldContainer.mousePos.y)){
                    if(this.targetx == 0 && this.targety == -64){
                        this.targetx = 64;
                        this.targety = 0;
                        this.pushx = 64;
                        this.pushy = 0;
                        this.children[1].clear();
                        this.children[1].beginFill(0xffffff);
                        this.children[1].drawPolygon([
                            new PIXI.Point(20, -15),
                            new PIXI.Point(10, -15),
                            new PIXI.Point(10, 15),
                            new PIXI.Point(20, 15)
                        ]);
                        this.children[1].endFill();
                    }
                    else if(this.targetx == 64 && this.targety == 0){
                        this.targetx = 0;
                        this.targety = 64;
                        this.pushx = 0;
                        this.pushy = 64;
                        this.children[1].clear();
                        this.children[1].beginFill(0xffffff);
                        this.children[1].drawPolygon([
                            new PIXI.Point(-15, 20),
                            new PIXI.Point(-15, 10),
                            new PIXI.Point(15, 10),
                            new PIXI.Point(15, 20)
                        ]);
                        this.children[1].endFill();
                    }
                    else if(this.targetx == 0 && this.targety == 64){
                        this.targetx = -64;
                        this.targety = 0;
                        this.pushx = -64;
                        this.pushy = 0;
                        this.children[1].clear();
                        this.children[1].beginFill(0xffffff);
                        this.children[1].drawPolygon([
                            new PIXI.Point(-20, -15),
                            new PIXI.Point(-10, -15),
                            new PIXI.Point(-10, 15),
                            new PIXI.Point(-20, 15)
                        ]);
                        this.children[1].endFill();
                    }
                    else if(this.targetx == -64 && this.targety == 0){
                        this.targetx = 0;
                        this.targety = -64;
                        this.pushx = 0;
                        this.pushy = -64;
                        this.children[1].clear();
                        this.children[1].beginFill(0xffffff);
                        this.children[1].drawPolygon([
                            new PIXI.Point(-15, -20),
                            new PIXI.Point(-15, -10),
                            new PIXI.Point(15, -10),
                            new PIXI.Point(15, -20)
                        ]);
                        this.children[1].endFill();
                    }
                }
            }
            PushThing(toPush, dx, dy){
                let hit = null;
                Game.worldContainer.children.forEach(thing => {
                    if(thing !== this && thing !== Game.grid && thing !== Game.player && Game.intersect(toPush.x + this.pushx, toPush.y + this.pushy, 64, 64, thing.x, thing.y, thing.width, thing.height)){
                        hit = thing;
                    }
                });
                if((hit && hit.moveable) || !hit){
                    if(hit){
                        this.PushThing(hit, dx, dy);
                    }
                    toPush.position.x += this.pushx;
                    toPush.position.y += this.pushy;
                }
            }
        }
        class GridBG extends PIXI.Graphics{
            constructor(){
                super();
                this.addChild(new PIXI.Graphics()); //Grid
                this.gridfreq = 64;
                this.children[0].lineStyle(8, 0xbbbbbb)
                for(let i = -Math.floor((Game.canvas.width + this.gridfreq) / (2 * this.gridfreq)) * this.gridfreq - this.gridfreq / 2; i < Math.ceil(Game.canvas.width / this.gridfreq) * this.gridfreq; i += this.gridfreq){
                    this.children[0].moveTo(i, -Game.canvas.height);
                    this.children[0].lineTo(i, Game.canvas.height);
                }
                for(let i = -Math.floor((Game.canvas.height + this.gridfreq) / (2 * this.gridfreq)) * this.gridfreq - this.gridfreq / 2; i < Math.ceil(Game.canvas.height / this.gridfreq) * this.gridfreq; i += this.gridfreq){
                    this.children[0].moveTo(-Game.canvas.width, i);
                    this.children[0].lineTo(Game.canvas.width, i);
                }
                this.zIndex = 6;
            }
            Update(){
                this.position.x = Math.round(Game.player.position.x / this.gridfreq) * this.gridfreq;
                this.position.y = Math.round(Game.player.position.y / this.gridfreq) * this.gridfreq;
            }
        }

        class InventoryUI extends PIXI.Graphics{
            constructor(){
                super();
                this.addChild(new PIXI.Graphics());
                this.children[0].addChild(new Square(128, 128));
                this.children[0].addChild(new SquareMaker(128, 256));
                this.children[0].addChild(new Piston(128, 384))
            }
            Update(){
                if(Game.MBsPressed[0]){
                    this.children[0].children.forEach(child => {
                        if(Game.intersectpos(child.x, child.y, child.width, child.height, Game.uiContainer.mousePos.x, Game.uiContainer.mousePos.y)){
                            let clone = new child.constructor(Game.uiContainer.mousePos.x, Game.uiContainer.mousePos.y);
                            Game.worldContainer.addChild(clone);
                            Game.player.draggingThing = clone;
                            Game.player.children[1].visible = true;
                        }
                    });
                }
            }
        }


        //Functions

        Game.Dummy = (arg) =>{
            Console.log(arg);
        }

        //Input stuff

        Game.keys = [];
        Game.keyPressBuffer = [];
        Game.keysPressed = [];
        
        Game.MBsDown = [];
        Game.MBPressBuffer = [];
        Game.MBReleaseBuffer = [];

        //Controls
        Game.Binds = new Object();
        Game.Binds.Up = 'w';
        Game.Binds.Left = 'a';
        Game.Binds.Right = 'd';
        Game.Binds.Down = 's';

        Game.Binds.AltUp = 'ArrowUp';
        Game.Binds.AltLeft = 'ArrowLeft';
        Game.Binds.AltRight = 'ArrowRight';
        Game.Binds.AltDown = 'ArrowDown';
        
        Game.Binds.Start = ' ';

        Game.Binds.Inventory = 'Tab';

	    //Variables


        //Event Listeners
        document.addEventListener('keydown', function(event) {
            if(!Game.keys.includes('Control')){ //Allow ctrl key
                event.preventDefault();
                console.log("Prevent");
            }
            if(!Game.keys.includes(event.key)){
                Game.keys.push(event.key);
            }
            Game.keyPressBuffer.push(event.key);
        });
        document.addEventListener('keyup', function(event) {
            if(Game.keys.includes(event.key)){
                Game.keys.splice(Game.keys.indexOf(event.key), 1);
            }
        });
        document.addEventListener('mousedown', function(event){
            Game.MBsDown[event.button] = true;
            Game.MBPressBuffer[event.button] = true;
        });
        document.addEventListener('mouseup', function(event){
            Game.MBsDown[event.button] = false;
            Game.MBReleaseBuffer[event.button] = true;
        });

        window.addEventListener("contextmenu", e => e.preventDefault());

        // Initialization
        Game.canvas = document.getElementById('gameCanvas');

        Game.type = "WebGL";
        if(!PIXI.utils.isWebGLSupported()){
            Game.type = "canvas";
        }
        PIXI.utils.sayHello(Game.type);

        Game.app = new PIXI.Application({
            view: Game.canvas,
            antialias: true,
            width: 1000,
            height: 1000,
            backgroundColor: 0xffffff
        });

        Game.app.stage.sortableChildren = true;

        Game.app.stage.addChild(new PIXI.Graphics()); //World container
        Game.app.stage.addChild(new PIXI.Graphics()); //UI container

        Game.worldContainer = Game.app.stage.children[0];
        Game.uiContainer = Game.app.stage.children[1];

        Game.worldContainer.sortableChildren = true;
        Game.uiContainer.sortableChildren = true;

        Game.worldContainer.mousePos = new Object();
        Game.worldContainer.mousePos.x = 0;
        Game.worldContainer.mousePos.y = 0;

        Game.uiContainer.mousePos = new Object();
        Game.uiContainer.mousePos.x = 0;
        Game.uiContainer.mousePos.y = 0;

        Game.uiContainer.addChild(new InventoryUI());

        Game.grid = new GridBG();

        Game.worldContainer.addChild(Game.grid);

        Game.player = new Player();

        Game.worldContainer.addChild(Game.player);
        Game.worldContainer.addChild(new SquareMaker(0,0));
        Game.worldContainer.addChild(new Piston(128,0));

        Game.app.ticker.add((dif) => {
            Game.removeThingsCache = [];
            Game.keysPressed = Game.keyPressBuffer;
            Game.keyPressBuffer = [];
            Game.MBsPressed = Game.MBPressBuffer;
            Game.MBPressBuffer = [];
            Game.MBsReleased = Game.MBReleaseBuffer;
            Game.MBReleaseBuffer = [];

            let mouseglobal = Game.app.renderer.plugins.interaction.mouse.global;
            Game.worldContainer.mousePos.x = mouseglobal.x - Game.worldContainer.position.x;
            Game.worldContainer.mousePos.y = mouseglobal.y - Game.worldContainer.position.y;

            Game.uiContainer.mousePos.x = mouseglobal.x;
            Game.uiContainer.mousePos.y = mouseglobal.y;

            Game.app.stage.children.forEach((room) => {
                if(room.visible){
                    room.children.forEach((thing) => {
                        thing.Update(dif);
                    });
                }
            })
        });
	}
    static intersect(x1, y1, w1, h1, x2, y2, w2, h2){
        return x1 + w1 / 2 > x2 - w2 / 2 &&
        x1 - w1 / 2 < x2 + w2 / 2 &&
        y1 + h1 / 2 > y2 - h2 / 2 &&
        y1 - h1 / 2 < y2 + h2 / 2;
    }
    static intersectpos(x1, y1, width, height, x, y){
        return x < x1 + width / 2
        && x > x1 - width / 2
        && y < y1 + height / 2
        && y > y1 - height / 2;
    }
}

// Only executed our code once the DOM is ready.
window.onload = Game.onceready;
