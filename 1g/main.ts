const small = document.documentElement.clientWidth < 600; 
const BOARD_ROWS = small?18:32;
const BOARD_COLS = small?18:32;
const canvas:HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
const next_button:HTMLButtonElement = document.getElementById("next") as HTMLButtonElement;
const play_button:HTMLButtonElement = document.getElementById("play") as HTMLButtonElement;
const pause_button:HTMLButtonElement = document.getElementById("pause") as HTMLButtonElement;
const clear_button:HTMLButtonElement = document.getElementById("clear") as HTMLButtonElement;



if(canvas==null || next_button == null || play_button == null || pause_button == null){
    throw new Error("Could Not Get Elements")
}

let intervalId:any = null;

canvas.width = small?360:600;
canvas.height = small?360:600;
const CELL_WIDTH = canvas.width / BOARD_COLS;
const CELL_HEIGHT = canvas.height / BOARD_ROWS;
type Grid = '2D'|'1D';
let GRID:Grid = '2D';

type State = 'alive' | 'dead'
type Board = Array<Array<State>>;

function generateBoard():Board{
    const BOARD:Board = [];

    for (let r=0;r<BOARD_ROWS;r++){
        BOARD.push(new Array(BOARD_COLS).fill('dead'))
    }
    return BOARD
}

let BOARD = generateBoard();
let nextBOARD = generateBoard();

let nextLINE:Array<State> = new Array(BOARD_COLS).fill('dead'); 

function aliveNeighboursCount(current:Board,r:number,c:number):number{
    let count = 0;
    // let temp:State[] = [];
    // if(grid=='2D'){
        for(let dr = -1; dr<=1;dr++){
            for (let dc=-1;dc<=1;dc++){
                if(dr !=0 || dc !=0){
                    let nr = r+dr;
                    let nc = c+dc;
                    // if(0<=nr && nr<BOARD_ROWS && 0<=nc && nc<BOARD_COLS){
                    //     if(current[nr][nc]=='alive'){
                    //         count+=1
                    //     }
                    // }
                    // else{
                        if(nr<0){ nr = nr + BOARD_ROWS }
                        if(nc<0){ nc = nc + BOARD_COLS }
                        if(nc>=BOARD_COLS){ nc = nc - BOARD_COLS }
                        if(nr>=BOARD_ROWS){ nr = nr - BOARD_ROWS }
                        // console.log([nr,nc])
                        if(current[nr][nc]=='alive'){
                            count+=1
                        // }
                    }

                }
            }
        }
    // }
    // else{
    //     let lc = c -1;
    //     let rc = c + 1 ;
    //     if (lc<0) lc = BOARD_COLS -1;
    //     if (rc >= BOARD_COLS) rc = 0 ;
    //     let left = current[BOARD_ROWS -1 ][lc]=='alive'?1:0
    //     let right = current[BOARD_ROWS -1][rc]=='alive'?1:0
    //     count += left + right;
    // }
    // count = temp.reduce((acc,x)=>(x=='alive'?acc+1:acc),0)
    return count
}

function dec2bin(dec:number){
    return (dec >>> 0).toString(2);
}


type Rule = "GOL"|"SEEDS"|"DAY_NIGHT"|"FRACTAL_SQUARE";
let rule:Rule = 'GOL';


// let rule  = 89;

