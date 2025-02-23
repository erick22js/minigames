
/*
    Initial Setup
*/
document.body.innerHTML = '<canvas width="500" height="500" id="display" style="border:2px solid black;">Your Browser is uncool!</canvas>';
const ctx = display.getContext("2d");
const width = Number(display.width);
const height = Number(display.height);


/*
    Properties
*/


/*
    Rendering Module
*/


/*
    Core Functions
*/


/*
    Application Functions
*/

function restart(){}

function update(dt){}


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
    if (ev.code == 'Escape'){}
}

document.oncontextmenu = function(ev){
    ev.preventDefault();
}

