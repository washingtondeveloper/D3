function grafico(parametros) {
    var svg = d3.select(parametros.seletor)
                .attr('width', parametros.largura)
                .attr('height', parametros.altura);

    var margem = {
      esquerda: 70,
      direita:  20,
      superior: 40,
      inferior: 100
    };

    var larguraPlotagem = parametros.largura - margem.esquerda - margem.direita;
    var alturaPlotagem = parametros.altura - margem.superior - margem.inferior;

    var plotagem = svg.append('g')
                      .attr('id', 'plotagem')
                      .attr('transform', 'translate('+margem.esquerda+','+margem.superior+')');
    plotagem.attr('width', larguraPlotagem)
            .attr('height', alturaPlotagem);

    var x = d3.scaleBand()
              .domain(parametros.dados.map(d=>d.chave))
              .range([0,larguraPlotagem])
              .padding(0.1);
    var y = d3.scaleLinear()
              .domain([0,d3.max(parametros.dados.map(d=>d.valor))])
              .range([alturaPlotagem,0]);
    var cores = d3.scaleOrdinal()
                  .domain(parametros.dados.map(d=>d.chave))
                  .range(['#8c510a', '#d8b365', '#f6e8c3', '#f5f5f5', '#c7eae5', '#5ab4ac', '#01665e']);

    var eixoX = d3.axisBottom(x);
    plotagem.append('g')
            .attr('transform', 'translate(0,'+alturaPlotagem+')')
            .attr('id', 'eixoX')
            .call(eixoX);

    var eixoY = d3.axisLeft(y);
    plotagem.append('g')
            .attr('id', 'eixoY')
            .call(eixoY);

    plotagem.selectAll('.barra')
      .data(parametros.dados)
      .enter()
        .append('rect')
        .classed('barra', true)
        .attr('x', d => x(d.chave))
        .attr('y', d => y(d.valor) )
        .attr('width', x.bandwidth())
        .attr('height', d => alturaPlotagem-y(d.valor))
        .attr('fill', (d,i) => cores(i));

    plotagem.selectAll('.rotulo')
      .data(parametros.dados)
      .enter()
        .append('text')
        .classed('rotulo', true)
        .text(d => d.valor)
        .attr('x', d => x(d.chave))
        .attr('dx', d => x.bandwidth()*0.5)
        .attr('y', d => y(d.valor))
        .attr('dy', -5);

    plotagem.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .style('text-anchor', 'middle')
            .attr('transform', 'translate(-40,'+alturaPlotagem/2+') rotate(-90)')
            .text(parametros.tituloY);

    plotagem.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .style('text-anchor', 'middle')
            .attr('transform', 'translate('+larguraPlotagem/2+','+(alturaPlotagem+80)+')')
            .text(parametros.tituloX);
}
