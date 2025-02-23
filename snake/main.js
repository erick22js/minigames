
/*
    Initial Setup
*/
document.body.innerHTML = '<canvas width="680" height="750" id="display" style="border:2px solid black;">Your Browser is uncool!</canvas><br/>';
const ctx = display.getContext("2d");
const width = Number(display.width);
const height = Number(display.height);

const TILE_SIZE = 40;


/*
    Properties
*/

const game_width = Math.floor(width/TILE_SIZE);
const game_height = Math.floor((height-100)/TILE_SIZE);

let paused = false;
let game_over = false;
let score = 0;
let time = 0;
let speed = 2;
let step = 0;
const toward = [1, 0];
const actions = [];

const body_parts = [];
const obstacles = [];
const fruits = [];

const inputs = {
    "left": false, "right": false, "up": false, "down": false,
};


/*
    Rendering Module
*/

function redraw(){
    ctx.clearRect(0, 0, width, height);
    
    // Renders the game board
    for (let y=0; y<game_height; y++){
        for (let x=0; x<game_width; x++){
            ctx.fillStyle = "#282";
            ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = "#5d5";
            ctx.fillRect(x*TILE_SIZE+2, y*TILE_SIZE+2, TILE_SIZE-4, TILE_SIZE-4);
        }
    }
    
    // Renders the fruits
    for (let i=0; i<fruits.length; i++){
        let fruit = fruits[i];
        ctx.save();
        ctx.translate((fruit.pos[0] + 0.5)*TILE_SIZE, (fruit.pos[1] + 0.5)*TILE_SIZE);
        ctx.fillStyle = "red";
        ctx.fillRect(-12, -8, 24, 16);
        ctx.fillRect(-8, -4, 16, 16);
        ctx.fillRect(-8, -10, 6, 16);
        ctx.fillRect(2, -10, 6, 16);
        ctx.fillStyle = "brown";
        ctx.fillRect(-1, -16, 4, 10);
        ctx.restore();
    }
    
    // Renders the snake joints
    //let step = 0;
    for (let i=0; i<body_parts.length; i++){
        let cur = body_parts[i];
        
        // The Join
        if (i!=0){
            ctx.strokeStyle = "#129";
            ctx.lineWidth = TILE_SIZE-16;
            ctx.beginPath();
            ctx.moveTo((cur.pos[0]+0.5 + cur.dir[0]*step)*TILE_SIZE, (cur.pos[1]+0.5 + cur.dir[1]*step)*TILE_SIZE);
            ctx.lineTo((body_parts[i-1].pos[0]+0.5 + body_parts[i-1].dir[0]*step)*TILE_SIZE, (body_parts[i-1].pos[1]+0.5 + body_parts[i-1].dir[1]*step)*TILE_SIZE);
            ctx.stroke();
        }
    }
    // Renders the snake body parts
    for (let i=body_parts.length-1; i>=0; i--){
        let cur = body_parts[i];
        
        ctx.save();
        ctx.translate((cur.pos[0]+0.5 + cur.dir[0]*step)*TILE_SIZE, (cur.pos[1]+0.5 + cur.dir[1]*step)*TILE_SIZE);
        ctx.rotate(i==-1? Math.atan2(toward[1], toward[0]): Math.atan2(cur.dir[1], cur.dir[0]));
        // The Head
        if (i==0){
            ctx.fillStyle = "#25e";
            ctx.fillRect(-TILE_SIZE/2 + 4, -TILE_SIZE/2 + 4, TILE_SIZE-8, TILE_SIZE-8);
            ctx.fillStyle = "white";
            ctx.fillRect(TILE_SIZE/2 - 20, -TILE_SIZE/2 + 8, 16, 8);
            ctx.fillRect(TILE_SIZE/2 - 20, TILE_SIZE/2 - 16, 16, 8);
            ctx.fillStyle = "black";
            ctx.fillRect(TILE_SIZE/2 - 12, -TILE_SIZE/2 + 8, 8, 8);
            ctx.fillRect(TILE_SIZE/2 - 12, TILE_SIZE/2 - 16, 8, 8);
        }
        // The others body parts
        else {
            ctx.fillStyle = "#25e";
            ctx.fillRect(-TILE_SIZE/2 + 4, -TILE_SIZE/2 + 4, TILE_SIZE-8, TILE_SIZE-8);
            ctx.fillStyle = "#129";
            ctx.fillRect(-TILE_SIZE/2 + 12, -TILE_SIZE/2 + 12, TILE_SIZE-24, TILE_SIZE-24);
        }
        ctx.restore();
    }
    
    // Renders the GUI
    ctx.font = "30px Arial";
    if (game_over){
        ctx.fillStyle = "red";
        ctx.fillText("Game Over!", width - 200, height - 70);
    }
    else if (paused){
        ctx.fillStyle = "black";
        ctx.fillText("Paused", width - 150, height - 70);
    }
    else {
        ctx.fillStyle = "black";
    }
    ctx.fillText("Score: "+score, 10, height - 70);
    ctx.fillText("Time: "+time.toFixed(0), 10, height - 30);
    ctx.font = "20px Arial";
    ctx.fillText("WASD => Move", 270, height - 75);
    ctx.fillText("Esc => Pausa/Reinicia", 250, height - 35);
}


