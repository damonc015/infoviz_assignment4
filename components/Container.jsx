"use client";

import * as d3 from 'd3';
import { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Piechart from './Piechart'; 
import Circlegrid from './Circlegrid';
import Linechart from './Linechart';
import Barchart from './Barchart';
import Scatterplot from './Scatterplot';
import ScatterplotTwo from './ScatterplotTwo';
import StackedLinechart from './StackedLinechart';

const Container = () => {
    if (typeof window !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger, useGSAP);
    }

    // reset scroll on refresh
    useEffect(() => {
        window.onbeforeunload = function () {
            window.scrollTo(0, 0);
        };

        window.scrollTo(0, 0);

        return () => {
            window.onbeforeunload = null;
        };
    }, []);

    const [data, setData] = useState(null)
    const containerRef = useRef(null);

    const dataByTotalPerYear = useMemo(() => {
        if (!data) return null;
        return data.map(yearObj => ({
            year: Object.keys(yearObj)[0],
            total: yearObj[Object.keys(yearObj)[0]].Total[0].numDeaths
        }));
    }, [data]);

    const dataBySex = useMemo(() => {
        if (!data) return null;
        const year2018Data = data.find(yearObj => Object.keys(yearObj)[0] === "2018");
        return year2018Data ? year2018Data["2018"]["Sex"] || [] : [];
    }, [data]);

    const dataBySexAndRace = useMemo(() => {
        if (!data) return null;
        const year2018Data = data.find(yearObj => Object.keys(yearObj)[0] === "2018");
        return year2018Data ? year2018Data["2018"]["Sex and race"] || [] : [];
    }, [data]);

    const dataBySexRaceHispanic = useMemo(() => {
        if (!data) return null;
        const year2018Data = data.find(yearObj => Object.keys(yearObj)[0] === "2018");
        return year2018Data ? year2018Data["2018"]["Sex and race and Hispanic origin"] || [] : [];
    }, [data]);

    const dataBySexAndAge = useMemo(() => {
        if (!data) return null;
        const year2018Data = data.find(yearObj => Object.keys(yearObj)[0] === "2018");
        return year2018Data ? 
            year2018Data["2018"]["Sex and age"]?.filter(item => !item.label.includes("and over")) || [] : 
            [];
    }, [data]);

    const dataBySexAgeRace = useMemo(() => {
        if (!data) return null;
        const year2017Data = data.find(yearObj => Object.keys(yearObj)[0] === "2017");
        return year2017Data ? 
            year2017Data["2017"]["Sex, age and race"]?.filter(item => !item.label.includes("and over")) || [] : 
            [];
    }, [data]);

    const dataBySexAgeRaceHispanic = useMemo(() => {
        if (!data) return null;
        const year2017Data = data.find(yearObj => Object.keys(yearObj)[0] === "2017");
        return year2017Data ? 
            year2017Data["2017"]["Sex, age and race and Hispanic origin"]?.filter(item => !item.label.includes("and over")) || [] : 
            [];
    }, [data]);


    useEffect(() => {

        fetch('/suicidedata.csv')
            .then(response => response.text())
            .then(data => {
                const parsedCsv = d3.csvParse(data);
                const filteredData = parsedCsv.filter(d => 
                    parseInt(d.YEAR) >= 1980 && 
                    (d.UNIT !== "Deaths per 100,000 resident population, crude" || d.STUB_NAME === "Sex and age" || d.STUB_NAME === "Sex, age and race" || d.STUB_NAME === "Sex, age and race and Hispanic origin")
                );

                const aggregatedData = filteredData.reduce((acc, curr) => {
                    const year = curr.YEAR;
                    
                    let yearObj = acc.find(item => Object.keys(item)[0] === year);
                    if (!yearObj) {
                        yearObj = { [year]: {} };
                        acc.push(yearObj);
                    }
                    
                    if (!yearObj[year][curr.STUB_NAME]) {
                        yearObj[year][curr.STUB_NAME] = [];
                    }
                    
                    yearObj[year][curr.STUB_NAME].push({
                        label: curr.STUB_LABEL,
                        numDeaths: parseFloat(curr.ESTIMATE)
                    });
                    
                    return acc;
                }, []);

                console.log(aggregatedData);
                setData(aggregatedData);
            })
            .catch(error => console.error('Error loading the data:', error));
    }, []);


    useGSAP(() => {
        // Kill any existing ScrollTriggers first
        ScrollTrigger.getAll().forEach(st => st.kill());

        const sections = gsap.utils.toArray('.scroll-section');
        
        // Set first section to be visible initially
        gsap.set(sections[0], { opacity: 1 });
        // Set all other sections to be invisible initially
        sections.slice(1).forEach(section => gsap.set(section, { opacity: 0 }));
        
        sections.forEach((section, index) => {
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: () => `${index * 100}% top`,
                end: () => `${(index + 1) * 100}% top`,
                markers: false,
                onEnter: () => gsap.to(section, { 
                    opacity: 1, 
                    duration: 0.3,
                    overwrite: true 
                }),
                onLeave: () => gsap.to(section, { 
                    opacity: 0, 
                    duration: 0.3,
                    overwrite: true 
                }),
                onEnterBack: () => gsap.to(section, { 
                    opacity: 1, 
                    duration: 0.3,
                    overwrite: true 
                }),
                onLeaveBack: () => gsap.to(section, { 
                    opacity: 0, 
                    duration: 0.3,
                    overwrite: true 
                })
            });
        });
    }, { scope: containerRef });

    return (
        <>
            <div className="scroll-container" />
            <div ref={containerRef} className="container">
                {/* Intro to number of suicides per year */}
                <div className="scroll-section" style={{flexDirection: "column"}}>
                    <h1 className="circle-title">In 2018, 1.48% of deaths in the US were from suicide</h1>
                    <Circlegrid/>
                </div>
                {/* Historic high of suicides per year */}
                <div className="scroll-section">
                    <Linechart data={dataByTotalPerYear} />
                </div>
                {/* Breakdown of sex */}
                <div className="scroll-section">
                    <Piechart title="Suicide Composition by Sex Per 100,000 Population Age Adjusted - 2018" data={dataBySex} />
                </div>
                {/* Breakdown of sex, race */}
                <div className="scroll-section">
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                        <Piechart 
                            title="Suicide Distribution by Race (Female) Per 100,000 Population Age Adjusted - 2018" 
                            data={dataBySexAndRace?.filter(item => item.label.includes('Female'))} 
                        />
                        <Piechart 
                            title="Suicide Distribution by Race (Male) Per 100,000 Population Age Adjusted - 2018" 
                            data={dataBySexAndRace?.filter(item => item.label.includes('Male'))} 
                        />
                    </div>
                </div>
                {/* Breakdown of sex and race and Hispanic origin */}
                <div className="scroll-section">
                    <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <Piechart 
                            title="Suicide Distribution by Race, and Hispanic Origin (Female) Per 100,000 Population Age Adjusted - 2018" 
                            data={dataBySexRaceHispanic?.filter(item => item.label.includes('Female'))} 
                        />
                        <Piechart 
                            title="Suicide Distribution by Race, and Hispanic Origin (Male) Per 100,000 Population Age Adjusted - 2018" 
                            data={dataBySexRaceHispanic?.filter(item => item.label.includes('Male'))} 
                        />
                    </div>
                </div>
                {/* Breakdown of Sex, Age */}
                <div className="scroll-section">
                    <Barchart title="Suicide Distribution by Sex and Age Per 100,000 Population 2018" data={dataBySexAndAge} />
                </div>
                {/* Breakdown of Sex, Age, Race, Stacked bar chart? */}
                <div className="scroll-section">
                    <Scatterplot title="Suicide Distribution by Sex, Age, and Race Per 100,000 Population 2017" data={dataBySexAgeRace} />
                </div>
                {/* Breakdown of Sex, Age, Race, Hispanic Origin, Stacked bar chart? */}
                <div className="scroll-section">
                    <ScatterplotTwo title="Suicide Distribution by Sex, Age, Race, and Hispanic Origin Per 100,000 Population 2017" data={dataBySexAgeRaceHispanic} />
                </div>
                {/* Stacked line chart */}
                <div className="scroll-section">
                    <StackedLinechart title="Suicide Distribution by Sex, Age, Race, and Hispanic Origin 1980-2017" data={data} />
                </div>
            </div>
        </>
    );
}

export default Container;
