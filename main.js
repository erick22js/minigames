
/*
    Initial Setup
*/
document.body.innerHTML = '<canvas width="700" height="700" id="display" style="border:2px solid black;">Your Browser is uncool!</canvas>';
const ctx = display.getContext("2d");
const width = Number(display.width);
const height = Number(display.height);


/*
    Game Properties
*/
let piece = null;
let next = [];
let rotation = 0;
let position = [0, 0];
let fall = 0;
let move = 0;
const board = [];
const strips = [];
let strips_len = 0.5;
let score = 0;
let row = 1;
let difficult = 0;
let next_difficult = 0;

let running = true;
let paused = false;

const TILE_SIZE = 35;

const inputs = {
    "left": false, "right": false, "down": false, "up": false,
};

const PIECES_COLOR = [
    ["#88f", "#44f", "#00f", "#008", "#004"], // Blue
    ["#fc8", "#fa4", "#f80", "#840", "#420"], // Orange
    ["#8ff", "#4ff", "#0ff", "#088", "#044"], // Cyan
    ["#eee", "#ee8", "#ee0", "#880", "#440"], // Yellow
    ["#8f8", "#4f4", "#0f0", "#080", "#080"], // Green
    ["#f8f", "#f4f", "#f0f", "#808", "#404"], // Pink
    ["#f88", "#f44", "#f00", "#800", "#400"], // Red
];
const PIECES = [
    [ // L
        [
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 1, 0,
            0, 0, 0, 0,
        ],
        [
            0, 0, 1, 0,
            1, 1, 1, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
        ],
        [
            1, 1, 0, 0,
            0, 1, 0, 0,
            0, 1, 0, 0,
            0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0,
            1, 1, 1, 0,
            1, 0, 0, 0,
            0, 0, 0, 0,
        ],
    ],
    [ // L inverted
        [
            0, 2, 0, 0,
            0, 2, 0, 0,
            2, 2, 0, 0,
            0, 0, 0, 0,
        ],
        [
            0, 0, 0, 0,
            2, 2, 2, 0,
            0, 0, 2, 0,
            0, 0, 0, 0,
        ],
        [
            0, 2, 2, 0,
            0, 2, 0, 0,
            0, 2, 0, 0,
            0, 0, 0, 0,
        ],
        [
            2, 0, 0, 0,
            2, 2, 2, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
        ],
    ], // T
    [
        [
            0, 0, 0, 0,
            3, 3, 3, 0,
            0, 3, 0, 0,
            0, 0, 0, 0,
        ],
        [
            0, 3, 0, 0,
            3, 3, 0, 0,
            0, 3, 0, 0,
            0, 0, 0, 0,
        ],
        [
            0, 3, 0, 0,
            3, 3, 3, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
        ],
        [
            0, 3, 0, 0,
            0, 3, 3, 0,
            0, 3, 0, 0,
            0, 0, 0, 0,
        ],
    ],
    [ // Square
        [
            0, 0, 0, 0,
            0, 4, 4, 0,
            0, 4, 4, 0,
            0, 0, 0, 0,
        ],
    ],
    [ // Z
        [
            0, 0, 0, 0,
            5, 5, 0, 0,
            0, 5, 5, 0,
            0, 0, 0, 0,
        ],
        [
            0, 5, 0, 0,
            5, 5, 0, 0,
            5, 0, 0, 0,
            0, 0, 0, 0,
        ],
    ],
    [ // S
        [
            0, 0, 0, 0,
            0, 6, 6, 0,
            6, 6, 0, 0,
            0, 0, 0, 0,
        ],
        [
            0, 6, 0, 0,
            0, 6, 6, 0,
            0, 0, 6, 0,
            0, 0, 0, 0,
        ],
    ],
    [ // I
        [
            0, 7, 0, 0,
            0, 7, 0, 0,
            0, 7, 0, 0,
            0, 7, 0, 0,
        ],
        [
            0, 0, 0, 0,
            7, 7, 7, 7,
            0, 0, 0, 0,
            0, 0, 0, 0,
        ],
    ],
];


/*
    Renderization Functions
*/
function drawTile(x, y, cl, lighten=false){
    ctx.save();
    ctx.translate(x*TILE_SIZE, y*TILE_SIZE);
    ctx.fillStyle = cl[2-lighten];
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    if (ctx.globalAlpha == 1){
        ctx.fillStyle = cl[0];
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(TILE_SIZE, 0);
        ctx.lineTo(TILE_SIZE/2, TILE_SIZE/2);
        ctx.fill();
        ctx.fillStyle = cl[1-lighten];
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(TILE_SIZE/2, TILE_SIZE/2);
        ctx.lineTo(0, TILE_SIZE);
        ctx.fill();
        ctx.fillStyle = cl[3-lighten];
        ctx.beginPath();
        ctx.moveTo(TILE_SIZE, 0);
        ctx.lineTo(TILE_SIZE/2, TILE_SIZE/2);
        ctx.lineTo(TILE_SIZE, TILE_SIZE);
        ctx.fill();
        ctx.fillStyle = cl[4-lighten];
        ctx.beginPath();
        ctx.moveTo(0, TILE_SIZE);
        ctx.lineTo(TILE_SIZE, TILE_SIZE);
        ctx.lineTo(TILE_SIZE/2, TILE_SIZE/2);
        ctx.fill();
        ctx.fillStyle = cl[2-lighten];
        if (lighten) ctx.fillRect(TILE_SIZE*0.25, TILE_SIZE*0.25, TILE_SIZE*0.5, TILE_SIZE*0.5);
        else ctx.fillRect(TILE_SIZE*0.15, TILE_SIZE*0.15, TILE_SIZE*0.7, TILE_SIZE*0.7);
    }
    ctx.restore();
}

