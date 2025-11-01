import React, { useEffect, useState, useCallback, memo } from "react";
import { Container, Header, Loader } from "semantic-ui-react";
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import { MdBrokenImage } from "react-icons/md";
import { GiMaterialsScience } from "react-icons/gi";
import { AiOutlineYoutube } from "react-icons/ai";
import { TfiWrite } from "react-icons/tfi";
import axios from "axios";

import "semantic-ui-css/semantic.min.css";
import "react-vertical-timeline-component/style.min.css";

import { API_HOST } from '../constants';
import workData from "../data/work.json";

const getWorkIcon = (type) => {
    switch(type) {
        case "video": 
            return <AiOutlineYoutube />;
        case "blog": 
            return <TfiWrite />;
        case "research": 
            return <GiMaterialsScience />;
        default: 
            return <MdBrokenImage />;
    }
};

const WorkItem = memo(({ type, date, title, description, url }) => {
    return (
        <VerticalTimelineElement
            className={`vertical-timeline-element--${type}`}
            contentStyle={{ border: "1px solid #000" }}
            contentArrowStyle={{ borderRight: "7px solid #000" }}
            date={date}
            iconStyle={{ background: "#fff", border: "0px" }}
            icon={getWorkIcon(type)}
        >
            <Header as="h3" style={{ margin: 0 }}>
                {title}
            </Header>

            <p style={{ margin: "10px" }}>
                {description} <br/>
                <a href={url} target="_blank" rel="noreferrer">Read more</a>
            </p>
        </VerticalTimelineElement>
    );
});

WorkItem.displayName = 'WorkItem';

const Work = () => {
    const [loading, setLoading] = useState(true);
    const [work, setWork] = useState([]);

    const loadWork = useCallback(async () => {
        setLoading(true);
        try {
            const url = `${API_HOST}/v1/work`;
            const response = await axios.get(url);
            
            if (response.status === 200) {
                setWork(response.data);
            } else {
                setWork(workData);
            }
        } catch (error) {
            console.error("Failed to load work data:", error);
            setWork(workData);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadWork();
    }, [loadWork]);

    return (
        <div>
            <Container text textAlign="justified">
                <Header as="h1">Featured Work</Header>
                <a href="https://kmmanoj.medium.com" target="_blank" rel="noreferrer">All work</a>
            </Container>
            {loading ? (
                <Loader active size="medium" inline style={{ margin: "100px 0px" }}>
                    Loading Work
                </Loader>
            ) : (
                <VerticalTimeline lineColor="black" layout="1-column-left">
                    {work.map((workItem, i) => (
                        <WorkItem key={`${workItem.title}-${i}`} {...workItem} />
                    ))}
                </VerticalTimeline>
            )}
        </div>
    );
};

export default Work;