"use client";

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Scatterplot = ({ title, data }) => {
    const svgRef = useRef(null);

    // console.log(title, data);
    useEffect(() => {
        if (!data) return;

        const width = 1200; 
        const height = 800; 
        const margin = { 
            top: 60,
            right: 200,  
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
            .style("font-size", "20px")  // Increased font size
            .style("font-weight", "bold")
            .text(title);

        // chart container
        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        // split label
        const processedData = data.map(d => ({
            age: d.label.split(': ').pop(), // Gets age range ie:"15-24 years")
            deaths: d.numDeaths,
            // demographic = "Male: White"
            demographic: d.label.split(': ').slice(0, 2).join(': '),
            category: d.label.includes("White") ? "White" :
                     d.label.includes("Black") ? "Black" :
                     d.label.includes("American Indian") ? "American Indian" :
                     "Asian or Pacific Islander",
            sex: d.label.includes("Female") ? "Female" : "Male"
        }));

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


        const maleColors = {
            "White": "#0047AB",         // Blue
            "Black": "#4B0082",         // Indigo
            "American Indian": "#006400", // Dark Green
            "Asian or Pacific Islander": "#483D8B" // Dark Blue
        };

        const femaleColors = {
            "White": "#FF0000",         // Bright Red
            "Black": "#FF4500",         // Orange 
            "American Indian": "#FF8C00", // Dark Orange
            "Asian or Pacific Islander": "#FFD700" // Gold
        };

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

        // legend
        const legend = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 12)
            .attr("text-anchor", "start")
            .selectAll("g")
            .data([...new Set(processedData.map(d => d.demographic))])
            .enter()
            .append("g")
            .attr("transform", (d, i) => `translate(${width - margin.right + 20},${margin.top + i * 30})`);

        legend.append("circle")
            .attr("r", 8)
            .attr("fill", d => {
                const isMale = d.includes("Male:");
                const colors = isMale ? maleColors : femaleColors;
                const category = d.includes("White") ? "White" :
                               d.includes("Black") ? "Black" :
                               d.includes("American Indian") ? "American Indian" :
                               "Asian or Pacific Islander";
                return colors[category];
            })
            .attr("opacity", 0.7)
            .attr("stroke", "white")
            .attr("stroke-width", 1);

        legend.append("foreignObject")
            .attr("x", 24)
            .attr("y", -8)
            .attr("width", margin.right - 40)
            .attr("height", 30)
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
    )
}

export default Scatterplot
