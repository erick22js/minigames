
/*
    Initial Setup
*/
document.body.innerHTML = '<canvas width="700" height="695" id="display" style="border:2px solid black;">Your Browser is uncool!</canvas>';
const ctx = display.getContext("2d");
const width = Number(display.width);
const height = Number(display.height);

const CELL_SIZE = 35;


/*
    Properties
*/

let started = false;
let game_over = false;
let game_win = false;
let score = 0;
let time = 0;
let difficult = 0.15;
const board = {
    "width": Math.floor(width/CELL_SIZE),
    "height": Math.floor((height-100)/CELL_SIZE),
    "cells": [],
};


/*
    Rendering Module
*/

function render(){
    ctx.clearRect(0, 0, width, height);
    
    // Redraw the board
    for (let y=0; y<board.height; y++){
        for (let x=0; x<board.width; x++){
            let cell = board.cells[y][x];
            
            ctx.fillStyle = "black";
            ctx.fillRect(x*CELL_SIZE, y*CELL_SIZE + 100, CELL_SIZE, CELL_SIZE);
            
            if (cell.state == 0){
                ctx.fillStyle = "#fff";
                ctx.fillRect(x*CELL_SIZE + 1, y*CELL_SIZE + 1 + 100, CELL_SIZE - 2, CELL_SIZE - 2);
                ctx.fillStyle = "#666";
                ctx.beginPath();
                ctx.moveTo(x*CELL_SIZE + 1, y*CELL_SIZE + 1 + 100);
                ctx.lineTo((x+1)*CELL_SIZE - 2, y*CELL_SIZE + 1 + 100);
                ctx.lineTo(x*CELL_SIZE + 1, (y+1)*CELL_SIZE - 2 + 100);
                ctx.fill();
                ctx.fillStyle = "#bbb";
                ctx.fillRect(x*CELL_SIZE + 3, y*CELL_SIZE + 3 + 100, CELL_SIZE - 6, CELL_SIZE - 6);
                
                // Draw the counter on cell
                if (cell.counter){
                    ctx.fillStyle = [
                        "blue", "green", "red", "darkblue", "brown", "cyan", "black", "gray"
                    ][cell.counter-1];
                    ctx.font = "bold "+(CELL_SIZE-8)+"px Arial";
                    ctx.fillText(cell.counter, (x+0.5)*CELL_SIZE - ctx.measureText(cell.counter).width/2, (y+1)*CELL_SIZE - 8 + 100);
                }
                
                // Draws bomb if is on cell
                if (cell.bomb){
                    ctx.fillStyle = "#222";
                    ctx.beginPath();
                    ctx.arc((x+0.5)*CELL_SIZE, (y+0.5)*CELL_SIZE + 100, (CELL_SIZE-10)/2, 0, 2*Math.PI);
                    ctx.fill();
                    ctx.fillStyle = "#444";
                    ctx.beginPath();
                    ctx.arc((x+0.5)*CELL_SIZE - 1.41, (y+0.5)*CELL_SIZE - 1.41 + 100, (CELL_SIZE-10)/2 - 2, 0, 2*Math.PI);
                    ctx.fill();
                    ctx.fillStyle = "#eee";
                    ctx.beginPath();
                    ctx.arc((x+0.5)*CELL_SIZE - 1.41*4, (y+0.5)*CELL_SIZE - 1.41*2 + 100, (CELL_SIZE-10)/2 - 10, 0, 2*Math.PI);
                    ctx.fill();
                }
            }
            else {
                ctx.fillStyle = "#666";
                ctx.fillRect(x*CELL_SIZE + 1, y*CELL_SIZE + 1 + 100, CELL_SIZE - 2, CELL_SIZE - 2);
                ctx.fillStyle = "#fff";
                ctx.beginPath();
                ctx.moveTo(x*CELL_SIZE + 1, y*CELL_SIZE + 1 + 100);
                ctx.lineTo((x+1)*CELL_SIZE - 2, y*CELL_SIZE + 1 + 100);
                ctx.lineTo(x*CELL_SIZE + 1, (y+1)*CELL_SIZE - 2 + 100);
                ctx.fill();
                ctx.fillStyle = "#ddd";
                ctx.fillRect(x*CELL_SIZE + 6, y*CELL_SIZE + 6 + 100, CELL_SIZE - 12, CELL_SIZE - 12);
            }
            // Flagged
            if (cell.state == 2){
                ctx.fillStyle = "#ff0";
                ctx.beginPath();
                ctx.moveTo(x*CELL_SIZE + 7, y*CELL_SIZE + 5 + 100);
                ctx.lineTo(x*CELL_SIZE + 7, (y+1)*CELL_SIZE - 8 + 100);
                ctx.lineTo((x+1)*CELL_SIZE - 6, (y+0.5)*CELL_SIZE + 100);
                ctx.fill();
                ctx.lineWidth = 4;
                ctx.strokeStyle = "#f00";
                ctx.beginPath();
                ctx.moveTo(x*CELL_SIZE + 7, y*CELL_SIZE + 5 + 100);
                ctx.lineTo(x*CELL_SIZE + 7, (y+1)*CELL_SIZE - 8 + 100);
                ctx.lineTo((x+1)*CELL_SIZE - 6, (y+0.5)*CELL_SIZE + 100);
                ctx.lineTo(x*CELL_SIZE + 7, y*CELL_SIZE + 5 + 100);
                ctx.lineTo(x*CELL_SIZE + 7, (y+1)*CELL_SIZE - 8 + 100);
                ctx.stroke();
            }
        }
    }
    
    // Redraw the gui
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("Score: "+score, 10, 40);
    ctx.font = "30px Arial";
    ctx.fillText("Time: "+time.toFixed(0), 10, 80);
    if (game_over){
        ctx.fillStyle = "red";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over!", width-200, 40);
        ctx.fillStyle = "black";
        ctx.fillText("Press 'Esc' to restart", width-300, 80);
    }
    if (game_win){
        ctx.fillStyle = "blue";
        ctx.font = "30px Arial";
        ctx.fillText("Game Win!", width-200, 40);
        ctx.fillStyle = "black";
        ctx.fillText("Press 'Esc' to restart", width-300, 80);
    }
}


