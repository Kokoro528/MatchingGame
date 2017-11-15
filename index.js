var rows = 8;
var cols = 15;
var init_time = 300;
var time = -1;
var score = -1;
var values = [];
var selected = undefined;
var interval = undefined;
var level = 0;

// Call when the page loaded, we need add all call in this function
window.onload = function() {
    open_pop('start-menu');
    close_pop('history-pop');
    update_highest_score();

    document.getElementById('restart-btn').onclick = function() {
        open_pop('start-menu');
    };
    document.getElementById('history-btn').onclick = function() {
        show_history();
    };
    document.getElementById('start-btn').onclick = function() {
        start_game();
    };
    document.getElementById('cancel-btn').onclick = function() {
        close_pop('start-menu');
    };
    document.getElementById('clear-btn').onclick = function() {
        clear_history();
    };
    document.getElementById('close-btn').onclick = function() {
        close_pop('history-pop');
    };
}

function init_board() {
    // First init the values
    var count = 0;
    if (level == '1') {
        // If level == 1, we will have 6 kinds of elements
        count = 6;
    } else if (level == '2') {
        // If level == 2, we will have 8 kinds of elements
        count = 8;
    } else {
        // Else, we will have 12 kinds of elements
        count = 10;
    }

    values = [];
    selected = undefined;

    // Fill the values, each value has 120/count
    var vals = [];
    for (var i = 0; i < count; i++) {
        for (var j = 0; j < rows * cols / count; j++) {
            vals.push(i);
        }
    }

    // Shuffle the vals and copy it to values
    vals.sort(function(a, b){ return (0.5 - Math.random()); });
    for (var i = 0; i < rows; i++) {
        var v = [];
        for (var j = 0; j < cols; j++) {
            v.push(vals[i*cols + j]);
        }
        values.push(v);
    }

    // Draw the board
    draw_board();
}
    
// Draw the board
function draw_board() {
    var board = document.getElementById('board');
    board.innerHTML = '';
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            // Create a span with id and className and append to the board
            var span = document.createElement('span');
            span.id = 'cell-' + i + '-' + j;
            span.className = 'cell';
            board.append(span);

            // Set the span's innerHTML
            //span.innerHTML = '' + values[i][j];
            span.onclick = click_cell(i, j);
            span.style['background-image'] = 'url(images/image' + values[i][j] + '.jpg)';

        }
        // Append a <br/> to board
        var br = document.createElement('br');
        board.append(br);
    }
}

// Select a cell
function select_cell(r, c) {
    if (selected) {
        // If a cell selected, cancel it first
        var selected_cell = document.getElementById('cell-' +
                selected[0] + '-' + selected[1]);
        selected_cell.className = 'cell';
        selected = undefined;
    }
    if (r >= 0 && c >= 0) {
        // select new cell
        selected = [r, c];
        var cell = document.getElementById('cell-' + r + '-' + c);
        cell.className = 'cell selected';
    }
}

// Clear a cell
function clear_cell(r, c) {
    var cell = document.getElementById('cell-' + r + '-' + c);
    values[r][c] = -1;
    cell.style.visibility = "hidden";
}

function click_cell(r, c) {
    return function() {
        var cell = document.getElementById('cell-' + r + '-' + c);
        if (!selected) {
            // If not selected, select the cell
            select_cell(r, c);
        } else {
            if (selected[0] == r && selected[1] == c) {
                // Do noting
                return;
            }
            var selected_cell = document.getElementById('cell-' +
                    selected[0] + '-' + selected[1]);
            if (values[selected[0]][selected[1]] == values[r][c]) {
                if (check_horizontal_linked(selected, [r, c]) ||
                        check_vertical_linked(selected, [r, c])) {
                    // Linked
                    clear_cell(r, c);
                    clear_cell(selected[0], selected[1]);
                    select_cell(-1, -1);
                    update_score(score + 10);
                    check_finished();
                } 
            } else {
                // Change selected
                select_cell(r, c);
            }
        }
    }
}

// Check if two cells are linked
function check_linked(cell1, cell2) {
    if (values[cell1[0]][cell1[1]] != values[cell2[0]][cell2[1]]) {
        return false;
    }
    if (check_horizontal_linked(cell1, cell2)) {
        return true;
    }
    if (check_vertical_linked(cell1, cell2)) {
        return true;
    }
    return false;
}

// Check if two cells are linked in horizontal direction
function check_horizontal_linked(cell1, cell2) {
    // Check horizontal
    var left1 = cell1[1];
    var right1 = cell1[1];
    var left2 = cell2[1];
    var right2 = cell2[1];

    while (left1 - 1 >= 0 && values[cell1[0]][left1 - 1] == -1) {
        left1 -= 1;
    }
    while (right1 + 1 < cols && values[cell1[0]][right1 + 1] == -1) {
        right1 += 1;
    }
    while (left2 - 1 >= 0 && values[cell2[0]][left2 - 1] == -1) {
        left2 -= 1;
    }
    while (right2 + 1 < cols && values[cell2[0]][right2 + 1] == -1) {
        right2 += 1;
    }

    if (left1 == 0 && left2 == 0) {
        return true;
    }
    if (right1 == cols -1 && right2 == cols - 1) {
        return true;
    }

    for (var c = 0; c < cols; c++) {
        if (c >= left1 && c <= right1 && c >= left2 && c <= right2) {
            var linked = true;
            if (cell1[0] < cell2[0]) {
                var start = cell1[0];
                var end = cell2[0];
            } else {
                var start = cell2[0];
                var end = cell1[0];
            }
            for (var r = start + 1; r < end; r++) {
                if (values[r][c] != -1) {
                    linked = false;
                }
            }
            if (linked) {
                return true;
            }
        }
    }
    return false;
}

