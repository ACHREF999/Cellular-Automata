"use strict";
const small = document.documentElement.clientWidth < 600;
const BOARD_ROWS = small ? 18 : 32;
const BOARD_COLS = small ? 18 : 32;
const canvas = document.getElementById("canvas");
const next_button = document.getElementById("next");
const play_button = document.getElementById("play");
const pause_button = document.getElementById("pause");
const clear_button = document.getElementById("clear");
if (canvas == null || next_button == null || play_button == null || pause_button == null) {
    throw new Error("Could Not Get Elements");
}
let intervalId = null;
canvas.width = small ? 360 : 600;
canvas.height = small ? 360 : 600;
const CELL_WIDTH = canvas.width / BOARD_COLS;
const CELL_HEIGHT = canvas.height / BOARD_ROWS;
function generateBoard() {
    const BOARD = [];
    for (let r = 0; r < BOARD_ROWS; r++) {
        BOARD.push(new Array(BOARD_COLS).fill('dead'));
    }
    return BOARD;
}
let BOARD = generateBoard();
let nextBOARD = generateBoard();
function aliveNeighboursCount(current, r, c) {
    let count = 0;
    // let temp:State[] = [];
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr != 0 || dc != 0) {
                let nr = r + dr;
                let nc = c + dc;
                // if(0<=nr && nr<BOARD_ROWS && 0<=nc && nc<BOARD_COLS){
                //     if(current[nr][nc]=='alive'){
                //         count+=1
                //     }
                // }
                // else{
                if (nr < 0) {
                    nr = nr + BOARD_ROWS;
                }
                if (nc < 0) {
                    nc = nc + BOARD_COLS;
                }
                if (nc >= BOARD_COLS) {
                    nc = nc - BOARD_COLS;
                }
                if (nr >= BOARD_ROWS) {
                    nr = nr - BOARD_ROWS;
                }
                // console.log([nr,nc])
                if (current[nr][nc] == 'alive') {
                    count += 1;
                    // }
                }
            }
        }
    }
    // count = temp.reduce((acc,x)=>(x=='alive'?acc+1:acc),0)
    return count;
}
function updateState(current, next, r, c, rule) {
    let n_count = aliveNeighboursCount(current, r, c);
    if (rule == 'GOL') {
        switch (current[r][c]) {
            case "alive": {
                if (n_count == 2 || n_count == 3) {
                    next[r][c] = 'alive';
                }
                else {
                    next[r][c] = 'dead';
                }
                break;
            }
            case "dead": {
                if (n_count == 3) {
                    next[r][c] = 'alive';
                }
                else {
                    next[r][c] = 'dead';
                }
                break;
            }
        }
    }
    else if (rule == 'SEEDS') {
        switch (current[r][c]) {
            case "alive": {
                next[r][c] = 'dead';
                break;
            }
            case "dead": {
                if (n_count >= 2) {
                    next[r][c] = 'alive';
                }
                break;
            }
        }
    }
    else if (rule == 'DAY_NIGHT') {
        switch (current[r][c]) {
            case "alive": {
                if ([3, 4, 6, 7, 8].includes(n_count)) {
                    next[r][c] = 'alive';
                }
                else {
                    next[r][c] = 'dead';
                }
            }
            case "dead": {
                if ([3, 6, 7, 8].includes(n_count)) {
                    next[r][c] = 'alive';
                }
                else {
                    next[r][c] = 'dead';
                }
                break;
            }
        }
    }
}
function computeNextBoard(current, next) {
    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            // this is where the rules for the cellular automata are
            updateState(current, next, r, c, 'GOL');
        }
    }
}
// for (let r = 0;r<BOARD_ROWS;r++){
//     let row:State[] = []
//     for (let c = 0 ; c<BOARD_COLS;c++){
//         row.push('dead');
//     }
//     BOARD.push(row);
// }
// console.log(BOARD)
const ctx = canvas.getContext("2d");
if (ctx == null) {
    throw new Error("Could Not Init A Context");
}
function render(ctx) {
    ctx.fillStyle = '#B4AF9A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#4E4B42';
    for (let r = 0; r < BOARD_ROWS; r++) {
        for (let c = 0; c < BOARD_COLS; c++) {
            if (BOARD[r][c] == 'alive') {
                const x = c * CELL_WIDTH;
                const y = r * CELL_HEIGHT;
                ctx.fillRect(x, y, CELL_WIDTH, CELL_HEIGHT);
            }
        }
    }
}
function setManually(e, ctx) {
    const col = Math.floor(e.offsetX / CELL_WIDTH);
    const row = Math.floor(e.offsetY / CELL_HEIGHT);
    if (BOARD[row][col] == 'dead') {
        BOARD[row][col] = 'alive';
    }
    else {
        BOARD[row][col] = 'dead';
    }
    // console.log([col,row])
    render(ctx);
}
canvas.addEventListener('click', (e) => {
    setManually(e, ctx);
    clearInterval(intervalId);
    intervalId = null;
});
function transition(ctx) {
    computeNextBoard(BOARD, nextBOARD);
    [BOARD, nextBOARD] = [nextBOARD, BOARD];
    render(ctx);
}
next_button.addEventListener('click', (e) => {
    transition(ctx);
});
play_button.addEventListener('click', (e) => {
    if (intervalId == null) {
        intervalId = setInterval(() => transition(ctx), 150);
    }
});
pause_button.addEventListener('click', (e) => {
    clearInterval(intervalId);
    intervalId = null;
});
clear_button.addEventListener('click', (e) => {
    clearInterval(intervalId);
    intervalId = null;
    BOARD = generateBoard();
    nextBOARD = generateBoard();
    render(ctx);
});
render(ctx);
