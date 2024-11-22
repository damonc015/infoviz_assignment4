"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const StackedLinechart = ({ title, data }) => {
    const svgRef = useRef(null);
    const [selectedCategory, setSelectedCategory] = useState('Total');
    
    const categories = [
        'Total',
        'Sex',
        'Sex and age',
        'Sex and race',
        'Sex and race and Hispanic origin',
        'Sex, age and race',
        'Sex, age and race and Hispanic origin'
    ];

    useEffect(() => {
        if (!data) return;

        d3.select(svgRef.current).selectAll("*").remove();

        const width = 1200;
        const height = 800;
        const margin = { top: 60, right: 300, bottom: 80, left: 80 }; 
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const processedData = [];
        data.forEach(yearObj => {
            const year = Object.keys(yearObj)[0];
            const yearData = yearObj[year][selectedCategory];
            if (yearData) {
                yearData.forEach(item => {
                    processedData.push({
                        year: parseInt(year),
                        label: item.label,
                        value: item.numDeaths
                    });
                });
            }
        });


        if (processedData.length === 0) {
            console.log("No data found for category:", selectedCategory);
            return;
        }

        // separate data by label
        const groupedData = d3.group(processedData, d => d.label);
        
        const lineData = Array.from(groupedData, ([key, values]) => ({
            label: key,
            values: values.sort((a, b) => a.year - b.year)
        }));

        console.log("Line Data:", lineData);

        // axes scales
        const xScale = d3.scaleLinear()
            .domain(d3.extent(processedData, d => d.year))
            .range([0, innerWidth]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(processedData, d => d.value)])
            .range([innerHeight, 0]);

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        // title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', margin.top / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '20px')
            .style('font-weight', 'bold')
            .text(title);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // make lines
        const line = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.value))
            .curve(d3.curveMonotoneX); // smoothes lines

        lineData.forEach((series, i) => {
            const path = g.append('path')
                .datum(series.values)
                .attr('fill', 'none')
                .attr('stroke', colorScale(i))
                .attr('stroke-width', 2);

            const length = path.node().getTotalLength();
            path
                .attr("stroke-dasharray", `${length} ${length}`)
                .attr("stroke-dashoffset", length)
                .attr("d", line)
                .transition()
                .duration(1000)
                .attr("stroke-dashoffset", 0);
        });

        // add axes
        const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
        const yAxis = d3.axisLeft(yScale);

        g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(xAxis)
            .append('text')
            .attr('x', innerWidth / 2)
            .attr('y', 40)
            .attr('fill', 'black')
            .text('Year');

        g.append('g')
            .call(yAxis)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -60)
            .attr('x', -innerHeight / 2)
            .attr('fill', 'black')
            .attr('text-anchor', 'middle')
            .text('Number of Deaths');

        const legend = svg.append('g')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 10)
            .selectAll('g')
            .data(lineData)
            .enter()
            .append('g')
            .attr('transform', (d, i) => `translate(${width - margin.right + 10},${margin.top + i * 25})`);

        legend.append('line')
            .attr('x1', 0)
            .attr('x2', 19)
            .attr('stroke', (d, i) => colorScale(i))
            .attr('stroke-width', 2);

        legend.append('foreignObject')
            .attr('x', 24)
            .attr('y', -7)
            .attr('width', margin.right - 30)
            .attr('height', 30)
            .append('xhtml:div')
            .style('font-size', '10px')
            .style('line-height', '1.2')
            .text(d => d.label);

    }, [data, selectedCategory]); 

    return (
        <div className="lineContainer">
            <div className="chart-buttons">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => {
                            console.log("Clicking category:", category);
                            setSelectedCategory(category);
                        }}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: selectedCategory === category ? '#4a90e2' : '#f0f0f0',
                            color: selectedCategory === category ? 'white' : 'black',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {category}
                    </button>
                ))}
            </div>
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default StackedLinechart;
