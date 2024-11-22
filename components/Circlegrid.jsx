"use client";

import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3';
import gsap from 'gsap';

const Circlegrid = () => {
    const containerRef = useRef();

    useEffect(() => {
        const container = d3.select(containerRef.current);
        const containerWidth = container.node().getBoundingClientRect().width;
        const containerHeight = container.node().getBoundingClientRect().height;

        const width = containerWidth * 0.8;
        const height = containerHeight * 0.8;
        const circleRadius = Math.min(width, height) * 0.025; 
        const padding = circleRadius * 2; 
        const cols = 10;  
        const rows = 10;   

        // Grid dimensions
        const gridWidth = cols * (circleRadius * 2 + padding);
        const gridHeight = rows * (circleRadius * 2 + padding);
        
        const marginLeft = (width - gridWidth) / 2;
        const marginTop = (height - gridHeight) / 2;

        container.selectAll("svg").remove();

        const svg = container
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('max-width', '100%')
            .style('max-height', '100%');

        // Create circles with opacity 0 initially
        const circles = svg.selectAll('circle')
            .data(d3.range(rows * cols))
            .enter()
            .append('circle')
            .attr('cx', (d) => (d % cols) * (circleRadius * 2 + padding) + circleRadius + padding + marginLeft)
            .attr('cy', (d) => Math.floor(d / cols) * (circleRadius * 2 + padding) + circleRadius + padding + marginTop)
            .attr('r', circleRadius)
            .style('fill', (d) => {
                if (d === 0) return '#2E86C1';  // First circle (blue)
                if (d === 1) return 'url(#half-blue)';  // Second circle (half blue)
                return '#D3D3D3';  // All other circles (gray)
            })
            .style('stroke', 'white')
            .style('opacity', 0);  // Start invisible

        // Create a linear gradient for the half-blue circle
        const gradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "half-blue")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");

        gradient.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", "#2E86C1");

        gradient.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", "#D3D3D3");

        // Animation sequence
        const tl = gsap.timeline();
        
        // Animate the title first
        tl.from('.circle-title', {
            opacity: 0,
            y: 30,
            duration: 1,
            ease: "power2.out"
        })
        // Then animate all circles together
        .to(circles.nodes(), {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out"
        });

    }, []);

    return (
        <div ref={containerRef} className='circleContainer'>
        </div>
    )
}

export default Circlegrid
