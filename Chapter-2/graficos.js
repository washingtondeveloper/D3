function grafico(parametros) {
  var svg = d3.select(parametros.seletor)
              .attr('width', parametros.largura)
              .attr('height', parametros.altura);

  var margem = {
    esquerda: 20,
    direita:  20,
    superior: 20,
    inferior: 20
  };

  var larguraPlotagem = parametros.largura - margem.esquerda - margem.direita;
  var alturaPlotagem = parametros.altura - margem.superior - margem.inferior;

  var plotagem = svg.append('g')
                    .attr('id', 'plotagem')
                    .attr('transform', 'translate('+margem.esquerda+','+margem.superior+')');
  plotagem.attr('width', larguraPlotagem)
          .attr('height', alturaPlotagem);

  var x = d3.scaleLinear().domain([0,parametros.dados.length]).range([0,larguraPlotagem]);
  var y = d3.scaleLinear().domain([0,d3.max(parametros.dados)]).range([alturaPlotagem,0]);

  plotagem.selectAll('.barra')
    .data(parametros.dados)
    .enter()
      .append('rect')
      .classed('barra', true)
      .attr('x', (d,i) => x(i))
      .attr('y', d => y(d) )
      .attr('width', x(1)*0.9)
      .attr('height', d => alturaPlotagem-y(d));

  plotagem.selectAll('.rotulo')
    .data(parametros.dados)
    .enter()
      .append('text')
      .classed('rotulo', true)
      .text(d => d)
      .attr('x', (d,i) => x(i))
      .attr('dx', d => x(1)*0.9*0.5)
      .attr('y', d => y(d))
      .attr('dy', -5);
}
