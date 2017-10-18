function GraficoDeLinhas(parametros) {

  // Seleciona o elemento SVG
  var svg = d3.select(parametros.seletor)
                .attr('width', parametros.largura)
                .attr('height', parametros.altura);

  // Define as margens da área de plotagem e calcula suas largura e altura
  var margem = {
    esquerda: 70,
    direita: 50,
    superior: 20,
    inferior: 120
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
  this.x = d3.scaleLinear()
             .range([0,this.larguraPlotagem]);
  this.y = d3.scaleLinear()
             .range([this.alturaPlotagem,0]);
  this.cores = d3.scaleOrdinal()
                 .range(d3.schemeCategory10);

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
                     'translate('+this.larguraPlotagem/2+','+(this.alturaPlotagem+60)+')')
               .text(parametros.tituloX)
               .classed('tituloeixo', true);

  // Cria o gerador de linhas
  this.converteData = d3.timeParse('%Y-%m-%d');
  this.linha = d3.line()
                .x(d => this.x(this.converteData(d.data)))
                .y(d => this.y(d.valor))
                .curve(d3.curveCardinal);

  // Controle do mouse
  this.linhaMouse = this.plotagem.append('g')
                  .attr('class', 'eventosmouse');
  this.linhaMouse.append('path')  // linha vertical
                 .attr('class', 'linhamouse')
                 .style('stroke', 'black')
                 .style('stroke-width', '1px')
                 .style('opacity', '0');
  this.linhaMouse.append('rect')
                 .attr('width', this.larguraPlotagem)
                 .attr('height', this.alturaPlotagem)
                 .attr('fill', 'none')
                 .attr('pointer-events', 'all');

  // -------------------------------
  // Função para atualizar o gráfico
  // -------------------------------
  this.atualize = function(dados, periodo) {

    // Cria uma referência não ambigua para o objeto do gráfico
    var self = this;
 
    // Atualiza as escalas, de acordo com os novos dados
    self.x.domain(periodo.map(d => self.converteData(d)));
    self.y.domain([0,d3.max(dados.map(i => d3.max(i.valores.map(d => d.valor))))]);

    // Cria os elementos SVG dos eixos e das linhas de grade
    var inicio = self.converteData(periodo[0]);
    var fim = self.converteData(periodo[1]);
    self.eixoX.tickValues(d3.timeDay.every(3).range(inicio, ++fim))
              .tickFormat(d3.timeFormat("%d/%m"));
    self.plotagem.select('#eixoX')
                 .call(self.eixoX)

    self.eixoY.ticks(8);
    self.plotagem.select('#eixoY')
                 .call(self.eixoY);

    self.grade.ticks(8);
    self.plotagem.select('#grade')
                 .call(self.grade);

    // Cria as séries de dados
    self.plotagem.selectAll('.serie').remove(); // remove todas as séries
    var series = self.plotagem.selectAll('.serie')
                              .data(dados);
    var s = series.enter()
                  .append('g')
                  .classed('serie', true);

    s.append('path')              
        .datum((d,i) => dados[i].valores)
        .classed('linha', true)
        .style('stroke', (d,i) => self.cores(i))
        .attr("d", self.linha);

    s.append('rect')
     .classed('caixalegenda', true)
     .attr('x', 0)
     .attr('y', (d,i) => self.alturaPlotagem+65+15*i)
     .attr('width', 12)
     .attr('height', 12)
     .attr('fill', (d,i) => self.cores(i));

    s.append('text')
     .classed('textolegenda', true)
     .text( d => d.chave)
     .attr('x', 16)
     .attr('y', (d,i) => self.alturaPlotagem+75+15*i);

    // Eventos do mouse
    d3.selectAll('.pontoporlinha').remove();
    var pontoPorLinha = self.linhaMouse.selectAll('.pontoporlinha')
                          .data(dados)
                          .enter()
                          .append('g')
                          .classed('pontoporlinha', true);
                          
    pontoPorLinha.append('circle')
                 .attr('r', 4)
                 .style('stroke', (d,i)=>self.cores(i))
                 .style('fill', 'none')
                 .style('stroke-width', '2px')
                 .style('opacity', '0');
    
    pontoPorLinha.append('text')
                 .attr('transform', 'translate(10,3)');

    var linhas = document.getElementsByClassName('linha');

    self.linhaMouse.on('mouseout', function() {
            d3.select('.linhamouse')
              .style('opacity', '0');
            d3.selectAll('.pontoporlinha circle')
              .style('opacity', '0');
            d3.selectAll('.pontoporlinha text')
              .style('opacity', '0');
          })
          .on('mouseover', function() {
            d3.select('.linhamouse')
              .style('opacity', '1')
            d3.selectAll('.pontoporlinha circle')
              .style('opacity', '1');
            d3.selectAll('.pontoporlinha text')
              .style('opacity', '1');
          })
          .on('mousemove', function() {
            var mouse = d3.mouse(this);
            d3.select('.linhamouse')
              .attr('d', function() {
                return 'M '+mouse[0]+','+0
                    + ' L '+mouse[0]+','+(self.alturaPlotagem);
              });
            d3.selectAll('.pontoporlinha')
              .attr('transform', function(d,i) {
                var data = self.x.invert(mouse[0]),
                    bisect = d3.bisector(d => self.converteData(d.data)).right;
                    idx = bisect(d.valores, data);
                var inicio = 0,
                    fim = linhas[i].getTotalLength(); //total de pixels na linha
                    alvo = null;

                // Busca binária na linha de pixels (dados) usando mouse.X
                while(true) {
                  alvo = Math.floor((inicio+fim)/2);
                  pos = linhas[i].getPointAtLength(alvo);
                  if((alvo===fim || alvo===inicio) && pos.x != mouse[0]) 
                    break;
                  if(pos.x > mouse[0])
                    fim = alvo;
                  else if(pos.x < mouse[0])
                    inicio = alvo;
                  else break;  // encontrou o pixel
                }
                d3.select(this).select('text')
                  .text(self.y.invert(pos.y).toFixed(1));
                return 'translate('+(mouse[0])+','+(pos.y)+')';
              });
          });
  }  // fim do método atualize() ----------------------------------

  // Assegura que o método de atualização, para a associação dos valores aos retângulos e
  // criação dos rótulos das barras, será chamado pelo menos uma vez
  this.atualize(parametros.dados, parametros.periodo);

}