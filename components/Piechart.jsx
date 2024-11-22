"use client";

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Piechart = ({ title, data }) => {
    const svgRef = useRef();

    // console.log(title,data);

    useEffect(() => {   
        if (!data || !data.length) return;

        d3.select(svgRef.current).selectAll("*").remove();

        const container = d3.select(svgRef.current.parentNode);
        const containerWidth = container.node().getBoundingClientRect().width;
        const containerHeight = container.node().getBoundingClientRect().height;
        
        // Check if this is a dual piechart container
        const isDualPieChart = container.node().parentNode.querySelector('.piechartContainer + .piechartContainer');

        const width = Math.min(containerWidth * 0.8, containerHeight * 0.8);
        const height = width; 
        const radius = Math.min(width, height) / 2.5; 
        const legendWidth = width * 0.25;
        const totalWidth = width + legendWidth;
        const titlePadding = 80; 
        
        // Increase spacing for dual charts
        const legendSpacing = isDualPieChart ? 85 : 60;

        const svg = d3.select(svgRef.current)
            .attr('width', totalWidth)
            .attr('height', height)
            .style('max-width', '100%')
            .style('max-height', '100%');

        // title
        svg.append('foreignObject')
            .attr('x', totalWidth / 2 - 300) 
            .attr('y', 0)
            .attr('width', 600)
            .attr('height', 80) 
            .append('xhtml:div')
            .attr('class', 'chart-title')
            .style('font-size', '20px') 
            .style('font-weight', 'bold') 
            .text(title || 'Untitled');

        // pie chart container
        const pieGroup = svg.append('g')
            .attr('transform', `translate(${(totalWidth / 2 - legendWidth)},${(height / 2) + titlePadding})`);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const total = d3.sum(data, d => d.numDeaths);

        // pie chart
        const pie = d3.pie()
            .value(d => d.numDeaths);

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius - 40);

        const arcs = pieGroup.selectAll('.arc')
            .data(pie(data))
            .enter()
            .append('g')
            .attr('class', 'arc');

        // pie slices
        arcs.append('path')
            .attr('d', arc)
            .attr('fill', (d, i) => color(i))
            .attr('stroke', 'white')
            .style('stroke-width', '2px');

        // slice labels
        arcs.append('text')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .style('fill', 'white')
            .style('font-size', '12px')
            .text(d => {
                const percentage = ((d.data.numDeaths / total) * 100).toFixed(1);
                return `${percentage}%`;
            });

        // legend
        const legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${totalWidth - legendWidth - 20}, ${titlePadding})`);

        const legendItems = legend.selectAll('.legend-item')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => `translate(0, ${i * legendSpacing})`);

        legendItems.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', (d, i) => color(i));

        // Update legend items with much taller height for dual charts
        legendItems.append('foreignObject')
            .attr('x', 20)
            .attr('y', -5)
            .attr('width', legendWidth - 40)
            .attr('height', isDualPieChart ? 80 : 30)  // Increased from 40 to 80 for dual charts
            .append('xhtml:div')
            .attr('class', 'chart-legend')
            .style('font-size', isDualPieChart ? '11px' : '14px')
            .style('line-height', '1.2')
            .style('word-wrap', 'break-word')
            .style('height', isDualPieChart ? '80px' : '30px')  // Increased div height to match
            .text(d => d.label);

    }, [data]);

    return (
        <div className='piechartContainer'>
            <div className="tooltip" style={{
                position: 'absolute',
                opacity: 0,
                background: 'white',
                padding: '8px',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                pointerEvents: 'none'
            }}></div>
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default Piechart;
