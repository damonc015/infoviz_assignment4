"use client";

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ScatterplotTwo = ({ title, data }) => {
    const svgRef = useRef(null);

    // console.log(title, data);
    useEffect(() => {
        if (!data) return;

        const width = 1200;
        const height = 800;
        const margin = { 
            top: 60,
            right: 300,  
            bottom: 80,
            left: 80
        };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .style("max-width", "100%")
            .style("height", "auto");

        // title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .text(title);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const maleColors = {
            "Not Hispanic or Latino: American Indian or Alaska Native": "#006400", // Dark Green
            "Not Hispanic or Latino: Asian or Pacific Islander": "#0047AB",        // Blue
            "Not Hispanic or Latino: White": "#4B0082",                           // Indigo
            "Not Hispanic or Latino: Black or African American": "#483D8B",       // Dark Blue
            "Hispanic or Latino: All races": "#000080"                            // Navy
        };

        const femaleColors = {
            "Not Hispanic or Latino: American Indian or Alaska Native": "#FF8C00", // Dark Orange
            "Not Hispanic or Latino: Asian or Pacific Islander": "#FF4500",        // Orange Red
            "Not Hispanic or Latino: White": "#FF0000",                           // Bright Red
            "Not Hispanic or Latino: Black or African American": "#FF69B4",       // Hot Pink
            "Hispanic or Latino: All races": "#FFD700"                            // Gold
        };

        // Process data with new categories
        const processedData = data.map(d => {
            const parts = d.label.split(': ');
            return {
                age: parts[parts.length - 1],
                deaths: d.numDeaths,
                demographic: d.label,
                sex: parts[0],
                ethnicity: parts[1],
                race: parts[2] || parts[1],
                category: `${parts[1]}: ${parts[2] || 'All races'}`
            };
        });

        const xScale = d3.scaleBand()
            .domain([...new Set(processedData.map(d => d.age))])
            .range([0, innerWidth])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(processedData, d => d.deaths)])
            .range([innerHeight, 0]);

        // x-axis
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)")
            .style("font-size", "12px");

        // y-axis
        g.append("g")
            .call(d3.axisLeft(yScale))
            .selectAll("text")
            .style("font-size", "12px");

        // x-axis label
        g.append("text")
            .attr("x", innerWidth / 2)
            .attr("y", innerHeight + margin.bottom - 10)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Age Groups");

        // y-axis label
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -innerHeight / 2)
            .attr("y", -margin.left + 10)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Deaths per 100,000 population");

        // data points
        g.selectAll("circle")
            .data(processedData)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.age) + xScale.bandwidth() / 2)
            .attr("cy", d => yScale(d.deaths))
            .attr("r", 8)
            .attr("fill", d => {
                const colors = d.sex === "Male" ? maleColors : femaleColors;
                return colors[d.category];
            })
            .attr("opacity", 0.7)
            .attr("stroke", "white")
            .attr("stroke-width", 1);

        const legend = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 12)
            .attr("text-anchor", "start")
            .selectAll("g")
            .data([...new Set(processedData.map(d => `${d.sex}: ${d.category}`))])
            .enter()
            .append("g")
            .attr("transform", (d, i) => `translate(${width - margin.right + 20},${margin.top + i * 40})`);

        legend.append("circle")
            .attr("r", 8)
            .attr("fill", d => {
                const isMale = d.startsWith("Male:");
                const colors = isMale ? maleColors : femaleColors;
                const category = d.split(": ").slice(1).join(": ");
                return colors[category];
            })
            .attr("opacity", 0.7)
            .attr("stroke", "white")
            .attr("stroke-width", 1);

        legend.append("foreignObject")
            .attr("x", 24)
            .attr("y", -8)
            .attr("width", margin.right - 40)
            .attr("height", 40)
            .append("xhtml:div")
            .style("font-size", "12px")
            .style("line-height", "1.2")
            .style("word-wrap", "break-word")
            .text(d => d);

    }, [data, title]);

    return (
        <div>
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default ScatterplotTwo;
