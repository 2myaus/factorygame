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
                this.children[1].beginFill(0x00ff00);
                this.children[1].drawRect(-10, -10, 20, 20);
                this.children[1].endFill();

                this.addChild(new PIXI.Graphics());

                this.type = "entity";

                this.draggingThing = null;
                this.moveSpeed = 3;
                this.zIndex = 10;
            }
            Update(){
                if(Game.keys.includes(Game.Binds.Up)){
                    this.position.y -= this.moveSpeed * Game.timescale;
                }
                if(Game.keys.includes(Game.Binds.Down)){
                    this.position.y += this.moveSpeed * Game.timescale;
                }
                if(Game.keys.includes(Game.Binds.Left)){
                    this.position.x -= this.moveSpeed * Game.timescale;
                }
                if(Game.keys.includes(Game.Binds.Right)){
                    this.position.x += this.moveSpeed * Game.timescale;
                }
                if(Game.keysPressed.includes(Game.Binds.Inventory)){
                    Game.uiContainer.children[0].visible = !Game.uiContainer.children[0].visible;
                }
                Game.worldContainer.position.x = -this.position.x + Game.canvas.width / 2;
                Game.worldContainer.position.y = -this.position.y + Game.canvas.width / 2;
                if(Game.MBsPressed[0]){
                    let target = Game.getblock(Math.round(Game.worldContainer.mousePos.x / 64), Math.round(Game.worldContainer.mousePos.y / 64));
                    if(target){
                        this.draggingThing = target;
                        this.children[2].visible = true;
                    }
                }
                if(this.draggingThing != null){
                    if(Game.MBsReleased[0]){
                        this.draggingThing = null;
                        this.children[2].visible = false;
                    }
                    else{
                        let targetx = Math.round(Game.worldContainer.mousePos.x / 64);
                        let targety = Math.round(Game.worldContainer.mousePos.y / 64);

                        let collide = Game.getblock(targetx, targety);
                        if(!collide){
                            Game.moveblockto(this.draggingThing, targetx, targety);
                        }

                        this.children[2].clear();
                        this.children[2].lineStyle(8, 0xffd700);
                        this.children[2].moveTo(0, 0);
                        let dragX = this.draggingThing.position.x + Game.worldContainer.position.x - Game.canvas.width / 2;
                        let dragY = this.draggingThing.position.y + Game.worldContainer.position.y - Game.canvas.width / 2;
                        this.children[2].lineTo(dragX, dragY);
                        this.children[2].beginFill(0xffd700);
                        this.children[2].drawCircle(0, 0, 3);
                        this.children[2].drawCircle(dragX, dragY, 6);
                        this.children[2].endFill();
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
                this.addChild(new PIXI.Graphics());
                this.children[1].beginFill(0xffffff);
                this.children[1].drawRect(-10, -10, 20, 20);
                this.children[1].endFill();
                this.position.x = x;
                this.position.y = y;
                this.type = "block";
                this.zIndex = 2;
            }
            Update(){
            }
            Activate(){
            }
        }
        class StickySquare extends PIXI.Graphics{
            constructor(x, y){
                super();
                this.addChild(new PIXI.Graphics());
                this.children[0].beginFill(0x000000);
                this.children[0].drawRect(-32, -32, 64, 64);
                this.children[0].endFill();
                this.addChild(new PIXI.Graphics());
                this.children[1].beginFill(0xffffff);
                this.children[1].drawRect(-10, -20, 20, 40);
                this.children[1].drawRect(-20, -10, 40, 20);
                this.children[1].endFill();
                this.position.x = x;
                this.position.y = y;
                this.type = "block";
                this.zIndex = 2;
            }
            Update(){
            }
            Activate(){
            }
        }
        class SquareMaker extends PIXI.Graphics{
            constructor(x, y){
                super();
                this.addChild(new PIXI.Graphics());
                this.children[0].beginFill(0x000000);
                this.children[0].drawRect(-32, -32, 64, 64);
                this.children[0].endFill();
                this.addChild(new PIXI.Graphics());
                this.children[1].beginFill(0xffffff);
                this.children[1].drawPolygon([
                    new PIXI.Point(0, -20),
                    new PIXI.Point(-15, -10),
                    new PIXI.Point(15, -10)
                ]);
                this.children[1].endFill();

                this.addChild(new PIXI.Graphics());
                this.children[2].beginFill(0x00ff00);
                this.children[2].drawPolygon([
                    new PIXI.Point(0, -20),
                    new PIXI.Point(-15, -10),
                    new PIXI.Point(15, -10)
                ]);
                this.children[2].endFill();
                this.children[2].visible = false;
                this.zIndex = 2;
                this.type = "block";
                this.position.x = x;
                this.position.y = y;
                this.targetx = 0;
                this.targety = -1;
                this.lastactive = 0;
                this.colored = false;
            }
            Update(){
                if(Game.MBsPressed[1] && Game.intersectpos(this.x, this.y, this.width, this.height, Game.worldContainer.mousePos.x, Game.worldContainer.mousePos.y)){
                    this.Activate();
                }
                if(Game.MBsPressed[2] && Game.intersectpos(this.x, this.y, this.width, this.height, Game.worldContainer.mousePos.x, Game.worldContainer.mousePos.y)){
                    this.Rotate();
                }
                if(this.colored && Game.elapsed - this.lastactive > 10 / Game.timescale){
                    this.colored = false;
                    //Decolor
                    this.children[1].visible = true;
                    this.children[2].visible = false;
                }
            }
            Activate(){
                this.lastactive = Game.elapsed;
                this.colored = true;
                //Color
                this.children[1].visible = false;
                this.children[2].visible = true;
                if(!Game.getblock(this.position.x / 64 + this.targetx, this.position.y / 64 + this.targety)){
                    Game.addblock(new Square(this.position.x + this.targetx * 64, this.position.y + this.targety * 64));
                }
            }
            Rotate(){
                if(this.targetx == 0 && this.targety == -1){
                    this.targetx = 1;
                    this.targety = 0;
                    this.children[1].clear();
                    this.children[1].beginFill(0xffffff);
                    this.children[1].drawPolygon([
                        new PIXI.Point(20, 0),
                        new PIXI.Point(10, -15),
                        new PIXI.Point(10, 15)
                    ]);
                    this.children[1].endFill();

                    this.children[2].clear();
                    this.children[2].beginFill(0x00ff00);
                    this.children[2].drawPolygon([
                        new PIXI.Point(20, 0),
                        new PIXI.Point(10, -15),
                        new PIXI.Point(10, 15)
                    ]);
                    this.children[2].endFill();
                }
                else if(this.targetx == 1 && this.targety == 0){
                    this.targetx = 0;
                    this.targety = 1;
                    this.children[1].clear();
                    this.children[1].beginFill(0xffffff);
                    this.children[1].drawPolygon([
                        new PIXI.Point(0, 20),
                        new PIXI.Point(-15, 10),
                        new PIXI.Point(15, 10)
                    ]);
                    this.children[1].endFill();

                    this.children[2].clear();
                    this.children[2].beginFill(0x00ff00);
                    this.children[2].drawPolygon([
                        new PIXI.Point(0, 20),
                        new PIXI.Point(-15, 10),
                        new PIXI.Point(15, 10)
                    ]);
                    this.children[2].endFill();
                }
                else if(this.targetx == 0 && this.targety == 1){
                    this.targetx = -1;
                    this.targety = 0;
                    this.children[1].clear();
                    this.children[1].beginFill(0xffffff);
                    this.children[1].drawPolygon([
                        new PIXI.Point(-20, 0),
                        new PIXI.Point(-10, -15),
                        new PIXI.Point(-10, 15)
                    ]);
                    this.children[1].endFill();

                    this.children[2].clear();
                    this.children[2].beginFill(0x00ff00);
                    this.children[2].drawPolygon([
                        new PIXI.Point(-20, 0),
                        new PIXI.Point(-10, -15),
                        new PIXI.Point(-10, 15)
                    ]);
                    this.children[2].endFill();
                }
                else if(this.targetx == -1 && this.targety == 0){
                    this.targetx = 0;
                    this.targety = -1;
                    this.children[1].clear();
                    this.children[1].beginFill(0xffffff);
                    this.children[1].drawPolygon([
                        new PIXI.Point(0, -20),
                        new PIXI.Point(-15, -10),
                        new PIXI.Point(15, -10)
                    ]);
                    this.children[1].endFill();

                    this.children[2].clear();
                    this.children[2].beginFill(0x00ff00);
                    this.children[2].drawPolygon([
                        new PIXI.Point(0, -20),
                        new PIXI.Point(-15, -10),
                        new PIXI.Point(15, -10)
                    ]);
                    this.children[2].endFill();
                }
            }
        }
        class Detector extends PIXI.Graphics{
            constructor(x, y){
                super();
                this.addChild(new PIXI.Graphics());
                this.children[0].beginFill(0x000000);
                this.children[0].drawRect(-32, -32, 64, 64);
                this.children[0].endFill();
                this.addChild(new PIXI.Graphics());
                this.children[1].beginFill(0xffffff);
                this.children[1].drawCircle(0, -10, 10);
                this.children[1].endFill();
                this.addChild(new PIXI.Graphics());
                this.children[2].beginFill(0x0000ff);
                this.children[2].drawCircle(0, -10, 10);
                this.children[2].endFill();
                this.children[2].visible = false;
                this.addChild(new PIXI.Graphics());
                this.children[3].beginFill(0xff0000);
                this.children[3].drawCircle(0, -10, 10);
                this.children[3].endFill();
                this.children[3].visible = false;
                this.type = "block";
                this.zIndex = 2;
                this.targetx = 0;
                this.targety = -1;
                this.activatingsrc = null;
                this.activationtime = 50;
                this.activatingtimer = 0;
                this.position.x = x;
                this.position.y = y;
                this.lastactive = 0;
                this.colored = false;
            }
            Update(dif){
                if(Game.MBsPressed[2] && Game.intersectpos(this.x, this.y, this.width, this.height, Game.worldContainer.mousePos.x, Game.worldContainer.mousePos.y)){
                    this.Rotate();
                }
                if(Game.MBsPressed[1] && Game.intersectpos(this.x, this.y, this.width, this.height, Game.worldContainer.mousePos.x, Game.worldContainer.mousePos.y)){
                    this.Activate();
                }
                if(this.activatingtimer >= this.activationtime / Game.timescale){
                    this.Activate([this.activatingsrc]);
                    this.activatingtimer = 0;
                    this.activatingsrc = null;
                }
                if(this.activatingsrc){
                    //Color blue
                    this.children[2].visible = true;
                    this.children[1].visible = false;
                    this.activatingtimer += dif;
                }
                let watchblock = Game.getblock(this.position.x / 64 + this.targetx, this.position.y / 64 + this.targety);
                if(watchblock){
                    this.activatingsrc = watchblock;
                }
                if(this.colored && Game.elapsed - this.lastactive > 10 / Game.timescale){
                    this.colored = false;
                    //Decolor
                    this.children[1].visible = true;
                    this.children[2].visible = false;
                    this.children[3].visible = false;
                }
            }
            Activate(src){
                this.lastactive = Game.elapsed;
                this.colored = true;
                //Color red
                this.children[1].visible = false;
                this.children[2].visible = false;
                this.children[3].visible = true;
                if(!src){src = [];}
                let newsrc = [...src];
                newsrc.push(this);
                let b1 = Game.getblock(this.position.x / 64, this.position.y / 64 - 1);
                let b2 = Game.getblock(this.position.x / 64 + 1, this.position.y / 64);
                let b3 = Game.getblock(this.position.x / 64, this.position.y / 64 + 1);
                let b4 = Game.getblock(this.position.x / 64 - 1, this.position.y / 64);
                if(b1 instanceof Conduit && !src.includes(b1)){b1.Activate(newsrc)};
                if(b2 instanceof Conduit && !src.includes(b2)){b2.Activate(newsrc)};
                if(b3 instanceof Conduit && !src.includes(b3)){b3.Activate(newsrc)};
                if(b4 instanceof Conduit && !src.includes(b4)){b4.Activate(newsrc)};
            }
            Rotate(){
                if(this.targetx == 0 && this.targety == -1){
                    this.targetx = 1;
                    this.targety = 0;
                    this.children[1].clear();
                    this.children[1].beginFill(0xffffff);
                    this.children[1].drawCircle(10, 0, 10);
                    this.children[1].endFill();

                    this.children[2].clear();
                    this.children[2].beginFill(0x0000ff);
                    this.children[2].drawCircle(10, 0, 10);
                    this.children[2].endFill();

                    this.children[3].clear();
                    this.children[3].beginFill(0xff0000);
                    this.children[3].drawCircle(10, 0, 10);
                    this.children[3].endFill();
                }
                else if(this.targetx == 1 && this.targety == 0){
                    this.targetx = 0;
                    this.targety = 1;
                    this.children[1].clear();
                    this.children[1].beginFill(0xffffff);
                    this.children[1].drawCircle(0, 10, 10);
                    this.children[1].endFill();
                    
                    this.children[2].clear();
                    this.children[2].beginFill(0x0000ff);
                    this.children[2].drawCircle(0, 10, 10);
                    this.children[2].endFill();

                    this.children[3].clear();
                    this.children[3].beginFill(0xff0000);
                    this.children[3].drawCircle(0, 10, 10);
                    this.children[3].endFill();
                }
                else if(this.targetx == 0 && this.targety == 1){
                    this.targetx = -1;
                    this.targety = 0;
                    this.children[1].clear();
                    this.children[1].beginFill(0xffffff);
                    this.children[1].drawCircle(-10, 0, 10);
                    this.children[1].endFill();
                    
                    this.children[2].clear();
                    this.children[2].beginFill(0x0000ff);
                    this.children[2].drawCircle(-10, 0, 10);
                    this.children[2].endFill();

                    this.children[3].clear();
                    this.children[3].beginFill(0xff0000);
                    this.children[3].drawCircle(-10, 0, 10);
                    this.children[3].endFill();
                }
                else if(this.targetx == -1 && this.targety == 0){
                    this.targetx = 0;
                    this.targety = -1;
                    this.children[1].clear();
                    this.children[1].beginFill(0xffffff);
                    this.children[1].drawCircle(0, -10, 10);
                    this.children[1].endFill();
                    
                    this.children[2].clear();
                    this.children[2].beginFill(0x0000ff);
                    this.children[2].drawCircle(0, -10, 10);
                    this.children[2].endFill();

                    this.children[3].clear();
                    this.children[3].beginFill(0xff0000);
                    this.children[3].drawCircle(0, -10, 10);
                    this.children[3].endFill();
                }
            }
        }
        class Conduit extends PIXI.Graphics{
            constructor(x, y){
                super();
                this.addChild(new PIXI.Graphics());
                this.children[0].beginFill(0x000000);
                this.children[0].drawRect(-32, -32, 64, 64);
                this.children[0].endFill();
                this.addChild(new PIXI.Graphics());
                this.children[1].beginFill(0xffffff);
                this.children[1].drawCircle(0, 0, 20);
                this.children[1].endFill();
                this.addChild(new PIXI.Graphics());
                this.children[2].beginFill(0xff0000);
                this.children[2].drawCircle(0, 0, 20);
                this.children[2].endFill();
                this.children[2].visible = false;
                this.type = "block";
                this.zIndex = 2;
                this.position.x = x;
                this.position.y = y;
                this.lastactive = 0;
                this.colored = false;
            }
            Update(dif){
                if(Game.MBsPressed[1] && Game.intersectpos(this.x, this.y, this.width, this.height, Game.worldContainer.mousePos.x, Game.worldContainer.mousePos.y)){
                    this.Activate();
                }
                if(this.colored && Game.elapsed - this.lastactive > 10 / Game.timescale){
                    this.colored = false;
                    //Decolor
                    this.children[1].visible = true;
                    this.children[2].visible = false;
                }
            }
            Activate(src){
                this.lastactive = Game.elapsed;
                this.colored = true;
                //Color
                this.children[1].visible = false;
                this.children[2].visible = true;

                let b1 = Game.getblock(this.position.x / 64, this.position.y / 64 - 1);
                if(!src){src=[]};
                let newsrc = [...src];
                newsrc.push(this);
                if(b1 && !src.includes(b1)){b1.Activate([...newsrc])};
                let b2 = Game.getblock(this.position.x / 64 + 1, this.position.y / 64);
                if(b2 && !src.includes(b2)){b2.Activate([...newsrc])};
                let b3 = Game.getblock(this.position.x / 64, this.position.y / 64 + 1);
                if(b3 && !src.includes(b3)){b3.Activate([...newsrc])};
                let b4 = Game.getblock(this.position.x / 64 - 1, this.position.y / 64);
                if(b4 && !src.includes(b4)){b4.Activate([...newsrc])};
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
                this.children[1].drawRect(-15, -20, 30, 10);
                this.children[1].endFill();

                this.addChild(new PIXI.Graphics());
                this.children[2].beginFill(0x000000);
                this.children[2].drawRect(-10, -96, 20, 64);
                this.children[2].drawRect(-32, -96, 64, 20);
                this.children[2].endFill();
                this.children[2].beginFill(0xff0000);
                this.children[2].drawRect(-15, -20, 30, 10)
                this.children[2].endFill();
                this.children[2].visible = false;

                this.type = "block";
                this.zIndex = 2;
                this.pushx = 0;
                this.pushy = -1;
                this.targetx = 0;
                this.targety = -1;
                this.position.x = x;
                this.position.y = y;
                this.lastactive = 0;
                this.extended = false;
            }
            Update(dif){
                if(Game.MBsPressed[1] && Game.intersectpos(this.x, this.y, this.width, this.height, Game.worldContainer.mousePos.x, Game.worldContainer.mousePos.y)){
                    this.Activate();
                }
                if(Game.MBsPressed[2] && Game.intersectpos(this.x, this.y, this.width, this.height, Game.worldContainer.mousePos.x, Game.worldContainer.mousePos.y)){
                    this.Rotate();
                }
                if(this.extended && Game.elapsed - this.lastactive > 10 / Game.timescale){
                    this.extended = false;
                    //Unextend
                    this.children[2].visible = false;
                    this.children[1].visible = true;
                }
            }
            PushThing(toPush, dx, dy){
                Game.moveblock(toPush, this.pushx, this.pushy, [this]);
            }
            Activate(){
                this.lastactive = Game.elapsed;
                this.extended = true;
                //Extend
                this.children[2].visible = true;
                this.children[1].visible = false;
                let hit = Game.getblock(this.position.x / 64 + this.targetx, this.position.y / 64 + this.targety);
                if(hit){
                    this.PushThing(hit, this.pushx, this.pushy);
                }
            }
            Rotate(){
                if(this.targetx == 0 && this.targety == -1){
                    this.targetx = 1;
                    this.targety = 0;
                    this.pushx = 1;
                    this.pushy = 0;
                    this.children[1].clear();
                    this.children[1].beginFill(0xffffff);
                    this.children[1].drawRect(20, -15, -10, 30)
                    this.children[1].endFill();

                    this.children[2].clear();
                    this.children[2].beginFill(0x000000);
                    this.children[2].drawRect(32, 10, 64, -20);
                    this.children[2].drawRect(96, -32, -20, 64);
                    this.children[2].endFill();
                    this.children[2].beginFill(0xff0000);
                    this.children[2].drawRect(20, -15, -10, 30);
                    this.children[2].endFill();
                }
                else if(this.targetx == 1 && this.targety == 0){
                    this.targetx = 0;
                    this.targety = 1;
                    this.pushx = 0;
                    this.pushy = 1;
                    this.children[1].clear();
                    this.children[1].beginFill(0xffffff);
                    this.children[1].drawRect(-15, 20, 30, -10);
                    this.children[1].endFill();

                    this.children[2].clear();
                    this.children[2].beginFill(0x000000);
                    this.children[2].drawRect(-10, 96, 20, -64);
                    this.children[2].drawRect(-32, 96, 64, -20);
                    this.children[2].endFill();
                    this.children[2].beginFill(0xff0000);
                    this.children[2].drawRect(-15, 20, 30, -10)
                    this.children[2].endFill();
                }
                else if(this.targetx == 0 && this.targety == 1){
                    this.targetx = -1;
                    this.targety = 0;
                    this.pushx = -1;
                    this.pushy = 0;
                    this.children[1].clear();
                    this.children[1].beginFill(0xffffff);
                    this.children[1].drawRect(-20, -15, 10, 30);
                    this.children[1].endFill();

                    this.children[2].clear();
                    this.children[2].beginFill(0x000000);
                    this.children[2].drawRect(-32, 10, -64, -20);
                    this.children[2].drawRect(-96, -32, 20, 64);
                    this.children[2].endFill();
                    this.children[2].beginFill(0xff0000);
                    this.children[2].drawRect(-20, -15, 10, 30);
                    this.children[2].endFill();
                }
                else if(this.targetx == -1 && this.targety == 0){
                    this.targetx = 0;
                    this.targety = -1;
                    this.pushx = 0;
                    this.pushy = -1;
                    this.children[1].clear();
                    this.children[1].beginFill(0xffffff);
                    this.children[1].drawRect(-15, -20, 30, 10);
                    this.children[1].endFill();
                    
                    this.children[2].clear();
                    this.children[2].beginFill(0x000000);
                    this.children[2].drawRect(-10, -96, 20, 64);
                    this.children[2].drawRect(-32, -96, 64, 20);
                    this.children[2].endFill();
                    this.children[2].beginFill(0xff0000);
                    this.children[2].drawRect(-15, -20, 30, 10)
                    this.children[2].endFill();
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
                this.children[0].addChild(new Piston(128, 384));
                this.children[0].addChild(new Detector(128, 512));
                this.children[0].addChild(new Conduit(128, 640));
                this.children[0].addChild(new StickySquare(128, 768));
            }
            Update(){
                if(Game.MBsPressed[0]){
                    this.children[0].children.forEach(child => {
                        if(Game.intersectpos(child.x, child.y, child.width, child.height, Game.uiContainer.mousePos.x, Game.uiContainer.mousePos.y)){
                            let clone = new child.constructor(Math.round(Game.worldContainer.mousePos.x / 64), Math.round(Game.worldContainer.mousePos.y / 64));

                            Game.addblock(clone);
                            Game.player.draggingThing = clone;
                            Game.player.children[2].visible = true;
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

        Game.blocks = [];
        
        Game.storeblock = (x, y, block) => {
            if(!Game.blocks[x]){
                Game.blocks[x] = [];
            }
            Game.blocks[x][y] = block;
        }

        Game.getblock = (x, y) => {
            if(Game.blocks[x]){
                return Game.blocks[x][y];
            }
            return undefined;
        }

        Game.addblock = (block) => { //Position must be multiple of 64
            Game.worldContainer.addChild(block);
            Game.storeblock(block.x / 64, block.y / 64, block);
        }

        Game.moveblock = (block, x, y, src) => {
            let blockx = block.position.x / 64;
            let blocky = block.position.y / 64;

            let newsrc = [...src];
            newsrc.push(block);

            let scheduledmoves = [];

            if(block instanceof StickySquare){
                let h1 = Game.getblock(blockx - 1, blocky);
                let h2 = Game.getblock(blockx, blocky - 1);
                let h3 = Game.getblock(blockx + 1, blocky);
                let h4 = Game.getblock(blockx, blocky + 1);
                newsrc.push(h1, h2, h3, h4);
                if(h1 && !src.includes(h1)){
                    let hitcheck = Game.getblock(h1.position.x / 64 + x, h1.position.y / 64 + y);
                    if(!hitcheck || !src.includes(hitcheck)){
                        Game.moveblock(h1, x, y, [...newsrc]);
                    }
                    else{
                        scheduledmoves.push(h1);
                    }
                }
                if(h2 && !src.includes(h2)){
                    let hitcheck = Game.getblock(h2.position.x / 64 + x, h2.position.y / 64 + y);
                    if(!hitcheck || !src.includes(hitcheck)){
                        Game.moveblock(h2, x, y, [...newsrc]);
                    }
                    else{
                        scheduledmoves.push(h2);
                    }
                }
                if(h3 && !src.includes(h3)){
                    let hitcheck = Game.getblock(h3.position.x / 64 + x, h3.position.y / 64 + y);
                    if(!hitcheck || !src.includes(hitcheck)){
                        Game.moveblock(h3, x, y, [...newsrc]);
                    }
                    else{
                        scheduledmoves.push(h3);
                    }
                }
                if(h4 && !src.includes(h4)){
                    let hitcheck = Game.getblock(h4.position.x / 64 + x, h4.position.y / 64 + y);
                    if(!hitcheck || !src.includes(hitcheck)){
                        Game.moveblock(h4, x, y, [...newsrc]);
                    }
                    else{
                        scheduledmoves.push(h4);
                    }
                }
            }
            else{
                let hit = Game.getblock(blockx + x, blocky + y);
                if(hit){
                    let hitcheck = Game.getblock(hit.position.x / 64 + x, hit.position.y / 64 + y);
                    if(!hitcheck || !src.includes(hitcheck)){
                        Game.moveblock(hit, x, y, [...newsrc]);
                    }
                    else{
                        scheduledmoves.push(hit);
                    }
                }
            }
            Game.storeblock(blockx, blocky, undefined);
            block.position.x += x*64;
            block.position.y += y*64;
            Game.storeblock(blockx + x, blocky + y, block);
            scheduledmoves.forEach(scheduled => {
                Game.moveblock(scheduled, x, y, [...newsrc]);
            });
        }

        Game.moveblockto = (block, x, y) => {
            Game.storeblock(block.position.x / 64, block.position.y / 64, undefined);
            block.position.x = x*64;
            block.position.y = y*64;
            Game.storeblock(block.position.x / 64, block.position.y / 64, block);
        }

        Game.elapsed = 0;

        Game.timescale = 1;

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

        Game.addblock(new SquareMaker(0,0));
        Game.addblock(new Piston(128,0));

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

            Game.elapsed += dif;

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
