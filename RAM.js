const fs = require("fs");

let program = parse("div.ram");
let starting_config = 'div';
console.log(program);
let start_memory =  Array(100).fill(0);
// starting configuration

if (starting_config == 'mult')
{
    start_memory[0] = 3;
    start_memory[1] = 5; 
}
else if (starting_config == 'max'){
    // input maximum
    start_memory[10] = 1;
    start_memory[11] = 2;
    start_memory[12] = 6;
    start_memory[13] = 4;
    start_memory[14] = 5;
}
else if (starting_config == 'sqrt') {
    start_memory[1] = 13;
    start_memory[4] = 1;
}
else if (starting_config == 'div') {
    let x = 10;
    let y = 3;
    start_memory[1] = x;
    start_memory[2] = y;
    start_memory[3] = 1;
    let out_memory = run(program, start_memory);
    let R0 = out_memory[0];
    console.log('R0: ' + R0);
}
else if (starting_config == '?') {
    for (let i = 0; i < 1000; ++i) {
        // ceiled sqrt
        start_memory[0] = i;
        let out_memory = run(program, start_memory);
        let R0 = out_memory[0];
        console.log("input: " + i + " R0: " + R0 + "log: " + Math.log2(i));
        start_memory.fill(0);
    }
}
else if (starting_config == 'bb') {
    let out_memory = run(program, start_memory);
    let R0 = out_memory[0];
    console.log('R0: ' + R0);
}




function parse(filePath)
{
    const input = fs
        .readFileSync(filePath)
        .toString()
        .split('\n')
        .map(x => x.trim());
    return input;
}

function run(program, start_memory)
{
    let memory = start_memory;
    let pc = 0;
    while (pc > -1)
    {
        pc = interpret_line(program[pc], pc, memory);
        console.log(`Line: ${pc} Registers: `, memory.slice(0, 5))
    }
    return memory;
}

function interpret_line(line, pc, memory)
{
    let tokens = line.split(' ');

    switch (tokens[0]) {
        case 'STOP':
            return -1;
        case 'IF':
            return execute_if(tokens, pc, memory);
        case 'GOTO':
            return Number(tokens[1]);
        default:
            execute_transport(tokens, memory);
            return pc += 1;
    }
}

function execute_if(tokens, pc, memory)
{
    let condition = tokens[1];
    let jump_to = Number(tokens[3]);
    let index = condition[1];
    if (condition[2] == '=') {
        return (memory[index] == 0) ? jump_to : pc += 1;
    }
    else {
        return (memory[index] > 0) ? jump_to : pc += 1;
    }
}

function execute_transport(tokens, memory)
{
    let target_register = tokens[0];
    let target_index = indirection(target_register, memory);
    let expression = tokens.slice(2);
    memory[target_index] = evaluate_expression(expression, memory);
    return;
}

function evaluate_expression(expression, memory)
{   
    // case of single register or indirect register or konstant
    if (expression.length == 1) {
        if (expression[0][0] == 'R') {
            //return memory[expression[0][1]];
            return memory[indirection(expression[0], memory)];
        }
        else {
            return Number(expression[0]);
        }
    }
    // case of + or - (md) expression
    else {
        if (expression[1] == '+') {
            return memory[expression[0][1]] + memory[expression[2][1]];
        }
        else {
            // modified subtraction
            let dif = memory[expression[0][1]] - memory[expression[2][1]];
            return dif > 0 ? dif : 0;
        }
    }   
}

function indirection(ref, memory)
{
    if (ref[1] == 'R')
    {
        return memory[ref[2]];
    }
    else {
        return ref[1];
    }
}