// Check if two cells are linked in vertical direction
function check_vertical_linked(cell1, cell2) {
    // Check vertical
    var top1 = cell1[0];
    var bottom1 = cell1[0];
    var top2 = cell2[0];
    var bottom2 = cell2[0];

    while (top1 - 1 >= 0 && values[top1 - 1][cell1[1]] == -1) {
        top1 -= 1;
    }
    while (bottom1 + 1 < rows && values[bottom1 + 1][cell1[1]] == -1) {
        bottom1 += 1;
    }
    while (top2 - 1 >= 0 && values[top2 - 1][cell2[1]] == -1) {
        top2 -= 1;
    }
    while (bottom2 + 1 < rows && values[bottom2 + 1][cell2[1]] == -1) {
        bottom2 += 1;
    }

    if (top1 == 0 && top2 == 0) {
        return true;
    }
    if (bottom1 == rows - 1 && bottom2 == rows - 1) {
        return true;
    }
    for (var r = 0; r < rows; r++) {
        if (r >= top1 && r <= bottom1 && r >= top2 && r <= bottom2) {
            var linked = true;
            if (cell1[1] < cell2[1]) {
                var start = cell1[1];
                var end = cell2[1];
            } else {
                var start = cell2[1];
                var end = cell1[1];
            }
            for (var c = start + 1; c < end; c++) {
                if (values[r][c] != -1) {
                    linked = false;
                }
            }
            if (linked) {
                return true;
            }
        }
    }
    return false;
}

function close_pop(id) {
    document.getElementById(id).style.visibility = 'hidden';
}

function open_pop(id) {
    document.getElementById(id).style.visibility = 'visible';
}

// Start the game
function start_game() {
    level = document.getElementById('select-level').value;
    // Init board and close the start menu
    init_board();
    close_pop('start-menu');

    // Save the last result
    save_result();

    // Reset the counters
    update_score(0);
    update_time(init_time);
    update_highest_score();

    // Set the alarm
    if (!interval) {
        interval = setInterval(function() {
            update_time(time - 1);
        }, 1000);
    }
}

function update_score(val) {
    score = val;
    document.getElementById('score-value').innerHTML = score;
}

// Update time alarm
function update_time(val) {
    time = val;
    document.getElementById('time-value').innerHTML = time;
    if (time == 0) {
        clearInterval(interval);
        interval = undefined;
        save_result();
        alert('Time over!');
        open_pop('start-menu');
    }
}

function save_result() {
    if (score < 0) {
        // Nothing to do
        return;
    }

    var history = get_history();

    // Get the level string
    var level_str = 'Hard';
    if (level == '1') {
        level_str = 'Esay';
    } else if (level == '2') {
        level_str = 'Normal';
    } else {
        level_str = 'Hard';
    }

    history.push({
        'time': new Date(),
        'used': init_time - time,
        'level': level_str,
        'score': score,
    });
    history = JSON.stringify(history);
    localStorage.setItem('history', history);
}

// Load the history from the local storage
function get_history() {
    var history = localStorage.getItem('history');
    if (history) {
        history = JSON.parse(history);
    } else {
        history = [];
    }
    return history;
}

// Update the highest score
function update_highest_score() {
    var history = get_history();
    var highest = 0;
    for (var i = 0; i < history.length; i++) {
        if (history[i]['score'] > highest) {
            highest = history[i]['score'];
        }
    }
    document.getElementById('highest-score-value').innerHTML = highest;
}

// Show the history
function show_history() {
    open_pop('history-pop');
    var body = document.getElementById('history');
    body.innerHTML = '';
    var history = get_history();
    for (var i = 0; i < history.length; i++) {
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + history[i]['time'] + '</td>' + 
            '<td>' + history[i]['used'] + 's</td>' + 
            '<td>' + history[i]['level'] + '</td>' + 
            '<td>' + history[i]['score']+ '</td>';
        body.append(tr);
    }
}

// CLear the history
function clear_history() {
    localStorage.clear();
    update_highest_score();
    var body = document.getElementById('history');
    body.innerHTML = '';
}

// Check if the game finished
function check_finished() {
    var finished = true;
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            if (values[i][j] != -1) {
                finished = false;
            }
        }
    }
    if (finished) {
        // If finished, clear the interval
        clearInterval(interval);
        interval = undefined;
        save_result();
        alert('Congratulations!');
        open_pop('start-menu');
    }
}
