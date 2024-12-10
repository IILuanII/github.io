var Game = Game || (function () {
    var _bombs = 0;
    var _hits = 0;
    var _ships = [];
    var _letters = "ABCDEFG";
    var $rows = {};
    var _barcos = document.getElementById("barcos");
    var _currentShipIndex = 0;
    var allShips = []; // Array para armazenar todas as posições dos navios
    var allCoordinates = []; // Array para armazenar todas as coordenadas escolhidas
    var isPlayingAudio = false;// Variável para controlar a reprodução do áudio

    function start() {
        var title = document.title;
        var interval = setInterval(function () {
            if (document.title.length == 11) {
                document.title = 'Carregando..';
            } else if (document.title.length == 12) {
                document.title = 'Carregando...';
            } else {
                document.title = 'Carregando.';
            }
        }, 500);
        set_table();
        set_coords();
        set_events();
        set_ships();
        clearInterval(interval);

        // Inicia a exibição das posições dos navios
        document.getElementById("nextPosition").addEventListener("click", showNextPosition);

        // Adiciona o evento para o botão de ataque
        document.getElementById("attackButton").addEventListener("click", manualAttack);

        document.addEventListener("DOMContentLoaded", setupEnterKeyPress);
        document.addEventListener("DOMContentLoaded",setupInfoKeyPress);

    }

    function set_table() {
        var $table = $('<table></table>');
        for (var x = 0; x < 7; x++) {
            var $tr = $('<tr></tr>');
            for (var z = 0; z < 7; z++) {
                var $td = $(`<td style='height: 8vh; width: 6vw;'></td>`);
                $tr.append($td);
            }
            $table.append($tr);
        }
        $('#game').html($table);
    }

    function set_coords() {
        $rows = $('#game table tr');
        for (var x = 0, length = $rows.length; x < length; x++) {
            $rows.eq(x).attr('data-row', _letters[x]);
            var $cols = $rows.eq(x).find('td');
            for (var y = 0, length = $cols.length; y < length; y++) {
                $cols.eq(y).attr('data-col', (y + 1));
                $cols.eq(y).attr('title', 'Jogar bomba em ' + _letters[x] + (y + 1));
            }
        }
    }

    function set_events() {
        /*$('#game table td').off('click').click(function () {
            var $this = $(this);
            var row = $this.parent().data('row');
            var col = $this.data('col');
            attack($this, row, col);
        });*/
        // Adiciona o evento hover para tocar áudio somente ao entrar na coordenada
        $('#game table td').off('mouseenter').on('mouseenter', function () {
            var $this = $(this);
            var row = $this.parent().data('row');
            var col = $this.data('col');
            play_sound(row, col);
        });

        $('#game table td').off('mouseleave'); // Remove o evento mouseleave para evitar tocar áudio ao sair

        $('#sound-checkbox input').off('change').change(function () {
            if (!$(this).is(':checked')) {
                var $audios = $('audio');
                for (var i = 0, length = $audios.length; i < length; i++) {
                    $audios.get(i).pause();
                }
            } else if (_hits < 11) {
                // ... Your other code
            }
        });
    }

    function attack($cell, row, column) {
        $cell.off('click');
        _bombs++;

        var coordinate = row + column;
        if (!allCoordinates.includes(coordinate)) {
            allCoordinates.push(coordinate);
        }

        if (_ships[row] && _ships[row][column]) {
            var shipPart = getShipPart(row, column);
            if (shipPart !== '') {
                $cell.addClass('ship-hit');
                $cell.addClass(shipPart); // Aplica a classe CSS da parte do navio atingida

                $cell.css('background-color', '#000000'); // Muda a cor de fundo para preto
                $cell.attr('title', 'Você já acertou um navio em ' + row + column); // Define o título
                _hits++;
                play_sound('hit');
            }
        } else {
            $cell.css('background-color', '#0D47A1');
            $cell.attr('title', 'Você já jogou uma bomba em ' + row + column);
            play_sound('miss');
        }

        updateCoordinateHistoryDisplay();
        check_game_over();
    }

    function manualAttack() {
        var x = parseInt(document.getElementById("x").value);
        var y = document.getElementById("y").value.toUpperCase();

        if (!isNaN(x) && x >= 1 && x <= 7 && _letters.includes(y) && y != "") {
            var row = y;
            var col = x;
            var $cell = $rows.filter('[data-row="' + row + '"]').find('td[data-col="' + col + '"]');
            attack($cell, row, col);
        } else {
            alert("Coordenadas inválidas! Por favor, insira valores válidos para Y (A-J) e X (1-7).");
        }
    }

    function updateCoordinateHistoryDisplay() {
        var coordinateHistoryElement = document.getElementById("coordenadas");
        var uniqueCoordinates = Array.from(new Set(allCoordinates));
        coordinateHistoryElement.innerText = "" + uniqueCoordinates.join(", ");
    }

    function set_ships() {
        allShips.push(add_ship(4));
        allShips.push(add_ship(3));
        allShips.push(add_ship(2));
        allShips.push(add_ship(2));
    }

    function can_set_ship(length) {
        var _great = true;
        var _row, _col, _orientation, _direction;

        _orientation = random(1, 2);
        _row = random(1, 7);
        _col = random(1, 7);

        if (_orientation == 1) { // vertical
            while (!(_row >= length)) {
                _row = random(1, 7);
            }

            _direction = (_row + length - 1 <= 7) ? 1 : -1;

            row = _row;
            col = _col;
            for (var x = 0; x < length; x++) {
                if (_ships[_letters[row - 1]] && _ships[_letters[row - 1]][col]) {
                    _great = false;
                }
                row += _direction;
            }
        } else { // horizontal
            while (!(_col >= length)) {
                _col = random(1, 7);
            }

            _direction = (_col + length - 1 <= 7) ? 1 : -1;

            row = _row;
            col = _col;
            for (var x = 0; x < length; x++) {
                if (_ships[_letters[row - 1]] && _ships[_letters[row - 1]][col]) {
                    _great = false;
                }
                col += _direction;
            }
        }

        if (_great) {
            return {
                'row': _row,
                'col': _col,
                'orientation': _orientation,
                'direction': _direction
            };
        } else {
            return can_set_ship(length);
        }
    }

    function add_ship(length) {
        var data = can_set_ship(length);
        var row = data.row;
        var col = data.col;
        var orientation = data.orientation;
        var direction = data.direction;
        var positions = [];

        for (var x = 0; x < length; x++) {
            positions.push({
                row: _letters[row - 1],
                col: col,
                part: x + 1, // Adiciona a parte do navio (1 a length)
                orientation: orientation // Adiciona a orientação (1 = vertical, 2 = horizontal)
            });
            if (!_ships[_letters[row - 1]]) {
                _ships[_letters[row - 1]] = {};
            }
            _ships[_letters[row - 1]][col] = true;
            if (orientation == 1) {
                row += direction;
            } else {
                col += direction;
            }
        }
        return positions;
    }

    function showNextPosition() {
        if (_currentShipIndex < allShips.length) {
            var positions = allShips[_currentShipIndex];
    
            // Primeira e última posição do navio
            var startPosition = positions[0]; // Primeira posição do navio
            var endPosition = positions[positions.length - 1]; // Última posição do navio
    
            var rowStart, rowEnd, colStart, colEnd;
    
            // Verifica a orientação do navio
            if (startPosition.row === endPosition.row) {
                // Navio horizontal (mesma linha, colunas diferentes)
                rowStart = startPosition.row;  // A linha permanece a mesma
                colStart = Math.min(startPosition.col, endPosition.col); // Coluna inicial real do navio
                colEnd = Math.max(startPosition.col, endPosition.col);   // Coluna final real do navio
    
                // Ajusta os limites do intervalo horizontal (se possível)
                colStart = Math.max(1, colStart - 1); // Coluna anterior, ou 1 se já no limite
                colEnd = Math.min(7, colEnd + 1);     // Coluna posterior, ou 5 se já no limite
                rowEnd = rowStart; // A linha final é a mesma para navios horizontais
            } else if (startPosition.col === endPosition.col) {
                // Navio vertical (mesma coluna, linhas diferentes)
                colStart = startPosition.col;  // A coluna permanece a mesma
                colEnd = colStart;             // Coluna única para navio vertical
                rowStart = _letters[Math.min(_letters.indexOf(startPosition.row), _letters.indexOf(endPosition.row))]; // Linha inicial real do navio
                rowEnd = _letters[Math.max(_letters.indexOf(startPosition.row), _letters.indexOf(endPosition.row))];   // Linha final real do navio
    
                // Ajusta os limites do intervalo vertical (se possível)
                var rowStartIndex = _letters.indexOf(rowStart) - 1;
                var rowEndIndex = _letters.indexOf(rowEnd) + 1;
                rowStart = (rowStartIndex >= 0) ? _letters[rowStartIndex] : rowStart; // Linha anterior, se não for "A"
                rowEnd = (rowEndIndex < _letters.length) ? _letters[rowEndIndex] : rowEnd; // Linha posterior, se não for "E"
            } else {
                // Caso improvável de um navio em diagonal, apenas uma proteção
                _barcos.innerText = "Erro: Coordenadas diagonais detectadas!";
                return;
            }
    
            // Garante que as linhas e colunas estão dentro dos limites
            if (colStart < 1) colStart = 1;     // Limite mínimo para colunas
            if (colEnd > 7) colEnd = 7;         // Limite máximo para colunas
            if (_letters.indexOf(rowStart) < 0) rowStart = startPosition.row;  // Garantir que a linha anterior não saia do tabuleiro
            if (_letters.indexOf(rowEnd) > _letters.length - 1) rowEnd = endPosition.row; // Garantir que a linha posterior não saia do tabuleiro
    
            // Formatar a mensagem com o intervalo correto do navio
            var positionText = `O navio está entre ${rowStart}${colStart} e ${rowEnd}${colEnd}.`;
    
            // Exibir a mensagem na interface
            _barcos.innerText = positionText;
            _currentShipIndex++;
        } else {
            _barcos.innerText = "Todas as posições foram exibidas.";
        }
    }
    
    
    
    
    
    
    
    function random(start, end) {
        return Math.floor((Math.random() * end) + start);
    }

    function getShipPart(row, column) {
        for (var i = 0; i < allShips.length; i++) {
            var ship = allShips[i];
            for (var j = 0; j < ship.length; j++) {
                if (ship[j].row === row && ship[j].col === column) {
                    var shipLength = ship.length;
                    var part = ship[j].part;
                    var startRow = ship[0].row;
                    var endRow = ship[ship.length - 1].row;
                    var startCol = ship[0].col;
                    var endCol = ship[ship.length - 1].col;

                    var orientation;

                    if (startRow === endRow) {
                        if (startCol < endCol) {
                            orientation = 'right'; // Esquerda-Direita
                        } else {
                            orientation = 'left'; // Direita-Esquerda
                        }
                    } else if (startCol === endCol) {
                        if (startRow < endRow) {
                            orientation = 'down'; // Cima-Baixo
                        } else {
                            orientation = 'up'; // Baixo-Cima
                        }
                    }

                    var partClass;
                    if (shipLength === 1) {
                        partClass = 'ship1';
                    } else if (part === 1) {
                        partClass = 'ship' + shipLength + '-start';
                    } else if (part === shipLength) {
                        partClass = 'ship' + shipLength + '-end';
                    } else {
                        partClass = 'ship' + shipLength + '-middle' + (part - 1);
                    }

                    partClass += '-' + orientation;

                    return partClass;
                }
            }
        }
        return '';
    }

    function check_game_over() {
        if (_hits == 11) {
            play_sound('win');
            if (confirm('Você ganhou com ' + ((_hits / _bombs) * 100).toFixed() + '% de taxa de acerto.\nTentativas: ' + _bombs + '\nAcertos: ' + _hits + '\nDeseja iniciar um novo jogo?')) {
                location.reload();
            }
            $('#game td').off('click mouseenter mouseleave');
        }
    }

    function play_sound(id, id2, volume) {
        if ($('#sound-checkbox input').is(':checked') && !isPlayingAudio) {
            isPlayingAudio = true;
            var sound = $('audio#' + id).get(0);
            if (volume) {
                sound.volume = volume;
            }
            sound.pause();
            sound.currentTime = 0;

            if(id2 != ''){
                sound.play();
                sound.onended = function(){
                    sound = $('audio#' + id2).get(0);
                    sound.play();
                    sound.onended = function () {
                        isPlayingAudio = false; // Define que o áudio terminou de tocar
                        }
                }
            } else sound.play();
        }
    }

    function setupEnterKeyPress() {
        var inputX = document.getElementById("x");
        var inputY = document.getElementById("y");
        var attackButton = document.getElementById("attackButton");

        inputX.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                attackButton.click();
            }
        });

        inputY.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                attackButton.click();
            }
        });
    }

    function setupInfoKeyPress() {
        var infoButton = document.getElementById("nextPosition");
    
        document.addEventListener("keypress", function (event) {
            if (event.key.toLowerCase() === "k") {
                event.preventDefault();
                infoButton.click();
            }
        });
    }

    return {
        start: start
    };
})();

Game.start();