function drawEmptyTile(x, y){
    ctx.save();
    ctx.translate(x*TILE_SIZE, y*TILE_SIZE);
    ctx.fillStyle = "#444";
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = "#222";
    ctx.fillRect(TILE_SIZE*0.1, TILE_SIZE*0.1, TILE_SIZE*0.8, TILE_SIZE*0.8);
    ctx.restore();
}

function drawPiece(piece, position, rotation, clip=true, alpha=1.0){
    ctx.globalAlpha = alpha;
    for (let py=0; py<4; py++){
        for (let px=0; px<4; px++){
            let x = px+position[0];
            let y = py+position[1];
            if ((clip? x>=0 && x<10 && y>=0 && y<20: true) && piece[rotation][py*4 + px])
                drawTile(x, y, PIECES_COLOR[piece[rotation][py*4 + px]-1], true);
        }
    }
    ctx.globalAlpha = 1.0;
}

function redraw(){
    ctx.clearRect(0, 0, width, height);
    
    // Renders the entire board
    for (let y=0; y<20; y++){
        for (let x=0; x<10; x++){
            if (board[y][x])
                drawTile(x, y, board[y][x], false);
            else
                drawEmptyTile(x, y);
        }
    }
    
    // Renders the current piece and preview
    if (piece){
        drawPiece(piece, position, rotation);
        let cur_pos = [position[0], position[1]]
        
        for (let i=0; i<24; i++){
            position[1] += 1;
            if (testPiece()){
                position[1] -= 1;
                break;
            }
        }
        drawPiece(piece, position, rotation, true, 0.35);
        position[0] = cur_pos[0];
        position[1] = cur_pos[1];
    }
    
    // Renders next piece
    for (let y=1; y<7; y++){
        for (let x=12; x<17; x++){
            drawEmptyTile(x, y);
        }
    }
    drawPiece(next[0], [13, 2], 0, false);
    
    // Clear the strips
    for (let y=0; y<20; y++){
        ctx.fillStyle = "white";
        if (strips[y]) {
            ctx.fillRect(TILE_SIZE*5*(1-strips_len), y*TILE_SIZE, TILE_SIZE*10*strips_len, TILE_SIZE);
        }
    }
    
    // Draw the ui
    ctx.fillStyle = "black";
    ctx.fillRect(TILE_SIZE*10 - 1, 0, 2, height);
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    if (!running) ctx.fillText("Press 'Esc' to restart!", TILE_SIZE*10 + 50, TILE_SIZE*10 - 40);
    else if (paused) ctx.fillText("Paused", TILE_SIZE*10 + 100, TILE_SIZE*10 - 40);
    ctx.fillText("Score: "+score+" "+row+"x", TILE_SIZE*10 + 50, TILE_SIZE*10);
    ctx.fillText("Difficult: "+difficult, TILE_SIZE*10 + 50, TILE_SIZE*10 + 40);
    ctx.fillText("Next in "+next_difficult.toFixed(0), TILE_SIZE*10 + 50, TILE_SIZE*10 + 80);
}


/*
    Game Logic
*/
// Return true on colision
function testPiece(){
    if (piece){
        for (let py=0; py<4; py++){
            for (let px=0; px<4; px++){
                let x = px+position[0];
                let y = py+position[1];
                if (piece[rotation][py*4 + px]){
                    if (x>=0 && x<10 && y<20) {
                        if (y >= 0 && board[y][x]){
                            return true;
                        }
                    }
                    else {
                        return true;
                    }
                }
            }
        }
    }
    return false
}

function checkForFullLines(){
    let any_full = 0;
    for (let y=0; y<20; y++){
        let full = true;
        for (let x=0; x<10; x++){
            if (!board[y][x]){
                full = false;
            }
        }
        if (full){
            strips[y] = full;
        }
        any_full += full;
    }
    if (any_full){
        strips_len = 0.0001;
    }
    return any_full;
}

function takeEveryStrip(){
    for (let by=19; by>=0; by--){
        while (strips[by]){
            for (let y=by; y>=0; y--){
                if (y==0){
                    strips[y] = false;
                    for (let x=0; x<10; x++){
                        board[y][x] = null;
                    }
                }
                else {
                    strips[y] = strips[y-1];
                    for (let x=0; x<10; x++){
                        board[y][x] = board[y-1][x];
                    }
                }
            }
        }
    }
}