// we should only use this to update and handle whether it is a 1D or 2D Grid
function updateState(current:Board,next:Board,r:number,c:number,rule:Rule){
    // if(grid=='2D'){
        let n_count = aliveNeighboursCount(current,r,c)
        // should have use a switch case here but im lazy
        if(rule=='GOL'){
            switch(current[r][c]){
                    case "alive":{
                        if(n_count==2 || n_count == 3){
                            next[r][c] = 'alive'
                        }
                        else{
                            next[r][c] = 'dead';
                        }
                        break;
                    }
                    case "dead":{
                        if(n_count==3){
                            next[r][c] = 'alive';
                        }else{
                            next[r][c]='dead';
                        }
                        break;
                    }
                }
        }
        else if(rule=='SEEDS'){
            switch(current[r][c]){
                case "alive":{
                        next[r][c]='dead'
                        break;
                    }
                    case "dead":{
                        if(n_count>=2){
                            next[r][c] = 'alive';
                        
                        }
                        break;
                    }
            }
        }
        else if(rule=='DAY_NIGHT'){
            switch(current[r][c]){
                case "alive":{
                        if([3, 4, 6, 7, 8].includes(n_count)){
                            next[r][c] = 'alive'
                        }
                        else{
                            next[r][c] = 'dead';
                        }
                    }
                    case "dead":{
                        if([3, 6, 7, 8].includes(n_count)){
                            next[r][c] = 'alive';
                        }
                        else{
                            next[r][c] = 'dead'
                        }
                        break;
                    }
            }
        }
        else if(rule=='FRACTAL_SQUARE'){
            if(current[r][c]=='alive'){
                if([5,6].includes(aliveNeighboursCount(current,r,c))){
                    // overpopulation
                    nextBOARD[r][c] = 'dead'
                }
                else{
                    nextBOARD[r][c] = 'alive';
                }
            }
            else{

                // refactor all of these to use the mod operator '%' with a padding for negative values using BOARD_COLS/BOARD_ROWS
                let top = r-1;
                let bottom = r+1;
                let left= c-1;
                let right = c+1;
                if(top<0) top = BOARD_ROWS-1;
                // if(top>=BOARD_ROWS) top = 0;
                if(bottom>=BOARD_ROWS) bottom = 0;
                // if(top<0) top = BOARD_ROWS-1;
                if(left<0) left = BOARD_COLS -1;
                if(right >=BOARD_COLS) right = 0;
                
                if(current[r][left]=='alive'){
                    if(aliveNeighboursCount(current,r,left)<4){
                        nextBOARD[r][c] = 'alive';
                }
                } 
                if(current[r][right]=='alive'){
                    if(aliveNeighboursCount(current,r,right)<4){
                    
                        nextBOARD[r][c] = 'alive';
                }
                } 
                if(current[top][c]=='alive'){
                    if(aliveNeighboursCount(current,top,c)<3){
                        nextBOARD[r][c] = 'alive';
                    } 
                }
                if(current[bottom][c]=='alive'){
                    if(aliveNeighboursCount(current,bottom,c)<3){
                    
                        nextBOARD[r][c] = 'alive';
                }
                }
            }
        }
    // }
    // else {
    //     if(r==0 && c==0){
    //         nextLINE = current[BOARD_ROWS-1]
    //         // current.shift()
    //         next.shift()
    //         next.push(nextLINE)
    //     }
    //     if(r==0){
    //         nextLINE = next[BOARD_ROWS-1]
    //         let rule_string  = dec2bin(rule as number);
    //         let left = c-1;
    //         let right = c+1;
    //         if(left<0) left = BOARD_COLS -1;
    //         if(right>=BOARD_COLS) right = 0;
    //         let index = 0;
    //         // console.log([left,c,right])
    //         console.log(nextLINE[left],nextLINE[c],nextLINE[right])
    //         if(current[BOARD_ROWS-1][left]=='alive') index = index + 4;
    //         if(current[BOARD_ROWS-1][c]=='alive') index = index + 2;
    //         if(current[BOARD_ROWS-1][right]=='alive') index = index + 1;
    //         let leng = rule_string.length
    //         for(let i = 0; i <8-leng;i++){
    //             rule_string  = `0${rule_string}`
    //         }
    //         // console.log(index);
    //         // console.log('rule_String : ',rule_string.slice(rule_string.length-8));
    //         // console.log(rule_string[index])
    //         // console.log(rule_string)
    //         if(rule_string.slice(rule_string.length-8)[index]=='1') nextLINE[c] = rule_string[index]=='1'?'alive':'dead';
    //         next[BOARD_ROWS-1] = nextLINE;
    //         console.log(nextLINE)
    //     }

    // }
}