/*
    Core Functions
*/

function regenBoard(nx=0, ny=0){
    board.cells.length = 0;
    for (let y=0; y<board.width; y++){
        let line = [];
        for (let x=0; x<board.width; x++){
            line.push(
                { "bomb": Math.random() < difficult && Math.hypot(nx-x, ny-y)>2, "counter": 0, "state": 1 }//Math.floor((x*3)/board.width) }
            );
        }
        board.cells.push(line);
    }
    
    // Update counter for every cell
    for (let y=0; y<board.width; y++){
        for (let x=0; x<board.width; x++){
            let cur = board.cells[y][x];
            let counter = 0;
            
            if (cur.bomb){
                continue;
            }
            if (x-1 >= 0){
                counter += board.cells[y][x-1].bomb;
                if (y-1 >= 0){
                    counter += board.cells[y-1][x-1].bomb;
                }
                if (y+1 < board.height){
                    counter += board.cells[y+1][x-1].bomb;
                }
            }
            if (y-1 >= 0){
                counter += board.cells[y-1][x].bomb;
            }
            if (x+1 < board.width){
                counter += board.cells[y][x+1].bomb;
                if (y-1 >= 0){
                    counter += board.cells[y-1][x+1].bomb;
                }
                if (y+1 < board.height){
                    counter += board.cells[y+1][x+1].bomb;
                }
            }
            if (y+1 < board.height){
                counter += board.cells[y+1][x].bomb;
            }
            cur.counter = counter;
        }
    }
}

function tapCell(x, y){
    if (game_over || game_win) return;
    if (!started) regenBoard(x, y)
    started = true;
    
    let cell = board.cells[y][x];
    if (cell.state == 1){
        cell.state = 0;
        
        if (cell.bomb){
            game_over = true;
            
            for (let y=0; y<board.height; y++){
                for (let x=0; x<board.width; x++){
                    let cell = board.cells[y][x];
                    if (cell.bomb){
                        cell.state = 0;
                    }
                }
            }
        }
        else {
            score += 10;
            if (cell.counter == 0){
                if (x-1 >= 0){
                    tapCell(x-1, y);
                    if (y-1 >= 0){
                        tapCell(x-1, y-1);
                    }
                    if (y+1 < board.height){
                        tapCell(x-1, y+1);
                    }
                }
                if (y-1 >= 0){
                    tapCell(x, y-1);
                }
                if (x+1 < board.width){
                    tapCell(x+1, y);
                    if (y-1 >= 0){
                        tapCell(x+1, y-1);
                    }
                    if (y+1 < board.height){
                        tapCell(x+1, y+1);
                    }
                }
                if (y+1 < board.height){
                    tapCell(x, y+1);
                }
            }
            
            let remaining = false;
            for (let y=0; y<board.height; y++){
                for (let x=0; x<board.width; x++){
                    let cell = board.cells[y][x];
                    if (!cell.bomb && cell.state!=0){
                        remaining = true;
                    }
                }
            }
            if (!remaining){
                game_win = true;
            }
        }
    }
}

function switchCell(x, y){
    if (game_over || game_win) return;
    let cell = board.cells[y][x];
    if (cell.state != 0){
        cell.state ^= 3;
    }
}


/*
    Application Functions
*/

function restart(){
    started = false;
    game_over = false;
    game_win = false;
    score = 0;
    time = 0;
    regenBoard();
}

function update(dt){
    if (!(game_over || game_win)) {
        time += dt;
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
    let x = Math.floor((ev.clientX - display.getBoundingClientRect().left) / CELL_SIZE);
    let y = Math.floor((ev.clientY - display.getBoundingClientRect().top - 100) / CELL_SIZE);
    
    if (x>=0 && x<board.width && y>=0 && y<board.height){
        if (ev.button == 0){
            tapCell(x, y);
        }
        else {
            switchCell(x, y);
        }
    }
}

window.onkeydown = function(ev){
    if (ev.code == 'Escape'){
        if (game_over || game_win){
            restart();
        }
    }
}

document.oncontextmenu = function(ev){
    ev.preventDefault();
}