function pastePiece(){
    for (let py=0; py<4; py++){
        for (let px=0; px<4; px++){
            let x = px+position[0];
            let y = py+position[1];
            if (x>=0 && x<10 && y>=0 && y<20 && piece[rotation][py*4 + px])
                board[y][x] = PIECES_COLOR[piece[rotation][py*4 + px]-1];
        }
    }
    piece = null;
}

function pickNextPiece(){
    if (next.length <= 1){
        for (let p=0; p<PIECES.length; p++){
            next.splice(1 + Math.floor(Math.random()*(next.length-1)), 0, PIECES[p]);
        }
    }
    piece = next.shift();
    rotation = 0;
    position = [3, -2];
    fall = 1;
}

function update(dt=0){
    // Update Logic
    if (running & !paused){
        next_difficult -= dt;
        if (next_difficult <= 0){
            next_difficult = 100;
            difficult++;
        }
        if (strips_len > 0){
            strips_len += dt*4;
            if (strips_len >= 1){
                strips_len = 0;
                fall = 0;
                takeEveryStrip();
            }
        }
        else {
            if (inputs.left || inputs.right || inputs.down){
                move -= dt*(10);
                if (move <= 0){
                    move = 1;
                    position[0] += inputs.right - inputs.left;
                    if (testPiece()){
                        position[0] -= inputs.right - inputs.left;
                    }
                    position[1] += inputs.down;
                    if (inputs.down){
                        move = 0.5;
                    }
                    if (testPiece()){
                        position[1] -= 1;
                        fall = 0;
                    }
                }
            }
            else {
                move = 0;
            }
            fall -= dt*(1 + difficult/2);
            if (fall <= 0){
                fall = 1;
                
                if (piece){
                    position[1] += 1;
                    if (testPiece()){
                        position[1] -= 1;
                        pastePiece();
                        fall = 0.25;
                        
                        let lines = checkForFullLines();
                        score += lines*10*row;
                        if (lines){
                            row++;
                        }
                        else {
                            row = 1;
                        }
                    }
                }
                else {
                    pickNextPiece();
                    if (testPiece()){
                        alert("Você perdeu!");
                        running = false;
                    }
                }
            }
        }
    }
    
    // Renderize the game
    redraw();
}

function restart(){
    board.length = 0;
    for (let y=0; y<20; y++){
        let line = [];
        for (let x=0; x<10; x++){
            line.push(null);
        }
        board.push(line);
    }
    strips.length = 0;
    for (let y=0; y<20; y++){
        strips.push(false);
    }
    piece = null;
    next = [];
    rotation = 0;
    position = [0, 0];
    fall = 0;
    move = 0;
    strips_len = 0;
    score = 0;
    row = 1;
    difficult = 0;
    next_difficult = 0;
    running = true;
    paused = false;
    
    inputs.left = inputs.right = inputs.up = inputs.down = false;
    
    pickNextPiece();
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

window.onkeydown = function(ev){
    if (ev.code=='KeyA'){
        inputs.left = true;
    }
    if (ev.code=='KeyD'){
        inputs.right = true;
    }
    if (ev.code=='KeyS'){
        inputs.down = true;
    }
    if (ev.code=='KeyW'){
        inputs.up = true;
        if (piece){
            for (let i=0; i<24; i++){
                position[1] += 1;
                if (testPiece()){
                    position[1] -= 1;
                    fall = 0;
                    break;
                }
            }
        }
    }
    if (ev.code=='Numpad0'){
        if (piece){
            rotation = (rotation+1+piece.length)%piece.length;
            if (testPiece()){
                position[0] -= 1;
            }
            if (testPiece()){
                position[0] += 2;
            }
            if (testPiece()){
                position[0] -= 3;
            }
            if (testPiece()){
                position[0] += 4;
            }
            if (testPiece()){
                position[0] -= 2;
                rotation = (rotation-1+piece.length)%piece.length;
            }
        }
    }
    if (ev.code=='NumpadDecimal'){
        if (piece){
            rotation = (rotation-1+piece.length)%piece.length;
            if (testPiece()){
                position[0] -= 1;
            }
            if (testPiece()){
                position[0] += 2;
            }
            if (testPiece()){
                position[0] -= 3;
            }
            if (testPiece()){
                position[0] += 4;
            }
            if (testPiece()){
                position[0] -= 2;
                rotation = (rotation+1+piece.length)%piece.length;
            }
        }
    }
    if (ev.code == 'Escape'){
        if (running) {
            paused = !paused;
        }
        else {
            restart();
        }
    }
}

window.onkeyup = function(ev){
    if (ev.code=='KeyA'){
        inputs.left = false;
    }
    if (ev.code=='KeyD'){
        inputs.right = false;
    }
    if (ev.code=='KeyS'){
        inputs.down = false;
    }
    if (ev.code=='KeyW'){
        inputs.up = false;
    }
}

