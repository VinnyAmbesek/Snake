cc.Class({
    extends: cc.Component,

    properties: {
        boardNode: cc.Node,
        touchNode: cc.Node,
        tile: cc.Prefab,
        headColor: cc.Color,
        bodyColor: cc.Color, 
        appleColor: cc.Color,
        emptyColor: cc.Color,
        tileSize: 50,
        gridSize: 15,
        timer: 0.75
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    getRandomApple (){
        let pos = {};
        pos.x = Math.floor(Math.random() * 15); 
        pos.y = Math.floor(Math.random() * 15);

        while (! this.isEmpty( pos )){
            pos.x++;
            if (pos.x >= this.gridSize){
                pos.x = 0;
                pos.y++;
            }
            if (pos.y >= this.gridSize) pos.y = 0;
        }
        return pos;
    },

    isEmpty(pos){
        if (pos.x == this.snakeHead.x && pos.y == this.snakeHead.y) return false;

        for (let i = 0; i < this.snakeBody.length; i++) {
            if (pos.x == this.snakeBody[i].x && pos.y == this.snakeBody[i].y) return false;
        }
        return true;
    },

    isBody(pos){
        for (let i = 0; i < this.snakeBody.length; i++) {
            if (pos.x == this.snakeBody[i].x && pos.y == this.snakeBody[i].y) return true;
        }
        return false;

    },

    onKeyDown (event){
        switch(event.keyCode) {
            case cc.macro.KEY.a:
                if (this.snakeDirection != this.enumDirection["right"]) this.nextSnakeDirection = this.enumDirection["left"];
                break;
            case cc.macro.KEY.left:
                if (this.snakeDirection != this.enumDirection["right"]) this.nextSnakeDirection = this.enumDirection["left"];
                break;
            case cc.macro.KEY.d:
                if (this.snakeDirection != this.enumDirection["left"]) this.nextSnakeDirection = this.enumDirection["right"];
                break;
            case cc.macro.KEY.right:
                if (this.snakeDirection != this.enumDirection["left"]) this.nextSnakeDirection = this.enumDirection["right"];
                break;
            case cc.macro.KEY.w:
                if (this.snakeDirection != this.enumDirection["down"]) this.nextSnakeDirection = this.enumDirection["up"];
                break;
            case cc.macro.KEY.up:
                if (this.snakeDirection != this.enumDirection["down"]) this.nextSnakeDirection = this.enumDirection["up"];
                break;
            case cc.macro.KEY.s:
                if (this.snakeDirection != this.enumDirection["up"]) this.nextSnakeDirection = this.enumDirection["down"];
                break;
            case cc.macro.KEY.down:
                if (this.snakeDirection != this.enumDirection["up"]) this.nextSnakeDirection = this.enumDirection["down"];
                break;
        }
    },

    onTouchStart (event){
        this.touchStart = event.touch.getLocation();
    },

    onTouchEnd (event){
        this.touchEnd = event.touch.getLocation();
        
        // positive -> right; negative -> left;
        let horzDiff = this.touchEnd.x - this.touchStart.x;
        // positive -> up; negative -> down;
        let vertDiff = this.touchEnd.y - this.touchStart.y;

        if (Math.abs(horzDiff) > Math.abs(vertDiff)){
            if (horzDiff > 0){
                // right
                if (this.snakeDirection != this.enumDirection["left"]) this.nextSnakeDirection = this.enumDirection["right"];
            } else if (horzDiff < 0) {
                // left
                if (this.snakeDirection != this.enumDirection["right"]) this.nextSnakeDirection = this.enumDirection["left"];
            }
        } else {
            if (vertDiff > 0){
                // up
                if (this.snakeDirection != this.enumDirection["down"]) this.nextSnakeDirection = this.enumDirection["up"];
            } else if (vertDiff < 0) {
                // down
                if (this.snakeDirection != this.enumDirection["up"]) this.nextSnakeDirection = this.enumDirection["down"];
            }

        }

    },

    onLoad: function () {
        // add key down and key up event
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.touchNode.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    },

    start () {
        // set timer
        this.elapsed = 0;
        this.nextSnakeDirection = null;

        //fill grid with tiles
        this.gridTiles = new Array(this.gridSize);
        for (let i = 0; i < this.gridSize; i++) {
            this.gridTiles[i] = new Array(this.gridSize);

            for (let j = 0; j < this.gridSize; j++) {
                let cell = cc.instantiate(this.tile);
                this.gridTiles[i][j] = cell;

                cell.parent = this.boardNode;

            }
        }

        // create snake
        this.snakeHead = {x: 6, y: 7};
        this.snakeBody = [ {x: 5, y: 7}, {x: 4, y: 7} ];

        this.gridTiles[this.snakeHead.x][this.snakeHead.y].color = this.headColor;
        this.gridTiles[this.snakeBody[0].x][this.snakeBody[0].y].color = this.bodyColor;
        this.gridTiles[this.snakeBody[1].x][this.snakeBody[1].y].color = this.bodyColor;

        // create apple
        this.apple = {x: 8, y: 7};
        this.gridTiles[this.apple.x][this.apple.y].color = this.appleColor;

        this.applesToEat = (this.gridSize * this.gridSize) - 3;

        // create enum
        this.enumDirection = {right: 0, left: 1, up: 2, down: 3};
        this.snakeDirection = this.enumDirection["right"];
    },

    update (dt) {
        this.elapsed += dt;
        // do a move
        if (this.elapsed >= this.timer){
            this.elapsed = this.elapsed - this.timer;

            if (this.nextSnakeDirection != null){
                this.snakeDirection = this.nextSnakeDirection;
                this.nextSnakeDirection = null;
            }

            let direction = {x: 0, y: 0};
            switch(this.snakeDirection) {
                case this.enumDirection["right"]:
                    direction.x = 1;
                    break;
                case this.enumDirection["left"]:
                    direction.x = -1;
                    break;
                case this.enumDirection["up"]:
                    direction.y = -1;
                    break;
                case this.enumDirection["down"]:
                    direction.y = 1;
                    break;
                default:
                // code block
            }
            let nextHead = {};
            nextHead.x = (this.snakeHead.x+direction.x) % this.gridSize;
            if (nextHead.x < 0) nextHead.x = this.gridSize-1;
            nextHead.y = (this.snakeHead.y+direction.y) % this.gridSize;
            if (nextHead.y < 0) nextHead.y = this.gridSize-1;
            
            if (nextHead.x == this.apple.x && nextHead.y == this.apple.y){
                // got apple
                this.applesToEat--;
                // decrease timer
                this.timer -= 0.5/222;

                //turns head into body
                this.snakeBody.unshift( {x: this.snakeHead.x, y: this.snakeHead.y} );
                this.gridTiles[this.snakeHead.x][this.snakeHead.y].color = this.bodyColor;

                //turns apple into head
                this.snakeHead.x = this.apple.x;
                this.snakeHead.y = this.apple.y;

                this.gridTiles[this.snakeHead.x][this.snakeHead.y].color = this.headColor;

                //move apple to random postion
                if (this.applesToEat > 0){
                    // create new apple
                    this.apple = this.getRandomApple();
                    this.gridTiles[this.apple.x][this.apple.y].color = this.appleColor;
                } else {
                    // you won
                }

            } else if(this.isBody(nextHead)) {
                cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
                cc.director.loadScene("main");
            } else {
                //still hungry

                let last = this.snakeBody[this.snakeBody.length - 1];
                
                // last becomes nothing
                this.gridTiles[last.x][last.y].color = this.emptyColor;
                // head becomes body
                this.gridTiles[this.snakeHead.x][this.snakeHead.y].color = this.bodyColor;
                // next becomes head
                this.gridTiles[nextHead.x][nextHead.y].color = this.headColor;

                // update body array
                for (let i = this.snakeBody.length - 1; i > 0; i--) {
                    this.snakeBody[i].x = this.snakeBody[i-1].x % this.gridSize;
                    this.snakeBody[i].y = this.snakeBody[i-1].y % this.gridSize;
                }
                this.snakeBody[0].x = this.snakeHead.x % this.gridSize;
                this.snakeBody[0].y = this.snakeHead.y % this.gridSize;

                //update head position
                this.snakeHead.x = nextHead.x;
                this.snakeHead.y = nextHead.y;
            }

        }
    },
});
