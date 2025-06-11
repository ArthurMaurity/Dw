// Espera a página HTML carregar completamente
document.addEventListener('DOMContentLoaded', () => {

    // --- PARTE 1: PEGAR OS ELEMENTOS DO HTML ---
    // Elementos do Questionário
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const finishBtn = document.getElementById('finish-btn');

    // Elementos do Relatório
    const relatorioSection = document.getElementById('relatorio-section');
    const resultadoTexto = document.getElementById('resultado-texto');
    const chartCanvas = document.getElementById('investimentoChart');
    let meuGrafico = null;

    // Variável para controlar qual slide está sendo exibido
    let currentSlide = 0;


    // --- PARTE 2: FUNÇÕES PARA CONTROLAR OS SLIDES ---

    function showSlide(slideIndex) {
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        slides[slideIndex].classList.add('active');

        prevBtn.disabled = (slideIndex === 0);

        if (slideIndex === slides.length - 1) {
            nextBtn.style.display = 'none';
            finishBtn.style.display = 'inline-block';
        } else {
            nextBtn.style.display = 'inline-block';
            finishBtn.style.display = 'none';
        }
    }

    nextBtn.addEventListener('click', () => {
        if (currentSlide === 0) {
            const nomeUsuario = document.getElementById('nome').value;
            if (nomeUsuario.trim() === '') {
                alert('Por favor, digite seu nome para continuar.');
                return;
            }
        }
        currentSlide++;
        showSlide(currentSlide);
    });

    prevBtn.addEventListener('click', () => {
        currentSlide--;
        showSlide(currentSlide);
    });
    
    // Inicia o questionário mostrando o primeiro slide
    showSlide(currentSlide);


    // --- PARTE 3: O QUE ACONTECE AO CLICAR EM "VER RELATÓRIO" ---
    
    finishBtn.addEventListener('click', () => {
        const nomeUsuario = document.getElementById('nome').value;
        const inputRisco = document.querySelector('input[name="risco"]:checked');

        if (!inputRisco) {
            alert('Por favor, selecione uma opção de risco.');
            return;
        }
        const perfilRisco = inputRisco.value;
        
        // Esconde o questionário para mostrar apenas o relatório
        document.getElementById('questionario-section').style.display = 'none';

        resultadoTexto.innerHTML = `
            <p>Olá, <span>${nomeUsuario}</span>!</p>
            <p>Seu perfil de investidor é: <span>${perfilRisco}</span>.</p>
            <p>Veja abaixo um gráfico com a cotação de alguns ativos para sua análise.</p>
        `;

        relatorioSection.style.display = 'block';

        const apiUrl = 'https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL';
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (meuGrafico) {
                    meuGrafico.destroy();
                }
                const ctx = chartCanvas.getContext('2d');
                meuGrafico = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Dólar', 'Euro', 'Bitcoin'],
                        datasets: [{
                            label: 'Valor Atual em R$',
                            data: [
                                parseFloat(data.USDBRL.bid),
                                parseFloat(data.EURBRL.bid),
                                parseFloat(data.BTCBRL.bid) * 1000
                            ],
                            backgroundColor: ['#007bff', '#f0ad4e', '#5cb85c']
                        }]
                    }
                });
            })
            .catch(error => {
                console.error("Erro ao buscar dados para o gráfico:", error);
                resultadoTexto.innerHTML += "<p>Não foi possível carregar o gráfico.</p>";
            });

        relatorioSection.scrollIntoView({ behavior: 'smooth' });
    });

    // --- PARTE 4: NAVEGAÇÃO ENTRE SEÇÕES ---
    
    // Pega todas as seções principais da página
    const todasAsSecoes = {
        simulador: document.getElementById('questionario-section'),
        relatorio: document.getElementById('relatorio-section'),
        dados: document.getElementById('dados-economicos-section'),
        investimentos: document.getElementById('investimentos-section')
    };

    // Pega os links da navegação (com os IDs corretos)
    const navLinks = {
        simulador: document.getElementById('link-simulador'),
        dados: document.getElementById('link-dados'),
        investimentos: document.getElementById('link-investimentos')
    };

    // Função para esconder todas as seções
    function esconderTodasAsSecoes() {
        for (let key in todasAsSecoes) {
            if (todasAsSecoes[key]) {
                todasAsSecoes[key].style.display = 'none';
            }
        }
    }

    // Adiciona evento para o link "Simulador"
    navLinks.simulador.addEventListener('click', (e) => {
        e.preventDefault();
        esconderTodasAsSecoes();
        // Mostra a seção do questionário e reseta para o primeiro slide
        currentSlide = 0;
        showSlide(currentSlide);
        todasAsSecoes.simulador.style.display = 'block';
    });

    // Adiciona evento para o link "Dados Econômicos"
    navLinks.dados.addEventListener('click', (e) => {
        e.preventDefault();
        esconderTodasAsSecoes();
        todasAsSecoes.dados.style.display = 'block';
        criarTabelaDadosEconomicos(); // Chama a função para criar a tabela
    });

    // Adiciona evento para o link "Investimentos"
    navLinks.investimentos.addEventListener('click', (e) => {
        e.preventDefault();
        esconderTodasAsSecoes();
        todasAsSecoes.investimentos.style.display = 'block';
        criarTabelaInvestimentos(); // Chama a função para criar a tabela
    });


    // --- PARTE 5: FUNÇÕES PARA CONSTRUIR AS TABELAS ---

    function criarTabelaDadosEconomicos() {
        const container = document.getElementById('tabela-dados-container');
        container.innerHTML = '<p>Carregando dados da API...</p>';

        const apiUrl = 'https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL,GBP-BRL,CAD-BRL';

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                let tabelaHTML = `
                    <table class="styled-table">
                        <thead>
                            <tr>
                                <th>Ativo</th>
                                <th>Nome</th>
                                <th>Valor Atual (R$)</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                for (const key in data) {
                    let valor = parseFloat(data[key].bid);
                    if (key === 'BTCBRL') {
                        valor *= 1000;
                    }
                    tabelaHTML += `
                        <tr>
                            <td>${data[key].code}</td>
                            <td>${data[key].name}</td>
                            <td>${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        </tr>
                    `;
                }
                tabelaHTML += '</tbody></table>';
                container.innerHTML = tabelaHTML;
            })
            .catch(error => {
                console.error("Erro ao buscar dados para a tabela:", error);
                container.innerHTML = '<p style="color: red;">Falha ao carregar os dados. Tente novamente mais tarde.</p>';
            });
    }

    function criarTabelaInvestimentos() {
        const container = document.getElementById('tabela-investimentos-container');
        
        const investimentos = [
            { nome: 'Renda Fixa (Tesouro Selic)', risco: 'Baixo', descricao: 'Considerado o investimento mais seguro do país, seu rendimento acompanha a taxa básica de juros (Selic).' },
            { nome: 'Fundos Imobiliários (FIIs)', risco: 'Médio', descricao: 'Permite investir em grandes empreendimentos imobiliários e receber aluguéis mensais, com cotas negociadas na bolsa.' },
            { nome: 'Ações (Ibovespa)', risco: 'Alto', descricao: 'Compra de pequenas partes de grandes empresas. Potencial de alto retorno, mas com maior volatilidade e risco.' },
            { nome: 'Criptomoedas (Bitcoin, Ethereum)', risco: 'Muito Alto', descricao: 'Ativos digitais descentralizados. Oferecem um potencial de valorização expressivo, mas com risco extremamente elevado.' }
        ];

        let tabelaHTML = `
            <table class="styled-table">
                <thead>
                    <tr>
                        <th>Tipo de Investimento</th>
                        <th>Nível de Risco</th>
                        <th>Descrição</th>
                    </tr>
                </thead>
                <tbody>
        `;
        investimentos.forEach(inv => {
            tabelaHTML += `
                <tr>
                    <td>${inv.nome}</td>
                    <td>${inv.risco}</td>
                    <td>${inv.descricao}</td>
                </tr>
            `;
        });
        tabelaHTML += '</tbody></table>';
        container.innerHTML = tabelaHTML;
    }});