/*
    Core Functions
*/

function hasObstacleIn(x, y){
    for (let i=body_parts.length-1; i>=0; i--){
        let cur = body_parts[i];
        if (cur.pos[0]==x && cur.pos[1]==y){
            return true;
        }
    }
    return false;
}

function addNewFruit(){
    let pos = [Math.floor(Math.random()*game_width), Math.floor(Math.random()*game_height)];
    let has_obstacle = false;
    if (hasObstacleIn(pos[0], pos[1])){
        pos[0] = body_parts[body_parts.length-1].pos[0];
        pos[1] = body_parts[body_parts.length-1].pos[1];
    }
    
    let fruit = {
        "pos": pos,
    };
    fruits.push(fruit);
}

function addNewBodyPart(is_static=false){
    let back = body_parts[body_parts.length-1];
    body_parts.push({
        "pos": is_static? [back.pos[0], back.pos[1]]: [back.pos[0] - back.dir[0], back.pos[1] - back.dir[1]],
        "dir": is_static? [0, 0]: [back.dir[0], back.dir[1]],
    });
}


/*
    Application Functions
*/

function restart(){
    paused = false;
    game_over = false;
    score = 0;
    time = 0;
    speed = 2;
    step = 0;
    toward[0] = 1;
    toward[1] = 0;
    actions.length = 0;
    
    body_parts.length = 0;
    body_parts.push({
        "pos": [5, 3],
        "dir": [toward[0], toward[1]],
    });
    for (let i=0; i<2; i++){
        addNewBodyPart();
    }
    obstacles.length = 0;
    fruits.length = 0;
    addNewFruit();
    
    inputs.left = inputs.right = inputs.up = inputs.down = false;
}

