
/*
    Initial Setup
*/
document.body.innerHTML = '<canvas width="500" height="650" id="display" style="border:2px solid black;">Your Browser is uncool!</canvas>';
const ctx = display.getContext("2d");
const width = Number(display.width);
const height = Number(display.height);


/*
    Properties
*/
let board = [];
let numbers = [];
let anim = 0;

let game_over = false;

const CELL_SIZE = Math.floor(width/4);
const COLORS = [
    "#EEE4DA",
    "#EDE0C8",
    "#F2B179",
    "#F59563",
    "#F67C5F",
    "#F65E3B",
    "#EDCF72",
    "#EDCC61",
    "#EDC850",
    "#EDC53F",
    "#EDC22E",
];


/*
    Rendering Module
*/

function render(){
    ctx.clearRect(0, 0, width, height);
    
    // Fill Background
    ctx.fillStyle = "#BBADA0";
    ctx.fillRect(0, 0, width, width + 4);
    
    // Draw cells
    for (let l=0; l<4; l++){
        for (let c=0; c<4; c++){
            ctx.fillStyle = "#CDC1B4";
            ctx.fillRect(c*CELL_SIZE + 4, l*CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8);
        }
    }
    
    // Draw numbers
    for (let n=0; n<numbers.length; n++){
        let num = numbers[n];
        ctx.fillStyle = COLORS[Math.log2(num.value)-1];
        ctx.fillRect((num.x + (num.ex-num.x)*anim)*CELL_SIZE + 4, (num.y + (num.ey-num.y)*anim)*CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8);
        ctx.fillStyle = "white";
        ctx.font = "bold 50px Verdana";
        ctx.fillText(num.value, (num.x + (num.ex-num.x)*anim)*CELL_SIZE + (CELL_SIZE - ctx.measureText(num.value).width)/2, (num.y + (num.ey-num.y)*anim)*CELL_SIZE + CELL_SIZE/2 + 25);
    }
    
    if (game_over){
        ctx.fillStyle = "red";
        ctx.font = "bold 50px Verdana";
        ctx.fillText("Game Over!", 30, width + 80);
    }
}


/*
    Core Functions
*/

function addNumber(){
    let available = [];
    for (let x=0; x<4; x++){
        for (let y=0; y<4; y++){
            if (!board[y][x]){
                available.push([x, y]);
            }
        }
    }
    if (available.length == 0) return;
    available = available[Math.floor(Math.random()*available.length)];
    let num = {
        "value": Math.random() < 0.9? 2: 4,
        "x": available[0], "y": available[1],
        "ex": available[0], "ey": available[1],
    };
    numbers.push(num);
    board[num.y][num.x] = num;
}

function isGameOver(){
    for (let x=0; x<4; x++){
        for (let y=0; y<4; y++){
            if (!board[y][x]){
                return false;
            }
            else {
                if (x > 0 && board[y][x-1] && board[y][x-1].value == board[y][x].value){
                    return false;
                }
                if (x < 3 && board[y][x+1] && board[y][x+1].value == board[y][x].value){
                    return false;
                }
                if (y > 0 && board[y-1][x] && board[y-1][x].value == board[y][x].value){
                    return false;
                }
                if (y < 3 && board[y+1][x] && board[y+1][x].value == board[y][x].value){
                    return false;
                }
            }
        }
    }
    return true;
}


function swipe(dir){
    if (anim) return;
    let moved = false;
    switch (dir){
        case 'Up': {
            for (let x=0; x<4; x++){
                let end = 0;
                for (let y=0; y<4; y++){
                    let num = board[y][x];
                    if (num){
                        for (let o=y-1; o>=0; o--){
                            let numo = board[o][x];
                            if (numo){
                                if (numo.value == num.value){
                                    numbers.splice(numbers.indexOf(numo), 1);
                                    board[numo.y][numo.x] = null;
                                    num.value *= 2;
                                    end--;
                                }
                                break;
                            }
                        }
                        moved = moved || (num.ey != end);
                        num.ey = end;
                        end++;
                    }
                }
            }
        }
        break;
        case 'Down': {
            for (let x=0; x<4; x++){
                let end = 3;
                for (let y=3; y>=0; y--){
                    let num = board[y][x];
                    if (num){
                        for (let o=y+1; o<4; o++){
                            let numo = board[o][x];
                            if (numo){
                                if (numo.value == num.value){
                                    numbers.splice(numbers.indexOf(numo), 1);
                                    board[numo.y][numo.x] = null;
                                    num.value *= 2;
                                    end++;
                                }
                                break;
                            }
                        }
                        moved = moved || (num.ey != end);
                        num.ey = end;
                        end--;
                    }
                }
            }
        }
        break;
        case 'Left': {
            for (let y=0; y<4; y++){
                let end = 0;
                for (let x=0; x<4; x++){
                    let num = board[y][x];
                    if (num){
                        for (let o=x-1; o>=0; o--){
                            let numo = board[y][o];
                            if (numo){
                                if (numo.value == num.value){
                                    numbers.splice(numbers.indexOf(numo), 1);
                                    board[numo.y][numo.x] = null;
                                    num.value *= 2;
                                    end--;
                                }
                                break;
                            }
                        }
                        moved = moved || (num.ex != end);
                        num.ex = end;
                        end++;
                    }
                }
            }
        }
        break;
        case 'Right': {
            for (let y=0; y<4; y++){
                let end = 3;
                for (let x=3; x>=0; x--){
                    let num = board[y][x];
                    if (num){
                        for (let o=x+1; o<4; o++){
                            let numo = board[y][o];
                            if (numo){
                                if (numo.value == num.value){
                                    numbers.splice(numbers.indexOf(numo), 1);
                                    board[numo.y][numo.x] = null;
                                    num.value *= 2;
                                    end++;
                                }
                                break;
                            }
                        }
                        moved = moved || (num.ex != end);
                        num.ex = end;
                        end--;
                    }
                }
            }
        }
        break;
    }
    if (moved) {
        anim = 0.0001;
    }
}


/*
    Application Functions
*/

function restart(){
    numbers.length = 0;
    board.length = 0;
    for (let l=0; l<4; l++){
        let line = [];
        for (let c=0; c<4; c++){
            line.push(null);
        }
        board.push(line);
    }
    anim = 0;
    game_over = false;
    
    addNumber();
}

function update(dt){
    if (!game_over){
        if (anim > 0){
            anim += dt*8;
            if (anim >= 1){
                anim = 0;
                for (let n=0; n<numbers.length; n++){
                    let num = numbers[n];
                    if (board[num.y][num.x] == num) board[num.y][num.x] = null;
                    num.x = num.ex;
                    num.y = num.ey;
                    board[num.y][num.x] = num;
                }
                addNumber();
            }
        }
        if (isGameOver()){
            game_over = true;
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
        restart();
    }
    if (!game_over){
        if (ev.code == 'KeyW' || ev.code == 'ArrowUp'){
            swipe('Up');
        }
        if (ev.code == 'KeyA' || ev.code == 'ArrowLeft'){
            swipe('Left');
        }
        if (ev.code == 'KeyS' || ev.code == 'ArrowDown'){
            swipe('Down');
        }
        if (ev.code == 'KeyD' || ev.code == 'ArrowRight'){
            swipe('Right');
        }
    }
}

document.oncontextmenu = function(ev){
    ev.preventDefault();
}

