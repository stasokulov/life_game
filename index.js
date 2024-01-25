let size = 0;
let matrix = [];
const field = document.querySelector('.field');
let isPause = false;
let isRun = false;
let cellNodes;

const loopStatistic = {
    calculation1: {
        counter: 0,
        totalTime: 0,
    },
    calculation2: {
        counter: 0,
        totalTime: 0,
    },
    render: {
        counter: 0,
        totalTime: 0,
    },
};

const destroyMatrix = () => {
    matrix = [];
}

const getCell = () => {
    return {
        id: 0,
        isLive: false,
        oldIsLive: false,
        liveNeighbors: 0,
        x: 0,
        y: 0,
        neghborsCoords: [],
        neighborsIdArr: [],
    };
};

const clearMatrix = () => {
    matrix.forEach((cell) => {
        cell.isLive = false;
        cell.oldIsLive = false;
        cell.liveNeighbors = 0;
    });
}

const destroyField = () => {
    field.innerHTML = '';
}

const createField = () => {
    const sizeInput = document.querySelector('#size-input');
    if (!sizeInput) {
        showError('Инпут не найден');
        return
    };

    if (!sizeInput.value) {
        showError('Нужно ввести число');
        return;
    };

    size = sizeInput.value;

    if (!field) {
        showError('Поле не найдено');
        return
    };

    clearAverageTime();
    destroyField();
    destroyMatrix();
    createMatrix();

    if (!matrix.length) {
        showError('Матрица не готова');
    };

    const createRow = () => {
        const row = document.createElement('div');
        row.className = 'row';
        return row;
    };

    const createcell = () => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        return cell;
    };

    let rowCounter = 0;

    htmlTemplateMatrix = [];

    matrix.forEach((cell) => {
        if (rowCounter === cell.y) {
            const htmlRow = createRow();
            const row = matrix.filter((item) => item.y === rowCounter);
            row.forEach((cell) => {
                const htmlcell = createcell();
                htmlcell.setAttribute('id', cell.id);
                htmlRow.appendChild(htmlcell);
            });
            field.appendChild(htmlRow);

            rowCounter++;
        }
    });

    cellNodes = document.querySelectorAll('.cell');
};

const clearField = () => {
    Array.from(cellNodes).forEach((htmlCell) => htmlCell.classList.remove('isLive'));
};



const createMatrix = () => {
    const cellsNumber = size**2;
    for(let i = 0; i < cellsNumber; i++) {
        const x = i % size;
        const y = Math.floor(i/size);
        // const currentCell = {...cell};
        const currentCell = getCell();

        currentCell.id = i;
        currentCell.x = x;
        currentCell.y = y;
        currentCell.neghborsCoords = getNeighborsCoords(x, y);

        matrix.push(currentCell);
    };

    setNeighborsId();
};

const setNeighborsId = () => {
    matrix.forEach((cell) => {
        // Вычисляем id по координатам.
        cell.neighborsIdArr = cell.neghborsCoords.map(([x, y]) => {
            // Номер строки, умноженный на длинну строки плюс номер колонки.
            return x + (y * size);
        });
    });
};

const showError = (message = 'Не известная ошибка') => {
    alert(message);
};

const manualPlantField = (event) => {
    const classList = Array.from(event.target.classList);
    const isCell = classList.some((item) => item === 'cell');
    if (!isCell) {
        return
    }
    plantMatrix(event.target.attributes.id.value);
    plantField();
};

const plantMatrix = (id) => {
    if (!matrix.length) {
        showError('Матрица пуста');
    }
    matrix[id].isLive = !matrix[id].isLive;
};

const plantField = () => {
    let liveCounter = 0;

    matrix.forEach((cell) => {
        if (cell.isLive === cell.oldIsLive) {
            return
        };

        const cellNode = document.getElementById(cell.id);
        if (cell.isLive) {
            cellNode.classList.add('isLive');
            liveCounter++;
        } else {
            cellNode.classList.remove('isLive');
        };
    });

    if (liveCounter  === 0) {
        setPause();
    };
};

const autoPlantField = () => {
    setPause();
    clearMatrix();
    clearField();
    matrix.forEach((cell) => {
        if(Math.random() < 0.2) {
            plantMatrix(cell.id)
        };
    });
    plantField();
}