function update(dt){
    // Update Game Logic
    if (!(game_over || paused)){
        step += dt*speed;
        time += dt;
        if (step >= 1){
            step -= 1;
            for (let i=body_parts.length-1; i>=0; i--){
                let cur = body_parts[i];
                
                if (i==0){
                    cur.pos[0] += cur.dir[0];
                    cur.pos[1] += cur.dir[1];
                }
                else {
                    let next = body_parts[i-1];
                    cur.pos[0] = next.pos[0];
                    cur.pos[1] = next.pos[1];
                }
            }
            for (let i=body_parts.length-1; i>=0; i--){
                let cur = body_parts[i];
                
                if (i==0){
                    do {
                        if (actions.length > 0){
                            let dir = actions.shift();
                            toward[0] = dir[0];
                            toward[1] = dir[1];
                        }
                        else {
                            break;
                        }
                    } while (toward[0]==-cur.dir[0] || toward[1]==-cur.dir[1]);
                    if (toward[0]!=-cur.dir[0] && toward[1]!=-cur.dir[1]){
                        cur.dir[0] = toward[0];
                        cur.dir[1] = toward[1];
                    }
                }
                else {
                    let next = body_parts[i-1];
                    cur.dir[0] = next.pos[0] - cur.pos[0];
                    cur.dir[1] = next.pos[1] - cur.pos[1];
                }
            }
        }
        // Handle collisions
        if (true){
            let head = [Math.round(body_parts[0].pos[0]+body_parts[0].dir[0]*step), Math.round(body_parts[0].pos[1]+body_parts[0].dir[1]*step)];
            for (let i=0; i<fruits.length; i++){
                let fruit = fruits[i].pos;
                if (head[0]==fruit[0] && head[1]==fruit[1]){
                    fruits.splice(i, 1);
                    addNewFruit();
                    score += 10;
                    if (speed < 8.5) speed += 0.075;
                    addNewBodyPart(true);
                    i--;
                }
            }
            for (let i=1; i<body_parts.length; i++){
                let part = body_parts[i].pos;
                if (head[0]==part[0] && head[1]==part[1]){
                    game_over = true;
                }
            }
            if (Math.floor(body_parts[0].pos[0]+body_parts[0].dir[0]) < 0 || Math.floor(body_parts[0].pos[0]+body_parts[0].dir[0]) >= game_width || Math.floor(body_parts[0].pos[1]+body_parts[0].dir[1]) < 0 || Math.floor(body_parts[0].pos[1]+body_parts[0].dir[1]) >= game_height){
                game_over = true;
            }
        }
        
    }
    /*if (step < 0.25 && body_parts[0].dir[0] != -toward[0] && body_parts[0].dir[1] != -toward[1]){
        body_parts[0].dir[0] = toward[0];
        body_parts[0].dir[1] = toward[1];
    }*/
    
    // Renderize the game
    redraw();
}


/*
    Page Events
*/
let _last_time = 0;
function _Animate(time){
    let dt = (time-_last_time)/1000;
    if (dt > 0.5) dt = 1/60;
    _last_time = time;
    update(dt);
    requestAnimationFrame(_Animate);
}
//window.onload = function(){
    restart();
    _Animate(0);
//}

display.onmousedown = function(ev){
    ev.preventDefault();
    let x = (ev.clientX - display.getBoundingClientRect().left);
    let y = (ev.clientY - display.getBoundingClientRect().top);
}

window.onkeydown = function(ev){
    if (ev.code == 'Escape'){
        if (!game_over){
            paused = !paused;
        }
        else {
            restart();
        }
    }
    if (!(paused || game_over)){
        if ((ev.code == 'KeyW' || ev.code == 'ArrowUp') && (actions.length? actions[actions.length-1][1] != -1: true)){
            if (actions.length < 5){
                actions.push([0, -1]);
            }
            else {
                actions[4][0] = 0;
                actions[4][1] = -1;
            }
        }
        if ((ev.code == 'KeyA' || ev.code == 'ArrowLeft') && (actions.length? actions[actions.length-1][0] != -1: true)){
            if (actions.length < 5){
                actions.push([-1, 0]);
            }
            else {
                actions[4][0] = -1;
                actions[4][1] = 0;
            }
        }
        if ((ev.code == 'KeyS' || ev.code == 'ArrowDown') && (actions.length? actions[actions.length-1][1] != 1: true)){
            if (actions.length < 5){
                actions.push([0, 1]);
            }
            else {
                actions[4][0] = 0;
                actions[4][1] = 1;
            }
        }
        if ((ev.code == 'KeyD' || ev.code == 'ArrowRight') && (actions.length? actions[actions.length-1][0] != 1: true)){
            if (actions.length < 5){
                actions.push([1, 0]);
            }
            else {
                actions[4][0] = 1;
                actions[4][1] = 0;
            }
        }
    }
}

window.onkeyup = function(ev){
    if (ev.code == 'Escape'){
        
    }
}

document.oncontextmenu = function(ev){
    ev.preventDefault();
}

