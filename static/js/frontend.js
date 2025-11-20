// Variables globales
let sigmoidChart = null;
let originalDataChart = null;
let transformationChart = null;

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeSliders();
    initializeChart();
    calculateSigmoid(); // Calcular por defecto al cargar
});

// Inicializar los sliders
function initializeSliders() {
    const sliders = ['xShift', 'steepness', 'xRangeStart', 'xRangeEnd'];
    
    sliders.forEach(sliderId => {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(sliderId + 'Value');
        
        // Establecer valor inicial
        valueDisplay.textContent = parseFloat(slider.value).toFixed(1);
        
        slider.addEventListener('input', function() {
            valueDisplay.textContent = parseFloat(this.value).toFixed(1);
        });
    });
}

// Inicializar el gráfico
function initializeChart() {
    const ctx = document.getElementById('sigmoidChart').getContext('2d');
    
    sigmoidChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Función Sigmoidea',
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                data: []
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'X'
                    }
                },
                y: {
                    min: 0,
                    max: 1,
                    title: {
                        display: true,
                        text: 'f(X)'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Función Sigmoidea: f(x) = 1 / (1 + e^(-k*(x - x₀)))'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `f(${context.parsed.x.toFixed(2)}) = ${context.parsed.y.toFixed(4)}`;
                        }
                    }
                }
            }
        }
    });
}

// Calcular la función sigmoidea
async function calculateSigmoid() {
    const params = {
        x_shift: parseFloat(document.getElementById('xShift').value),
        steepness: parseFloat(document.getElementById('steepness').value),
        x_range_start: parseFloat(document.getElementById('xRangeStart').value),
        x_range_end: parseFloat(document.getElementById('xRangeEnd').value),
        num_points: 100
    };

    try {
        showLoading('Calculando sigmoidea...');
        
        const response = await fetch('/api/calculate/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        });

        const data = await response.json();

        if (response.ok) {
            updateChart(data.data);
            updateTable(data.data);
            updateResultsInfo(data.parameters);
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error de conexión: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Actualizar el gráfico con nuevos datos
function updateChart(sigmoidData) {
    sigmoidChart.data.datasets[0].data = sigmoidData.map(point => ({
        x: point.x,
        y: point.y
    }));
    
    // Actualizar título con parámetros actuales
    const xShift = document.getElementById('xShift').value;
    const steepness = document.getElementById('steepness').value;
    sigmoidChart.options.plugins.title.text = 
        `Sigmoidea: f(x) = 1 / (1 + e^(-${steepness}*(x - ${xShift})))`;
    
    sigmoidChart.update();
}

// Actualizar la tabla de datos
function updateTable(sigmoidData) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    // Mostrar solo algunos puntos para no saturar la tabla
    const step = Math.ceil(sigmoidData.length / 20);
    
    for (let i = 0; i < sigmoidData.length; i += step) {
        const point = sigmoidData[i];
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${point.x.toFixed(3)}</td>
            <td>${point.y.toFixed(6)}</td>
        `;
        
        tableBody.appendChild(row);
    }
}

// Actualizar información de resultados
function updateResultsInfo(parameters) {
    const resultsInfo = document.getElementById('resultsInfo');
    resultsInfo.innerHTML = `
        <p><strong>Parámetros usados:</strong> 
        x_shift = ${parameters.x_shift}, 
        steepness = ${parameters.steepness}, 
        rango X = [${parameters.x_range[0]}, ${parameters.x_range[1]}], 
        puntos = ${parameters.num_points}</p>
    `;
}

// Mostrar demostración de separabilidad no lineal
async function showNonlinearDemo() {
    try {
        showLoading('Cargando demostración...');
        
        const response = await fetch('/api/demo/nonlinear-separability/');
        const data = await response.json();

        if (response.ok) {
            displayNonlinearDemo(data);
            document.getElementById('demoSection').classList.remove('hidden');
            document.querySelector('.results').classList.add('hidden');
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        alert('Error de conexión: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Ocultar demostración
function hideDemo() {
    document.getElementById('demoSection').classList.add('hidden');
    document.querySelector('.results').classList.remove('hidden');
}

// Mostrar la demostración no lineal
function displayNonlinearDemo(demoData) {
    createOriginalDataChart(demoData.original_data);
    createTransformationChart(demoData);
    updateDemoResults(demoData);
}

// Crear gráfico de datos originales
function createOriginalDataChart(originalData) {
    const ctx = document.getElementById('originalDataChart').getContext('2d');
    
    if (originalDataChart) {
        originalDataChart.destroy();
    }

    const class0 = originalData.filter(point => point.class === 0);
    const class1 = originalData.filter(point => point.class === 1);

    originalDataChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Clase 0 (Interior)',
                    data: class0.map(point => ({x: point.x1, y: point.x2})),
                    backgroundColor: 'rgba(231, 76, 60, 0.7)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    pointRadius: 6
                },
                {
                    label: 'Clase 1 (Exterior)',
                    data: class1.map(point => ({x: point.x1, y: point.x2})),
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    pointRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { 
                    title: { display: true, text: 'X₁' },
                    min: -6,
                    max: 6
                },
                y: { 
                    title: { display: true, text: 'X₂' },
                    min: -6,
                    max: 6
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Datos Originales - No Linealmente Separables'
                }
            }
        }
    });
}

// Crear gráfico de transformación
function createTransformationChart(demoData) {
    const ctx = document.getElementById('transformationChart').getContext('2d');
    
    if (transformationChart) {
        transformationChart.destroy();
    }

    const class0 = demoData.predictions.filter((_, index) => demoData.original_data[index].class === 0);
    const class1 = demoData.predictions.filter((_, index) => demoData.original_data[index].class === 1);

    transformationChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Clase 0 (Interior)',
                    data: class0.map(point => ({x: point.radius, y: point.probability})),
                    backgroundColor: 'rgba(231, 76, 60, 0.7)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    pointRadius: 6
                },
                {
                    label: 'Clase 1 (Exterior)',
                    data: class1.map(point => ({x: point.radius, y: point.probability})),
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    pointRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { 
                    title: { display: true, text: 'Radio r = √(x₁² + x₂²)' },
                    min: 0,
                    max: 8
                },
                y: { 
                    title: { display: true, text: 'Probabilidad Clase 1' },
                    min: 0,
                    max: 1
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Transformación Radial + Sigmoidea'
                }
            }
        }
    });

    // Dibujar línea de frontera de decisión manualmente
    const decisionBoundary = demoData.decision_boundary;
    const chartArea = transformationChart.chartArea;
    
    // Esta es una simplificación - en una aplicación real usarías el plugin de anotaciones
    console.log('Frontera de decisión en:', decisionBoundary);
}

// Actualizar resultados de la demostración
function updateDemoResults(demoData) {
    const demoResults = document.getElementById('demoResults');
    demoResults.innerHTML = `
        <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">
            <h3>Resultados de la Clasificación</h3>
            <p><strong>Precisión:</strong> ${(demoData.accuracy * 100).toFixed(1)}%</p>
            <p><strong>Frontera de Decisión:</strong> r = ${demoData.decision_boundary}</p>
            <p><strong>Pendiente Sigmoidea:</strong> ${demoData.steepness}</p>
            <p><strong>Explicación:</strong> ${demoData.explanation}</p>
        </div>
    `;
}

// Funciones de utilidad para loading
function showLoading(message) {
    // Podrías implementar un spinner aquí
    console.log(message);
}

function hideLoading() {
    // Ocultar spinner
}