function computeNextBoard(current:Board,next:Board){
    for (let r = 0 ; r < BOARD_ROWS;r++){
        for(let c = 0 ; c<BOARD_COLS;c++){
            // this is where the rules for the cellular automata are
            updateState(current,next,r,c,rule);
            
        }
    }
}


function computeNextLine(current:Board,next:Board,rule:number){
    let currentLine = [...current[BOARD_ROWS-1]]
    let nextLine = [...next[BOARD_ROWS-1]]
    next.shift()
    
    
    for (let c = 0 ; c<BOARD_COLS ; c++){
        
        let lc = c==0? BOARD_COLS-1 : c-1;
        let rc = c==BOARD_COLS-1?0:c+1;

        console.log([lc,c,rc])
        let index = (currentLine[lc]=='alive'?4:0) + currentLine[c]=='alive'?2:0 + currentLine[rc]=='alive'?1:0;
        
        let rule_string = dec2bin(rule)
        let leng = rule_string.length
        for(let i = 0; i <8-leng;i++){
            rule_string  = `0${rule_string}`
        }
        console.log(nextLine)
        nextLine[c] = rule_string[index]=='1'?'alive':'dead';
        
    }
    next.push(nextLine);
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
if(ctx==null){
    throw new Error("Could Not Init A Context")
    
}


function render(ctx:CanvasRenderingContext2D){
ctx.fillStyle = '#B4AF9A';
ctx.fillRect(0,0,canvas.width,canvas.height);


ctx.fillStyle='#4E4B42'
for (let r =0 ; r < BOARD_ROWS ;r++){
    for (let c=0;c<BOARD_COLS;c++){
        if(BOARD[r][c]=='alive'){
            const x = c*CELL_WIDTH;
            const y = r*CELL_HEIGHT;
            ctx.fillRect(x,y,CELL_WIDTH,CELL_HEIGHT);
        }
    }
}


}
function setManually(e:any,ctx:CanvasRenderingContext2D){
    
    const col = Math.floor(e.offsetX / CELL_WIDTH);
    const row = Math.floor(e.offsetY / CELL_HEIGHT);
    if(BOARD[row][col] =='dead'){
    BOARD[row][col] =  'alive';}
    else{
        BOARD[row][col] = 'dead';
    }
    render(ctx)
}

function handleRuleChange(new_rule:Rule){
    rule = new_rule;
    clearInterval(intervalId);
    intervalId = null;
}

let drawing = false;
canvas.addEventListener('mousedown',(e)=>{
    drawing = true;
    setManually(e,ctx);
    clearInterval(intervalId);
    intervalId = null;
})

canvas.addEventListener('mouseup',(e)=>{
    drawing = false;

})

canvas.addEventListener('mousemove',(e)=>{
    if(drawing){
    setManually(e,ctx);
    }
})


function transition(ctx:CanvasRenderingContext2D){
    if(GRID=='2D'){
        computeNextBoard(BOARD,nextBOARD);
    }
    else{
        computeNextLine(BOARD,nextBOARD,30);
    }
    [BOARD,nextBOARD] = [nextBOARD,BOARD];
    render(ctx)
}
next_button.addEventListener('click',(e)=>{
    transition(ctx)

})
play_button.addEventListener('click',(e)=>{
    if(intervalId == null){
        intervalId = setInterval(()=>transition(ctx),150);
    }
})
pause_button.addEventListener('click',(e)=>{
    clearInterval(intervalId);
    intervalId = null;
})

clear_button.addEventListener('click',(e)=>{
    clearInterval(intervalId);
    intervalId = null;
    BOARD = generateBoard();
    nextBOARD = generateBoard();
    render(ctx)
})

render(ctx)
