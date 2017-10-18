function GraficoDeBarras(parametros) {

  // Seleciona o elemento SVG
  var svg = d3.select(parametros.seletor)
              .attr('width', parametros.largura)
              .attr('height', parametros.altura);

  // Define as margens da área de plotagem e calcula suas largura e altura
  var margem = {
    esquerda: 70,
    direita: 20,
    superior: 40,
    inferior: 100
  }
  this.larguraPlotagem = parametros.largura - margem.esquerda - margem.direita;
  this.alturaPlotagem = parametros.altura - margem.superior - margem.inferior;

  // Cria uma nova área de plotagem
  svg.select('#plotagem').remove(); // remove a área de plotagem atual se existir
  this.plotagem = svg.append('g')
                     .attr('id', 'plotagem')
                     .attr('width', this.larguraPlotagem)
                     .attr('height', this.alturaPlotagem)
                     .attr('transform',
                           'translate('+margem.esquerda+','+margem.superior+')');

  // Cria as escalas horizontal, vertical e de cores
  this.x = d3.scaleBand()
             .range([0,this.larguraPlotagem])
             .padding(0.1);
  this.y = d3.scaleLinear()
             .range([this.alturaPlotagem,0]);
  this.cores = d3.scaleOrdinal()
                 .range(d3.schemeCategory20);

  // Prepara as linhas de grade
  this.grade = d3.axisRight(this.y)
                .tickSize(this.larguraPlotagem)
                .tickFormat('');
  this.plotagem.append('g')
                .attr('id', 'grade');

  // Prepara os eixos X e Y
  this.eixoX = d3.axisBottom(this.x);
  this.plotagem.append('g')
                .attr('transform', 'translate(0,'+this.alturaPlotagem+')')
                .attr('id', 'eixoX');
  this.eixoY = d3.axisLeft(this.y);
  this.plotagem.append('g')
                .attr('id', 'eixoY');

  // Cria os títulos dos eixos
  this.plotagem.append('text')
               .attr('x', 0)
               .attr('y', 0)
               .style('text-anchor', 'middle')
               .attr('transform',
                     'translate(-40,'+this.alturaPlotagem/2+') rotate(-90)')
               .text(parametros.tituloY)
               .classed('tituloeixo', true);
  this.plotagem.append('text')
               .attr('x', 0)
               .attr('y', 0)
               .style('text-anchor', 'middle')
               .attr('transform',
                     'translate('+this.larguraPlotagem/2+','+(this.alturaPlotagem+80)+')')
               .text(parametros.tituloX)
               .classed('tituloeixo', true);

  // Armazena a função callback em uma propriedade
  this.callback = parametros.callback;

  // -------------------------------
  // Função para atualizar o gráfico
  // -------------------------------
  this.atualize = function(dados) {

    // Cria uma referência não ambigua para o objeto do gráfico
    var self = this;

    // Atualiza as escalas, de acordo com os novos dados
    self.x.domain(dados.map(d=>d.chave));
    self.y.domain([0,d3.max(dados.map(d=>d.valor))]);
    self.cores.domain(dados.map(d=>d.chave));

    // Cria os elementos SVG dos eixos e das linhas de grade
    self.plotagem.select('#eixoX')
                 .transition()
                 .duration(self.duracaoAnimacao)
                 .call(self.eixoX);
    self.plotagem.select('#eixoY')
                 .transition()
                 .duration(self.duracaoAnimacao)
                 .call(self.eixoY);
    self.plotagem.select('#grade')
                 .transition()
                 .duration(self.duracaoAnimacao)
                 .call(self.grade);

    // Ajusta a quantidade de retângulos aos dados, criando ou removendo
    // os retângulos necessários
    var retangulos = self.plotagem.selectAll('.barra')
                                  .data(dados);
    retangulos.enter()
              .append('rect')
              .on('mouseover', function(d) {
                d3.select(this).style('fill', 'black');
              })
              .on('mouseout', function(d) {
                d3.select(this).style('fill',self.cores(d.chave));
              })
              .on('click', function(d,i) {
                self.callback(d);
              })
              .classed('barra', true);
    retangulos.exit()
              .remove();
    // Formata os retângulos de acordo com os dados
    self.plotagem.selectAll('.barra')
                 .transition()
                 .duration(self.duracaoAnimacao)
                 .attr('x', d => self.x(d.chave))
                 .attr('y', d => self.y(d.valor) )
                 .attr('width', self.x.bandwidth())
                 .attr('height', d => self.alturaPlotagem-self.y(d.valor))
                 .attr('fill', d => self.cores(d.chave));

    // Ajusta a quantidade de rótulos aos dados, criando ou removendo
    // os rótulos necessários
    var rotulos = self.plotagem.selectAll('.rotulo')
                               .data(dados);
    rotulos.enter()
           .append('text')
           .classed('rotulo', true);
    rotulos.exit()
           .remove();
    // Formata os rótulos de acordo com os dados
    self.plotagem.selectAll('.rotulo')
                 .transition()
                 .duration(self.duracaoAnimacao)
                 .text(d => d.valor)
                 .attr('x', d => self.x(d.chave))
                 .attr('dx', d => self.x.bandwidth()*0.5)
                 .attr('y', d => self.y(d.valor))
                 .attr('dy', -5);

    // Define o tempo das animações para 500 milissegundos
    self.duracaoAnimacao = 500;
  }

  // Assegura que o método de atualização, para a associação dos valores aos retângulos e
  // criação dos rótulos das barras, será chamado pelo menos uma vez
  this.atualize(parametros.dados);

}
