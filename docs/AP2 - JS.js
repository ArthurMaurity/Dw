// Espera a página HTML carregar completamente antes de executar qualquer código.
// Isso evita erros de "elemento não encontrado".
document.addEventListener('DOMContentLoaded', () => {

    // --- PARTE 1: PEGAR OS ELEMENTOS DO HTML ---
    // Guarda em variáveis os elementos com os quais o script vai interagir.
    
    // Elementos do Questionário
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const finishBtn = document.getElementById('finish-btn');

    // Elementos do Relatório
    const relatorioSection = document.getElementById('relatorio-section');
    const resultadoTexto = document.getElementById('resultado-texto');
    const chartCanvas = document.getElementById('investimentoChart');
    let meuGrafico = null; // Variável para guardar o gráfico e poder destruí-lo depois.

    // Variável para controlar qual slide está sendo exibido.
    let currentSlide = 0;


    // --- PARTE 2: FUNÇÕES PARA CONTROLAR OS SLIDES ---

    // Função que mostra o slide correto e ajusta os botões.
    function showSlide(slideIndex) {
        slides.forEach(slide => slide.classList.remove('active')); // Esconde todos os slides.
        slides[slideIndex].classList.add('active'); // Mostra apenas o slide correto.

        // Desabilita o botão "Anterior" se estiver no primeiro slide.
        prevBtn.disabled = (slideIndex === 0);

        // Mostra o botão "Ver Simulação" apenas no último slide.
        nextBtn.style.display = slideIndex === slides.length - 1 ? 'none' : 'inline-block';
        finishBtn.style.display = slideIndex === slides.length - 1 ? 'inline-block' : 'none';
    }

    // Ação do botão "Próximo".
    nextBtn.addEventListener('click', () => {
        // Validação simples para cada passo
        const currentInput = slides[currentSlide].querySelector('input, select');
        if (currentInput && currentInput.value.trim() === '') {
            alert('Por favor, preencha o campo para continuar.');
            return;
        }
        currentSlide++; // Avança para o próximo slide.
        showSlide(currentSlide);
    });

    // Ação do botão "Anterior".
    prevBtn.addEventListener('click', () => {
        currentSlide--; // Volta para o slide anterior.
        showSlide(currentSlide);
    });

    // Inicia o questionário mostrando o primeiro slide (índice 0).
    showSlide(currentSlide);


    // --- PARTE 3: LÓGICA DA SIMULAÇÃO FINAL ---
    
    // Ação do botão "Ver Simulação".
    finishBtn.addEventListener('click', () => {
        // 1. Coleta de TODOS os dados do formulário.
        const nomeUsuario = document.getElementById('nome').value;
        const capitalInicial = parseFloat(document.getElementById('capital').value);
        const tempoAnos = parseInt(document.getElementById('tempo').value);
        const objetivoInput = document.querySelector('input[name="objetivo"]:checked');
        const perfilRiscoInput = document.querySelector('input[name="risco"]:checked');

        // 2. Validação para garantir que todos os campos da etapa 2 foram preenchidos.
        if (isNaN(capitalInicial) || !tempoAnos || !objetivoInput || !perfilRiscoInput) {
            alert('Por favor, preencha todos os campos da Etapa 2.');
            return; // Para a execução se algo estiver faltando.
        }
        const objetivo = objetivoInput.value;
        const perfilRisco = perfilRiscoInput.value;

        // 3. Chama a função de cálculo para obter os resultados da projeção.
        const projecoes = calcularProjecao(perfilRisco, capitalInicial, 0, tempoAnos); // Aporte mensal é 0 por enquanto.
        const valorFinal = projecoes.valorFinal;
        const dadosGrafico = projecoes.dadosGrafico;

        // 4. Monta o texto do relatório e o exibe na tela.
        document.getElementById('questionario-section').style.display = 'none';
        resultadoTexto.innerHTML = `
            <p>Olá, <span>${nomeUsuario}</span>!</p>
            <p>Com um perfil <span>${perfilRisco}</span> e objetivo de <span>${objetivo}</span>, investindo por <span>${tempoAnos} anos</span>, sua projeção é de:</p>
            <h2>${valorFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>
            <p>Veja a evolução do seu patrimônio no gráfico abaixo.</p>
        `;
        relatorioSection.style.display = 'block';

        // 5. Chama a função para criar o gráfico de projeção com os dados calculados.
        criarGraficoProjecao(dadosGrafico, tempoAnos);
        relatorioSection.scrollIntoView({ behavior: 'smooth' }); // Rola a página para mostrar o resultado.
    });
    
    // --- PARTE 4: FUNÇÕES DE CÁLCULO E GRÁFICO ---

    // Função que calcula a projeção de juros compostos.
    function calcularProjecao(perfil, inicial, mensal, anos) {
        // Define taxas de juros anuais hipotéticas baseadas no perfil de risco.
        const taxas = { Conservador: 0.08, Moderado: 0.10, Arrojado: 0.13 };
        const taxaAnual = taxas[perfil];
        const taxaMensal = Math.pow(1 + taxaAnual, 1 / 12) - 1; // Converte a taxa anual para mensal.
        
        let patrimoniosAnuais = [];
        let total = inicial;
        
        // Simula o crescimento do dinheiro mês a mês.
        for (let mes = 1; mes <= anos * 12; mes++) {
            total *= (1 + taxaMensal); // Aplica os juros do mês.
            if (mensal > 0) {
                total += mensal; // Adiciona o aporte mensal, se houver.
            }
            // Ao final de cada ano (a cada 12 meses), salva o valor total para o gráfico.
            if (mes % 12 === 0) {
                patrimoniosAnuais.push(total);
            }
        }
        
        // Retorna o valor final e um array com os valores anuais para o gráfico.
        return {
            valorFinal: total,
            dadosGrafico: [inicial, ...patrimoniosAnuais]
        };
    }
    
    // Função que cria o gráfico de linha da projeção.
    function criarGraficoProjecao(dados, anos) {
        if (meuGrafico) {
            meuGrafico.destroy(); // Destrói o gráfico anterior para não haver sobreposição.
        }
        const ctx = chartCanvas.getContext('2d');
        // Cria os rótulos do eixo X (ex: "Ano 0", "Ano 1", ...).
        const labelsAnos = Array.from({ length: anos + 1 }, (_, i) => `Ano ${i}`);
        
        meuGrafico = new Chart(ctx, {
            type: 'line', // Define o tipo do gráfico como linha.
            data: {
                labels: labelsAnos,
                datasets: [{
                    label: 'Crescimento do Patrimônio',
                    data: dados, // Usa os dados calculados.
                    borderColor: 'var(--primary-color)',
                    backgroundColor: 'rgba(0, 51, 102, 0.1)',
                    fill: true, // Preenche a área abaixo da linha.
                    tension: 0.1 // Deixa a linha levemente curvada.
                }]
            }
        });
    }

    // --- PARTE 5: NAVEGAÇÃO ENTRE SEÇÕES E TABELAS ADICIONAIS ---
    
    // Pega todas as seções principais da página.
    const todasAsSecoes = {
        simulador: document.getElementById('questionario-section'),
        relatorio: document.getElementById('relatorio-section'),
        dados: document.getElementById('dados-economicos-section'),
        investimentos: document.getElementById('investimentos-section')
    };

    // Pega os links da navegação.
    const navLinks = {
        simulador: document.getElementById('link-simulador'),
        dados: document.getElementById('link-dados'),
        investimentos: document.getElementById('link-investimentos')
    };

    // Função para esconder todas as seções.
    function esconderTodasAsSecoes() {
        for (let key in todasAsSecoes) {
            if (todasAsSecoes[key]) {
                todasAsSecoes[key].style.display = 'none';
            }
        }
    }

    // Adiciona o que acontece quando cada link da navegação é clicado.
    navLinks.simulador.addEventListener('click', (e) => {
        e.preventDefault(); // Impede a página de recarregar.
        esconderTodasAsSecoes();
        currentSlide = 0; // Reseta o questionário para o início.
        showSlide(currentSlide);
        todasAsSecoes.simulador.style.display = 'block';
    });

    navLinks.dados.addEventListener('click', (e) => {
        e.preventDefault();
        esconderTodasAsSecoes();
        todasAsSecoes.dados.style.display = 'block';
        criarTabelaDadosEconomicos(); // Chama a função para criar a tabela.
    });

    navLinks.investimentos.addEventListener('click', (e) => {
        e.preventDefault();
        esconderTodasAsSecoes();
        todasAsSecoes.investimentos.style.display = 'block';
        criarTabelaInvestimentos(); // Chama a função para criar a tabela.
    });

    // Função que busca dados na API e cria a tabela de Dados Econômicos.
    function criarTabelaDadosEconomicos() {
        const container = document.getElementById('tabela-dados-container');
        container.innerHTML = '<p>Carregando dados da API...</p>';
        const apiUrl = 'https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL,GBP-BRL,CAD-BRL';
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                let bodyTabela = '';
                for (const key in data) {
                    let valor = parseFloat(data[key].bid);
                    if (key === 'BTCBRL') {
                        valor *= 1000;
                    }
                    bodyTabela += `
                        <tr>
                            <td>${data[key].code}</td>
                            <td>${data[key].name}</td>
                            <td>${valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        </tr>
                    `;
                }
                container.innerHTML = `<table class="styled-table"><thead><tr><th>Ativo</th><th>Nome</th><th>Valor Atual (R$)</th></tr></thead><tbody>${bodyTabela}</tbody></table>`;
            })
            .catch(error => {
                console.error("Erro ao buscar dados para a tabela:", error);
                container.innerHTML = '<p style="color: red;">Falha ao carregar os dados.</p>';
            });
    }

    // Função que cria uma tabela estática para a seção de Investimentos.
    function criarTabelaInvestimentos() {
        const container = document.getElementById('tabela-investimentos-container');
        const investimentos = [
            { nome: 'Renda Fixa (Tesouro Selic)', risco: 'Baixo', descricao: 'Seu rendimento acompanha a taxa básica de juros (Selic).' },
            { nome: 'Fundos Imobiliários (FIIs)', risco: 'Médio', descricao: 'Permite investir em imóveis e receber aluguéis mensais.' },
            { nome: 'Ações (Ibovespa)', risco: 'Alto', descricao: 'Compra de partes de grandes empresas, com potencial de alto retorno.' },
            { nome: 'Criptomoedas (Bitcoin)', risco: 'Muito Alto', descricao: 'Ativos digitais com potencial de valorização expressivo e risco elevado.' }
        ];
        let bodyTabela = '';
        investimentos.forEach(inv => {
            bodyTabela += `
                <tr>
                    <td>${inv.nome}</td>
                    <td>${inv.risco}</td>
                    <td>${inv.descricao}</td>
                </tr>
            `;
        });
        container.innerHTML = `<table class="styled-table"><thead><tr><th>Tipo de Investimento</th><th>Nível de Risco</th><th>Descrição</th></tr></thead><tbody>${bodyTabela}</tbody></table>`;
    }
});