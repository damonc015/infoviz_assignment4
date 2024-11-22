"use client";

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Barchart = ({ title, data }) => {
  const svgRef = useRef();

//   console.log(title, data);
  useEffect(() => {
    if (!data) return;

    const processedData = data.reduce((acc, curr) => {
      const gender = curr.label.includes('Male') ? 'Male' : 'Female';
      // get age range ie: "15-24 years"
      const ageRange = curr.label.split(': ')[1];
      
      if (!acc[ageRange]) {
        acc[ageRange] = {};
      }
      acc[ageRange][gender] = curr.numDeaths;
      return acc;
    }, {});

    const chartData = Object.entries(processedData).map(([ageRange, values]) => ({
      ageRange,
      Male: values.Male || 0,
      Female: values.Female || 0
    }));

    const margin = { top: 70, right: 150, bottom: 100, left: 60 };
    const width = Math.min(window.innerWidth * 0.8, 1200) - margin.left - margin.right;
    const height = window.innerHeight * 0.8 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('max-width', '100%')
      .style('max-height', '100%')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // title
    svg.append('foreignObject')
      .attr('x', width / 2 - 300)
      .attr('y', -margin.top + 10)
      .attr('width', 600)
      .attr('height', margin.top)
      .append('xhtml:div')
      .attr('class', 'chart-title')
      .style('font-size', '24px')
      .style('font-weight', 'bold')
      .style('text-align', 'center')
      .text(title);

    const x0 = d3.scaleBand()
      .domain(chartData.map(d => d.ageRange))
      .range([0, width])
      .padding(0.2);

    const genders = ['Male', 'Female'];

    const x1 = d3.scaleBand()
      .domain(genders)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    // y-axis scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => Math.max(d.Male, d.Female))])
      .range([height, 0])
      .nice();

    // colors
    const color = d3.scaleOrdinal()
      .domain(genders)
      .range(['#0066cc', '#cc0033']);

    // x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .selectAll('text')
      .style('text-anchor', 'end')
      .style('font-size', '14px')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    // x-axis label
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('Age Groups');

    // y-axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left)
      .attr('x', -(height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('Number of Deaths');

    // y-axis ticks
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', '14px');

    // bars
    svg.append('g')
      .selectAll('g')
      .data(chartData)
      .join('g')
      .attr('transform', d => `translate(${x0(d.ageRange)},0)`)
      .selectAll('rect')
      .data(d => genders.map(gender => ({gender, value: d[gender]})))
      .join('rect')
      .attr('x', d => x1(d.gender))
      .attr('y', d => y(d.value))
      .attr('width', x1.bandwidth())
      .attr('height', d => height - y(d.value))
      .attr('fill', d => color(d.gender));

    // legend
    const legend = svg.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', '14px')
      .attr('text-anchor', 'start')
      .selectAll('g')
      .data(genders)
      .join('g')
      .attr('transform', (d, i) => `translate(${width + 10},${i * 40})`);

    legend.append('rect')
      .attr('x', 0)
      .attr('width', 19)
      .attr('height', 19)
      .attr('fill', color);

    legend.append('foreignObject')
      .attr('x', 24)
      .attr('y', 0)
      .attr('width', 120)
      .attr('height', 40)
      .append('xhtml:div')
      .attr('class', 'chart-legend')
      .text(d => d);

  }, [data, title]);

  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Barchart;
