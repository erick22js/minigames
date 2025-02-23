
/*
    Initial Setup
*/
document.body.innerHTML = '<canvas width="700" height="700" id="display" style="border:2px solid black;">Your Browser is uncool!</canvas>';
const ctx = display.getContext("2d");
const width = Number(display.width);
const height = Number(display.height);


/*
    Properties
*/

let bird = {
    "x": 100, "y": height/2,
    "look": 0,
    "force": 0,
    "speed": 300,
    "blink": false,
};

let pipes = [];

let paused = true;
let game_over = false;
let score = 0;

const BIRD_WIDTH = 50;
const BIRD_HEIGHT = 50;
const PIPES_DISTANCE = 500;
const GAP_SPACE = 200;
const GAP_WIDTH = 100;


/*
    Rendering Module
*/

function render(){
    ctx.fillStyle = "cyan";
    ctx.fillRect(0, 0, width, height);
    
    // Draw the Pipes
    for (let i=0; i<pipes.length; i++){
        let pipe = pipes[i];
        
        let grad = ctx.createLinearGradient(pipe.x - 50, 0, pipe.x + 50, 0);
        grad.addColorStop(0, 'darkgreen');
        grad.addColorStop(0.5, 'green');
        grad.addColorStop(1, 'lime');
        
        ctx.fillStyle = "black";
        ctx.fillRect(pipe.x - 54, -4, 108, pipe.y-GAP_SPACE/2 + 8);
        ctx.fillRect(pipe.x - 54, pipe.y+GAP_SPACE/2-4, 108, height + 5);
        
        ctx.fillStyle = grad;
        ctx.fillRect(pipe.x - 50, 0, 100, pipe.y-GAP_SPACE/2);
        ctx.fillRect(pipe.x - 50, pipe.y+GAP_SPACE/2, 100, height);
        
        ctx.fillStyle = "black";
        ctx.fillRect(pipe.x - 64, pipe.y-GAP_SPACE/2 - 4 - 50, 128, 58);
        ctx.fillRect(pipe.x - 64, pipe.y+GAP_SPACE/2 - 4, 128, 58);
        
        ctx.fillStyle = grad;
        ctx.fillRect(pipe.x - 60, pipe.y-GAP_SPACE/2 - 50, 120, 50);
        ctx.fillRect(pipe.x - 60, pipe.y+GAP_SPACE/2, 120, 50);
    }
    
    // Draw the bird
    if (true){
        ctx.save();
        ctx.translate(bird.x, bird.y);
        ctx.rotate(bird.look);
        
        ctx.strokeStyle = "black";
        ctx.lineWidth = 13;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-20, 10);
        ctx.lineTo(-35, 18);
        ctx.moveTo(-20, 10);
        ctx.lineTo(-32, 2);
        ctx.stroke();
        
        ctx.strokeStyle = "red";
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-20, 10);
        ctx.lineTo(-35, 18);
        ctx.moveTo(-20, 10);
        ctx.lineTo(-32, 2);
        ctx.stroke();
        
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(0, 0, 27, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI*2);
        ctx.fill();
        
        ctx.strokeStyle = "black";
        ctx.lineWidth = 16;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(18, 5);
        ctx.lineTo(35, 5);
        ctx.moveTo(18, 12);
        ctx.lineTo(25, 12);
        ctx.stroke();
        
        ctx.strokeStyle = "gold";
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(18, 5);
        ctx.lineTo(35, 5);
        ctx.moveTo(18, 12);
        ctx.lineTo(25, 12);
        ctx.stroke();
        
        if (bird.blink){
            ctx.strokeStyle = "black";
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(20, -10);
            ctx.lineTo(5, -17);
            ctx.moveTo(20, -10);
            ctx.lineTo(8, 2);
            ctx.stroke();
        }
        else {
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(10, -10, 10, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(15, -10, 5, 0, Math.PI*2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.font = "bold 50px Arial";
    ctx.lineWidth = 2;
    let sc = score < 0? 0: Math.floor(score);
    ctx.fillText("Score: "+sc, 15, 65);
    ctx.strokeText("Score: "+sc, 15, 65);
    if (paused || game_over){
        let text = "";
        if (paused){
            text = "Paused";
            ctx.font = "bold 50px Arial";
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
        }
        if (game_over){
            text = "Game Over!";
            ctx.font = "bold 80px Arial";
            ctx.fillStyle = "red";
            ctx.strokeStyle = "black";
        }
        ctx.lineWidth = 2;
        let wid = ctx.measureText(text).width;
        ctx.fillText(text, (width-wid)/2, (height-100)/2);
        ctx.strokeText(text, (width-wid)/2, (height-100)/2);
    }
}


/*
    Core Functions
*/

function randomizePipe(pipe){
    pipe.y = height*0.2 + Math.random()*0.6*height;
}

function flap(){
    bird.force = -550;
    bird.look = -1.1;
}


/*
    Application Functions
*/

function restart(){
    // Reset Pipes
    pipes.length = 0;
    for (let i=0; i<Math.ceil((width*2)/PIPES_DISTANCE); i++){
        pipes.push({
            "x": width + i*PIPES_DISTANCE, "y": height/2,
        });
        randomizePipe(pipes[i]);
    }
    
    // Reset Bird
    bird.x = 100;
    bird.y = height/2;
    bird.look = 0;
    bird.force = 0;
    bird.speed = 200;
    
    paused = false;
    game_over = false;
    score = -(pipes[0].x-bird.x)/PIPES_DISTANCE + 1;
}

function update(dt){
    // Update logic
    if (!(paused)){
        if (true){
            bird.y += bird.force*dt;
            bird.force += 1500*dt;
            if (bird.look < 1.1) bird.look += dt*2.5;
            
            // Check collisions or out of bounds
            if (!game_over){
                bird.blink = (score+5.5)%2 < 0.1;
                score += (bird.speed*dt)/PIPES_DISTANCE;
                if (bird.speed < 500) bird.speed += dt*5;
                for (let i=0; i<pipes.length; i++){
                    let pipe = pipes[i];
                    //pipe.highlight = false;
                    if (((bird.x >= pipe.x-GAP_WIDTH/2 && bird.x < pipe.x+GAP_WIDTH/2) || (pipe.x-GAP_WIDTH/2 >= bird.x-BIRD_WIDTH/2 && pipe.x-GAP_WIDTH/2 < bird.x+BIRD_WIDTH/2)) &&
                        ((bird.y < pipe.y-GAP_SPACE/2) || (bird.y+BIRD_HEIGHT/2 >= pipe.y+GAP_SPACE/2))){
                        //pipe.highlight = true;
                        game_over = true;
                        flap();
                        if (bird.y < pipe.y && bird.x > pipe.x - GAP_WIDTH/2){
                            bird.force *= -1;
                            bird.look = 0;
                        }
                    }
                }
                if (bird.y < BIRD_HEIGHT/-2 || bird.y > height + BIRD_HEIGHT/2){
                    game_over = true;
                    flap();
                    if (bird.y < 0) {
                        bird.force *= -1;
                        bird.look = 1.1;
                    }
                }
            }
            else {
                bird.blink = true;
            }
        }
        for (let i=0; i<pipes.length; i++){
            let pipe = pipes[i];
            if (!game_over){
                pipe.x -= bird.speed*dt;
                if (pipe.x <= -75){
                    pipe.x += pipes.length*PIPES_DISTANCE;
                    randomizePipe(pipe);
                }
            }
        }
    }
    
    render();
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
        if (game_over){
            restart();
        }
        else {
            paused = !paused;
        }
    }
    else if (!(paused || game_over)){
        /*if (ev.code == 'KeyW'){
            bird.y -= 5;
        }
        if (ev.code == 'KeyS'){
            bird.y += 5;
        }*/
        flap();
    }
}

document.oncontextmenu = function(ev){
    ev.preventDefault();
}

