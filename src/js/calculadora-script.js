(function () {
    // Variáveis para armazenar os elementos do DOM
    var initial_deposit = document.querySelector('#initial_deposit'),
        contribution_amount = document.querySelector('#contribution_amount'),
        investment_timespan = document.querySelector('#investment_timespan'),
        investment_timespan_text = document.querySelector('#investment_timespan_text'),
        estimated_return = document.querySelector('#estimated_return'),
        future_balance = document.querySelector('#future_balance');

    // Atualiza o valor do campo de entrada
    function updateValue(element, action) {
        var min = parseFloat(element.getAttribute('min')),
            max = parseFloat(element.getAttribute('max')),
            step = parseFloat(element.getAttribute('step')) || 1,
            oldValue = element.dataset.value || element.defaultValue || 0,
            newValue = parseFloat(element.value.replace(/€/, ''));

        // Verifica se o novo valor é um número
        if (isNaN(parseFloat(newValue))) {
            newValue = oldValue;
        } else {
            if (action === 'add') {
                newValue += step;
            } else if (action === 'sub') {
                newValue -= step;
            }

            newValue = newValue < min ? min : newValue > max ? max : newValue;

            // Verificação do valor máximo e acionamento do alerta
            if (newValue >= max && element.id === 'initial_deposit') {
                alert('Você alcançou o valor máximo!');
            }
            if (newValue >= max && element.id === 'contribution_amount') {
                alert('Você alcançou o valor máximo!');
            }
            if (newValue >= max && element.id === 'estimated_return') {
                alert('Você alcançou o valor máximo!');
            }
        }

        element.dataset.value = newValue;
        element.value = (element.dataset.prepend || '') + newValue + (element.dataset.append || '');

        updateChart();
    }

    // Retorna os dados do gráfico
    function getChartData() {
        var P = parseFloat(initial_deposit.dataset.value), // Principal
            r = parseFloat(estimated_return.dataset.value / 100), // Taxa de Juro Anual
            c = parseFloat(contribution_amount.dataset.value), // Montante de Contribuição
            n = parseInt(document.querySelector('[name="compound_period"]:checked').value), // Período de Capitalização
            n2 = parseInt(document.querySelector('[name="contribution_period"]:checked').value), // Período de Contribuição
            t = parseInt(investment_timespan.value), // Duração do Investimento
            currentYear = (new Date()).getFullYear()
        ;

        var labels = [];
        for (var year = currentYear; year < currentYear + t; year++) {
            labels.push(year);
        }

        // Montante Principal Total
        var principal_dataset = {
            label: 'Montante Principal',
            backgroundColor: 'rgb(0, 123, 255)',
            data: []
        };

        // Juro Total
        var interest_dataset = {
            label: "Juro",
            backgroundColor: 'rgb(23, 162, 184)',
            data: []
        };

        // Calcula o montante principal e o juro para cada ano
        for (var i = 1; i <= t; i++) {
            var principal = P + (c * n2 * i),
                interest = 0,
                balance = principal;

            if (r) {
                var x = Math.pow(1 + r / n, n * i),
                    juro_composto = P * x,
                    juro_contribuicao = c * (x - 1) / (r / n2);
                interest = (juro_composto + juro_contribuicao - principal).toFixed(0)
                balance = (juro_composto + juro_contribuicao).toFixed(0);
            }

            future_balance.innerHTML = balance + '€';
            principal_dataset.data.push(principal);
            interest_dataset.data.push(interest);
        }

        return {
            labels: labels,
            datasets: [principal_dataset, interest_dataset]
        }
    }

    // Atualiza o gráfico
    function updateChart() {
        var data = getChartData();

        chart.data.labels = data.labels;
        chart.data.datasets[0].data = data.datasets[0].data;
        chart.data.datasets[1].data = data.datasets[1].data;
        chart.update();
    }

    initial_deposit.addEventListener('change', function () {
        updateValue(this);
    });

    contribution_amount.addEventListener('change', function () {
        updateValue(this);
    });

    estimated_return.addEventListener('change', function () {
        updateValue(this);
    });

    investment_timespan.addEventListener('change', function () {
        investment_timespan_text.innerHTML = this.value + ' anos';
        updateChart();
    });

    investment_timespan.addEventListener('input', function () {
        investment_timespan_text.innerHTML = this.value + ' anos';
    });

    var radios = document.querySelectorAll('[name="contribution_period"], [name="compound_period"]');
    for (var j = 0; j < radios.length; j++) {
        radios[j].addEventListener('change', updateChart);
    }

    var buttons = document.querySelectorAll('[data-counter]');

    // Adiciona um event listener a cada botão
    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];

        button.addEventListener('click', function () {
            var field = document.querySelector('[name="' + this.dataset.field + '"]'),
                action = this.dataset.counter;

            if (field) {
                updateValue(field, action);
            }
        });
    }

    // Configuração do gráfico
    var ctx = document.getElementById('myChart').getContext('2d'),
        chart = new Chart(ctx, {
            type: 'bar',
            data: getChartData(),
            options: {
                legend: {
                    display: false
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function (tooltipItem, data) {
                            return data.datasets[tooltipItem.datasetIndex].label + ': ' + tooltipItem.yLabel + '€';
                        }
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Ano'
                        }
                    },
                    y: {
                        stacked: true,
                        ticks: {
                            callback: function (value) {
                                return value + '€';
                            }
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Saldo'
                        }
                    }
                }
            }
        });

    //////////////////CÓDIGO PERSONALIZADO//////////////////////

    /// Função para redefinir os valores dos campos de entrada para o estado inicial
    function resetValues() {
        // Redefine cada campo de entrada para o seu valor inicial
        document.getElementById('initial_deposit').value = '5000€';
        document.getElementById('contribution_amount').value = '100€';
        document.getElementById('estimated_return').value = '5.00%';
        document.getElementById('investment_timespan').value = '5';
        investment_timespan_text.innerHTML = '5 anos';

        updateChart(); // Atualiza o gráfico com os valores padrão
    }

    // Adiciona um event listener ao botão de reset
    document.getElementById('reset').addEventListener('click', resetValues);

    /// Incrementar e decrementar os valores dos campos de entrada
    // Variável para armazenar o timer
    var repeatTimer;

    function startIncrementing(field, action) {
        // Função para atualizar o valor
        function increment() {
            updateValue(field, action);
        }

        // Define a velocidade com base no campo
        var time;
        if (field.name === "estimated_return") {
            time = 300; // Velocidade mais lenta para 'estimated_return'
        } else if (field.name === "initial_deposit") {
            time = 50; // Velocidade mais lenta para 'estimated_return'
        } else {
            time = 200; // Velocidade padrão para outros campos
        }

        // Inicia o timer
        //increment();
        repeatTimer = setInterval(increment, time);
    }

    function stopIncrementing() {
        clearInterval(repeatTimer);
    }

    // Adiciona eventos aos botões
    //var buttons = document.querySelectorAll('[data-counter]');
    buttons.forEach(function (button) {
        button.addEventListener('mousedown', function () {
            var field = document.querySelector('[name="' + this.dataset.field + '"]');
            var action = this.dataset.counter;
            startIncrementing(field, action);
        });

        // Para incrementar tanto no mouseup quanto ao sair do botão
        button.addEventListener('mouseup', stopIncrementing);
        button.addEventListener('mouseleave', stopIncrementing);
    });

})();