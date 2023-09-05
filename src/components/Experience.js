import { Container, Header, Loader } from "semantic-ui-react";
import { VerticalTimeline, VerticalTimelineElement }  from "react-vertical-timeline-component";
import { MdWorkOutline, MdOutlineSchool } from "react-icons/md"
import { useEffect, useState } from "react";
import axios from "axios";

import "semantic-ui-css/semantic.min.css";
import "react-vertical-timeline-component/style.min.css";

import { API_HOST } from '../constants';


function ExperienceItem(props) {
    let description = props.description;
    if(props.description.indexOf(";") !== -1) {
        description = description.split(";").map((dsc, i) => <li key={i}>{dsc}</li>);
    }
    return (
        <VerticalTimelineElement
                className={`vertical-timeline-element--${props.type}`}
                contentStyle={{ border: "1px solid #000" }}
                contentArrowStyle={{ borderRight: "7px solid #000" }}
                date={props.period}
                iconStyle={{ background: "#fff", border: "0px" }}
                icon={props.type==="education"?<MdOutlineSchool />:<MdWorkOutline />}
            >
            <Header as="h3" style={{margin:0}}>{props.role}
                <Header.Subheader>{props.organization}</Header.Subheader>
            </Header>

            <p style={{margin:"10px 30px"}}>
                {description}
            </p>
        </VerticalTimelineElement>
    )
}

export default function Experience() {
    let [loading, setLoading] = useState(true);
    let [experiences, setExperiences] = useState([]);

    function loadExperience() {
        setLoading(true);
        let url = `${API_HOST}/v1/experience`;
        axios.get(url).then((response) => {
            setLoading(false);
            if(response.status !== 200) {
                setExperiences(require("../data/experience.json"));
            }
            setExperiences(response.data);
        }).catch(() => {
            setLoading(false);
            setExperiences(require("../data/experience.json"));
        });
    }

    useEffect(() => loadExperience(), []);

    return (
        <div>
            <Container text textAlign="justified">
                <Header as="h1">Experience</Header>
                <a href="./CV.pdf">Download CV</a>
            </Container>
            {
                loading
                ?<Loader active size="medium" inline style={{margin: "100px 0px"}}>Loading Experience</Loader>:
                <VerticalTimeline lineColor="black" layout="1-column-left">
                {
                    experiences.map(
                        (experience, i) => (
                            <ExperienceItem key={i} {...experience} />
                        )
                    )
                }
                </VerticalTimeline>
            }
        </div>
    );
}