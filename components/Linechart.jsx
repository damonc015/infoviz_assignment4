"use client";

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Linechart = ({ data }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

//   console.log(data);
  useEffect(() => {
    if (!data || !data.length) return;

    d3.select(svgRef.current).selectAll("*").remove();

    // dimensions
    const margin = { top: 70, right: 50, bottom: 50, left: 80 };
    const width = Math.min(window.innerWidth * 0.8, 1200) - margin.left - margin.right;
    const height = window.innerHeight * 0.8 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('max-width', '100%')
      .style('max-height', '100%')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '24px')
      .style('font-weight', 'bold')
      .text('Suicide Rates per 100,000 Population Age Adjusted 1980-2018');

    // x-axis
    svg.append('text')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 10)
    .style('text-anchor', 'middle')
    .style('font-size', '20px')
    .text('Year');

    // y-axis
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -(height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '20px')
      .text('Deaths per 100,000');

    // axes range
    const xScale = d3.scalePoint()
      .domain(data.map(d => d.year))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([10, 15])
      .nice()
      .range([height, 0]);

    // Add axes
    svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale)
      .tickValues(data.map(d => d.year)
        .filter((year, i) => i % 2 === 0))
    );

    svg.append('g')
      .call(d3.axisLeft(yScale));

    // create line
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.total));

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#4682b4')
      .attr('stroke-width', 2)
      .attr('d', line);

    // points on line
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(d.total))
      .attr('r', 5)
      .attr('fill', '#4682b4');
  }, [data]);

  return (
    <div className='lineContainer' ref={containerRef}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Linechart;
