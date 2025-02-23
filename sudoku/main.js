
/*
    Initial Setup
*/
document.body.innerHTML = '<canvas width="540" height="700" id="display" style="border:2px solid black;">Your Browser is uncool!</canvas>';
const ctx = display.getContext("2d");
const width = Number(display.width);
const height = Number(display.height);

let board = [];
let cursor = [-1, -1];
let selected = 1;
let time = 0;
let game_win = false;

const CELL_SIZE = Math.floor(Number(width)/9);


/*
    Properties
*/


/*
    Rendering Module
*/

function render(){
    ctx.clearRect(0, 0, width, height);
    
    // Board Cells
    for (let y=0; y<9; y++){
        for (let x=0; x<9; x++){
            let cell = board[y][x];
            let wrong = false;
            for (let y_i=0; y_i<9; y_i++){
                let cell_i = board[y_i][x];
                if (y_i != y && cell_i.value == cell.value && cell.value){
                    wrong = true;
                }
            }
            for (let x_i=0; x_i<9; x_i++){
                let cell_i = board[y][x_i];
                if (x_i != x && cell_i.value == cell.value && cell.value){
                    wrong = true;
                }
            }
            for (let y_i=Math.floor(y/3)*3; y_i<Math.floor(y/3)*3+3; y_i++){
                for (let x_i=Math.floor(x/3)*3; x_i<Math.floor(x/3)*3+3; x_i++){
                    let cell_i = board[y_i][x_i];
                    if (!(x_i == x && y_i == y) && cell_i.value == cell.value && cell.value){
                        wrong = true;
                    }
                }
            }
            
            ctx.fillStyle = wrong? "#d88":
                (cursor[0]==x && cursor[1]==y) || (selected > 0 && cell.value == selected)? "#bbf":
                ((cursor[0]==x || cursor[1]==y) && cursor[0] >= 0 && cursor[0] < 9 && cursor[1] >= 0 && cursor[1] < 9)? "#ddf":
                selected == 0 && !cell.fixed && cell.value? "#bbb": "#eee";
            ctx.fillRect(CELL_SIZE*x, CELL_SIZE*y, CELL_SIZE, CELL_SIZE);
            
            if (cell.value){
                ctx.fillStyle = cell.fixed? "black": wrong? "#c00": (cursor[0]==x && cursor[1]==y)? "#44f": "#444";
                ctx.font = "bold "+((CELL_SIZE*3)/4)+"px Arial";
                ctx.fillText(cell.value, CELL_SIZE*x + (CELL_SIZE-ctx.measureText(cell.value).width)/2, CELL_SIZE*(y+1) - ((CELL_SIZE*3)/12));
            }
        }
    }
    // Grids
    for (let b=0; b<=9; b++){
        ctx.fillStyle = "black";
        if (b%3 == 0){
            ctx.fillRect(b*CELL_SIZE - 4, 0, 8, width);
            ctx.fillRect(0, b*CELL_SIZE - 4, width, 8);
        }
        else {
            ctx.fillRect(b*CELL_SIZE - 1, 0, 2, width);
            ctx.fillRect(0, b*CELL_SIZE - 1, width, 2);
        }
    }
    
    // Bottom Gui Numbers
    for (let v=0; v<=9; v++){
        if (selected == v) {
            ctx.fillStyle = "#44f";
            ctx.beginPath();
            if (v) ctx.arc(CELL_SIZE*(v - 0.5), CELL_SIZE*11, CELL_SIZE*0.5, 0, Math.PI*2);
            else ctx.arc(CELL_SIZE*(0.5), CELL_SIZE*10, CELL_SIZE*0.5, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.fillStyle = "#999";
        ctx.font = "bold "+((CELL_SIZE*3)/4)+"px Arial";
        if (v==0){
            ctx.beginPath();
            ctx.arc(CELL_SIZE*(0.5), CELL_SIZE*10, CELL_SIZE*0.4, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.fillText('x', (CELL_SIZE-ctx.measureText('x').width)/2, CELL_SIZE*10.25);
        }
        else {
            ctx.beginPath();
            ctx.arc(CELL_SIZE*(v - 0.5), CELL_SIZE*11, CELL_SIZE*0.4, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.fillText(v, CELL_SIZE*(v-1) + (CELL_SIZE-ctx.measureText(v).width)/2, CELL_SIZE*11.25);
        }
    }
}


/*
    Core Functions
*/
function winCheck(){
    for (let y=0; y<9; y++){
        for (let x=0; x<9; x++){
            let cell = board[y][x];
            for (let y_i=0; y_i<9; y_i++){
                let cell_i = board[y_i][x];
                if (y_i != y && cell_i.value == cell.value && cell.value){
                    return false;
                }
            }
            for (let x_i=0; x_i<9; x_i++){
                let cell_i = board[y][x_i];
                if (x_i != x && cell_i.value == cell.value && cell.value){
                    return false;
                }
            }
            for (let y_i=Math.floor(y/3)*3; y_i<Math.floor(y/3)*3+3; y_i++){
                for (let x_i=Math.floor(x/3)*3; x_i<Math.floor(x/3)*3+3; x_i++){
                    let cell_i = board[y_i][x_i];
                    if (!(x_i == x && y_i == y) && cell_i.value == cell.value && cell.value){
                        return false;
                    }
                }
            }
            if (cell.value == 0){
                return false;
            }
        }
    }
    return true;
}

function resetBoard(fill_ratio=0.5){
    let _cells = [];
    
    // Pregenerate numbers for each cell, in a way that don't have collisions and obeys to sudoku rules
    _cells.length = 0;
    board.length = 0;
    for (let y=0; y<9; y++){
        let _line = [];
        let line = [];
        for (let x=0; x<9; x++){
            _line.push(((y%3)*3 + (x%3) + (Math.floor(y/3) + Math.floor(x/3)*3))%9);
            line.push(0);
        }
        _cells.push(_line);
        board.push(line);
    }
    
    // Shuffles lines and collumns indices
    let rows = [];
    let cols = [];
    for (let g=0; g<3; g++){
        if (rows){
            let i1 = Math.floor(Math.random()*3);
            let i2 = (i1 + Math.floor(Math.random()*2) + 1) % 3;
            let i3 = ((i1+1)%3 == i2? i2+1: i1+1)%3;
            rows.push(i1 + g*3);
            rows.push(i2 + g*3);
            rows.push(i3 + g*3);
        }
        if (cols){
            let i1 = Math.floor(Math.random()*3);
            let i2 = (i1 + Math.floor(Math.random()*2) + 1) % 3;
            let i3 = ((i1+1)%3 == i2? i2+1: i1+1)%3;
            cols.push(i1 + g*3);
            cols.push(i2 + g*3);
            cols.push(i3 + g*3);
        }
    }
    
    // Generate a number palette randomized
    let indices = [];
    let _indices = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    while (_indices.length > 0){
        let i = Math.floor(Math.random()*_indices.length);
        indices.push(_indices[i]);
        _indices.splice(i, 1);
    }
    
    // Binds to board shuffled and reasigned number for random ordering
    for (let y=0; y<9; y++){
        for (let x=0; x<9; x++){
            let ind = _cells[rows[y]][cols[x]];
            let filled = Math.random() < fill_ratio;
            board[y][x] = {
                "value": filled? indices[ind]: 0,
                "fixed": filled,
            };
        }
    }
}


/*
    Application Functions
*/

function restart(){
    resetBoard(0.4);
    cursor = [-1, -1];
    selected = 1;
    time = 0;
    game_win = false;
}

function update(dt){
    if (!game_win){
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
    let x = (ev.clientX - display.getBoundingClientRect().left);
    let y = (ev.clientY - display.getBoundingClientRect().top);
    x = x/CELL_SIZE;
    y = y/CELL_SIZE;
    
    if (game_win) return;
    
    cursor = [Math.floor(x), Math.floor(y)];
    if (x >=0 && x < 9 && y >= 0 && y < 9){
        x = Math.floor(x);
        y = Math.floor(y);
        if (selected >= 0 && !board[y][x].fixed){
            board[y][x].value = selected;
            if (winCheck()) {
                game_win = true;
                alert("You Won!");
            }
        }
    }
    else if (x >=0 && x < 9 && y > 10.5){
        x = Math.floor(x);
        y = Math.floor(y);
        selected = x+1;
    }
    else if (x >=0 && x < 1 && y > 9.5){
        selected = 0;
    }
}

window.onkeydown = function(ev){
    if (ev.code == 'Escape'){
        if (confirm("Do you want to reset the game?")){
            restart();
        }
    }
}

document.oncontextmenu = function(ev){
    ev.preventDefault();
}

