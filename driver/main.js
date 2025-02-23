
/*
    Initial Setup
*/
document.body.innerHTML = '<canvas width="200" height="700" id="display" style="border:2px solid black;">Your Browser is uncool!</canvas>';
const ctx = display.getContext("2d");
const width = Number(display.width);
const height = Number(display.height);

/*
    Properties
*/
const camera = {
    "distance": 0,
};
const player = {
    "distance": 0,
    "check": 0,
    "offset": width/2,
    "velocity": 200,
};
const obstacles = [];
const inputs = {
    "left": 0,
    "right": 0,
};

const CAR_WIDTH = 35;
const CAR_HEIGHT = 60;


/*
    Rendering Functions
*/
function drawCar(x, y, color, flip=false){
    // Wheels
    ctx.fillStyle = "black";
    ctx.fillRect(x-CAR_WIDTH/2 - 2, y-CAR_HEIGHT/2 + 4, 8, 12);
    ctx.fillRect(x+CAR_WIDTH/2 - 6, y-CAR_HEIGHT/2 + 4, 8, 12);
    ctx.fillRect(x-CAR_WIDTH/2 - 2, y+CAR_HEIGHT/2 - 16, 8, 12);
    ctx.fillRect(x+CAR_WIDTH/2 - 6, y+CAR_HEIGHT/2 - 16, 8, 12);
    // Chasi
    ctx.fillStyle = color;
    ctx.fillRect(x-CAR_WIDTH/2, y-CAR_HEIGHT/2, CAR_WIDTH, CAR_HEIGHT);
    // Windows
    ctx.fillStyle = "black";
    if (flip){
        ctx.fillRect(x-CAR_WIDTH/2 + 4, y-CAR_HEIGHT/2 + 8, CAR_WIDTH-8, 8);
        ctx.fillRect(x-CAR_WIDTH/2 + 4, y+CAR_HEIGHT/2 - 28, CAR_WIDTH-8, 8);
    }
    else {
        ctx.fillRect(x-CAR_WIDTH/2 + 4, y-CAR_HEIGHT/2 + 20, CAR_WIDTH-8, 8);
        ctx.fillRect(x-CAR_WIDTH/2 + 4, y+CAR_HEIGHT/2 - 16, CAR_WIDTH-8, 8);
    }
    // Flashlights
    ctx.fillStyle = "white";
    if (flip){
        ctx.fillRect(x-CAR_WIDTH/2 + 4, y+CAR_HEIGHT/2 - 8, 8, 4);
        ctx.fillRect(x+CAR_WIDTH/2 - 12, y+CAR_HEIGHT/2 - 8, 8, 4);
    }
    else {
        ctx.fillRect(x-CAR_WIDTH/2 + 4, y-CAR_HEIGHT/2 + 4, 8, 4);
        ctx.fillRect(x+CAR_WIDTH/2 - 12, y-CAR_HEIGHT/2 + 4, 8, 4);
    }
}

function redraw(){
    // Draw Road
    ctx.fillStyle = "#BBB";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 5, height);
    ctx.fillRect(width-5, 0, 5, height);
    ctx.fillStyle = "white";
    for (let i=0; i<(height+20); i+=20){
        let y = (i + camera.distance)%(height+ 20) - 20;
        ctx.fillRect(((width-5)*3)/4, y, 5, 8);
        ctx.fillRect((width-5)/2, y, 5, 8);
        ctx.fillRect((width-5)/4, y, 5, 8);
    }
    
    // Draw Obstacles
    for (let i=0; i<obstacles.length; i++){
        let obs = obstacles[i];
        if (obs.type=="car"){
            drawCar(obs.offset, height - obs.distance + camera.distance, "blue", obs.velocity < 0);
        }
    }
    
    // Draw Player
    drawCar(player.offset, (height - player.distance) + camera.distance, "red");
    
    // Draw UI
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: "+(player.distance/10).toFixed(0), 5, 25);
}


/*
    Application and game Logic Functions
*/
function spawnObstacles(){
    let velocity = Math.random()*100 - 50;
    obstacles.push({
        "type": "car",
        "distance": player.distance + height,
        "offset": Math.floor(Math.random()*4)*(width/4) + width/8,
        "velocity": velocity,
    });
}

function update(dt=0){
    // Update Player logic
    player.distance += player.velocity*dt;
    player.offset += (inputs.right - inputs.left)*player.velocity*dt*1.25;
    player.offset = player.offset < 25? 25: player.offset > width-25? width-25: player.offset;
    
    let check = Math.floor(player.distance/400);
    if (player.check != check){
        if (player.velocity < 1000) player.velocity += Math.random()*5 + 5;
        spawnObstacles();
        player.check = check;
    }
    camera.distance = player.distance - 80;
    
    // Update Obstacles logic
    for (let i=0; i<obstacles.length; i++){
        let obs = obstacles[i];
        if (obs.type=="car"){
            obs.distance += obs.velocity*dt;
        }
        
        // Check collision to player
        if (((obs.distance-CAR_HEIGHT/2 >= player.distance-CAR_HEIGHT/2 && obs.distance-CAR_HEIGHT/2 < player.distance+CAR_HEIGHT/2) || (player.distance-CAR_HEIGHT/2 >= obs.distance-CAR_HEIGHT/2 && player.distance-CAR_HEIGHT/2 < obs.distance+CAR_HEIGHT/2)) &&
            ((obs.offset-CAR_WIDTH/2 >= player.offset-CAR_WIDTH/2 && obs.offset-CAR_WIDTH/2 < player.offset+CAR_WIDTH/2) || (player.offset-CAR_WIDTH/2 >= obs.offset-CAR_WIDTH/2 && player.offset-CAR_WIDTH/2 < obs.offset+CAR_WIDTH/2))){
            alert("Você Perdeu! Sua distância: "+Math.floor(player.distance/10));
            obs.length = 0;
            player.distance = 0;
            player.check = 0;
            player.velocity = 200;
        }
        
        // Delete obstacles far away
        if (obs.distance < player.distance - height/2){
            obstacles.splice(i, 1);
            i--;
        }
    }
    
    // Draw the scene
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
    _Animate(0);
//}
window.onkeydown = function(ev){
    if (ev.code === 'KeyA'){
        inputs.left = 1;
    }
    if (ev.code === 'KeyD'){
        inputs.right = 1;
    }
}
window.onkeyup = function(ev){
    if (ev.code === 'KeyA'){
        inputs.left = 0;
    }
    if (ev.code === 'KeyD'){
        inputs.right = 0;
    }
}