const getNeighborsCoords = (x, y) => {
    const numberBefore = (number) => number === 0 ? size - 1 : number - 1;
    const numberAfter = (number) => number === size - 1 ? 0 : number + 1;
    return [
        [numberBefore(x), numberBefore(y)], [x, numberBefore(y)], [numberAfter(x), numberBefore(y)],
        [numberBefore(x), y],                                     [numberAfter(x), y],
        [numberBefore(x), numberAfter(y)],  [x, numberAfter(y)],  [numberAfter(x), numberAfter(y)]
    ];    
};

const countNeighbors = () => {
    matrix.forEach((cell) => {
        cell.liveNeighbors = 0;
        cell.neighborsIdArr.forEach((id) => {
            if (matrix[id].isLive) {
                cell.liveNeighbors++;
            }
        });
    })
};

const snapThanosFingers = () => {
    matrix.forEach((cell) => {
        cell.oldIsLive = cell.isLive;
        if (cell.isLive) {
            cell.isLive = cell.liveNeighbors === 3 || cell.liveNeighbors === 2;
        } else {
            cell.isLive = cell.liveNeighbors === 3;
        }
    });
}

const manualRevive = () => {
    if (isRun) {
        return;
    };
    isPause = false;
    revive();
};

const revive = () => {
    if (isPause) {
        return;
    };

    isRun = true;
    isPause = false;

    const startCalculationTime1 = Date.now();
    countNeighbors();
    const endCalculationTime1 = Date.now();
    setAverageCalculationTime1(endCalculationTime1 - startCalculationTime1);

    const startCalculationTime2 = Date.now();
    snapThanosFingers();
    const endCalculationTime2 = Date.now();
    setAverageCalculationTime2(endCalculationTime2 - startCalculationTime2);

    const startRenderTime = Date.now();
    plantField();
    const endRenderTime = Date.now();
    setAverageRenderTime(endRenderTime - startRenderTime);

    setTimeout(revive, 1000);
}

const setPause = () => {
    isPause = true;
    isRun = false;
};

const clear = () => {
    setPause();
    clearMatrix();
    clearField();
    plantField();
    clearAverageTime();
};

const setAverageCalculationTime1 = (duration) => {
    loopStatistic.calculation1.counter++;
    loopStatistic.calculation1.totalTime += duration;
    averageCalculationTimeEl1.innerHTML = Math.round(loopStatistic.calculation1.totalTime / loopStatistic.calculation1.counter);
};

const setAverageCalculationTime2 = (duration) => {
    loopStatistic.calculation2.counter++;
    loopStatistic.calculation2.totalTime += duration;
    averageCalculationTimeEl2.innerHTML = Math.round(loopStatistic.calculation2.totalTime / loopStatistic.calculation2.counter);
};

const setAverageRenderTime = (duration) => {
    loopStatistic.render.counter++;
    loopStatistic.render.totalTime += duration;
    averageRenderTimeEl.innerHTML = Math.round(loopStatistic.render.totalTime / loopStatistic.render.counter);
};

const clearAverageTime = () => {
    loopStatistic.calculation1.counter = 0;
    loopStatistic.calculation1.totalTime = 0;

    loopStatistic.calculation2.counter = 0;
    loopStatistic.calculation2.totalTime = 0;

    loopStatistic.render.counter = 0;
    loopStatistic.render.totalTime = 0;

    averageCalculationTimeEl1.innerHTML = "";
    averageCalculationTimeEl2.innerHTML = "";
    averageRenderTimeEl.innerHTML = "";
};

const buildButton = document.querySelector('#build-button');
const autoPlantButton = document.querySelector('#auto-plant-button');
const reviveButton = document.querySelector('#revive-button');
const pauseButton = document.querySelector('#pause-button');
const clearButton = document.querySelector('#clear-button');

const averageCalculationTimeEl1 = document.querySelector('#average-calculation-time-1');
const averageCalculationTimeEl2 = document.querySelector('#average-calculation-time-2');
const averageRenderTimeEl = document.querySelector('#average-render-time');


buildButton.addEventListener('click', createField);
autoPlantButton.addEventListener('click', autoPlantField);
field.addEventListener('click', manualPlantField);
reviveButton.addEventListener('click', manualRevive);
pauseButton.addEventListener('click', setPause);
clearButton.addEventListener('click', clear);

createField();

