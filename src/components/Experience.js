import React, { useEffect, useState, useCallback, memo } from "react";
import { Container, Header, Loader } from "semantic-ui-react";
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import { MdWorkOutline, MdOutlineSchool } from "react-icons/md";
import axios from "axios";

import "semantic-ui-css/semantic.min.css";
import "react-vertical-timeline-component/style.min.css";

import { API_HOST } from '../constants';
import experienceData from "../data/experience.json";

const ExperienceItem = memo(({ description, type, period, role, organization }) => {
    const processedDescription = description.includes(";") 
        ? description.split(";").map((desc, i) => <li key={i}>{desc}</li>)
        : description;

    return (
        <VerticalTimelineElement
            className={`vertical-timeline-element--${type}`}
            contentStyle={{ border: "1px solid #000" }}
            contentArrowStyle={{ borderRight: "7px solid #000" }}
            date={period}
            iconStyle={{ background: "#fff", border: "0px" }}
            icon={type === "education" ? <MdOutlineSchool /> : <MdWorkOutline />}
        >
            <Header as="h3" style={{ margin: 0 }}>
                {role}
                <Header.Subheader>{organization}</Header.Subheader>
            </Header>

            <p style={{ margin: "10px 30px" }}>
                {processedDescription}
            </p>
        </VerticalTimelineElement>
    );
});

ExperienceItem.displayName = 'ExperienceItem';

const Experience = () => {
    const [loading, setLoading] = useState(true);
    const [experiences, setExperiences] = useState([]);

    const loadExperience = useCallback(async () => {
        setLoading(true);
        try {
            const url = `${API_HOST}/v1/experience`;
            const response = await axios.get(url);
            
            if (response.status === 200) {
                setExperiences(response.data);
            } else {
                setExperiences(experienceData);
            }
        } catch (error) {
            console.error("Failed to load experience data:", error);
            setExperiences(experienceData);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadExperience();
    }, [loadExperience]);

    return (
        <div>
            <Container text textAlign="justified">
                <Header as="h1">Experience</Header>
                <a href="./CV.pdf">Download CV</a>
            </Container>
            {loading ? (
                <Loader active size="medium" inline style={{ margin: "100px 0px" }}>
                    Loading Experience
                </Loader>
            ) : (
                <VerticalTimeline lineColor="black" layout="1-column-left">
                    {experiences.map((experience, i) => (
                        <ExperienceItem key={`${experience.role}-${i}`} {...experience} />
                    ))}
                </VerticalTimeline>
            )}
        </div>
    );
};

export default Experience;