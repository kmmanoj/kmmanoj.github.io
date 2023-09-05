import { Container, Header, Loader } from "semantic-ui-react";
import { VerticalTimeline, VerticalTimelineElement }  from "react-vertical-timeline-component";
import { MdBrokenImage } from "react-icons/md";
import { GiMaterialsScience } from "react-icons/gi";
import { AiOutlineYoutube } from "react-icons/ai";
import { TfiWrite } from "react-icons/tfi";
import { useEffect, useState } from "react";
import axios from "axios";

import "semantic-ui-css/semantic.min.css";
import "react-vertical-timeline-component/style.min.css";

import { API_HOST } from '../constants';

function WorkItem(props) {
    let icon = undefined;
    switch(props.type) {
        case "video": icon = <AiOutlineYoutube />; break;
        case "blog": icon = <TfiWrite />; break;
        case "research": icon = <GiMaterialsScience />; break;
        default: icon = <MdBrokenImage />;
    }
    return (
        <VerticalTimelineElement
                className={`vertical-timeline-element--${props.type}`}
                contentStyle={{ border: "1px solid #000" }}
                contentArrowStyle={{ borderRight: "7px solid #000" }}
                date={props.date}
                iconStyle={{ background: "#fff", border: "0px" }}
                icon={icon}
            >
            <Header as="h3" style={{margin:0}}>{props.title}</Header>

            <p style={{margin:"10px"}}>
                {props.description} <br/>
                <a href={props.url} target="_blank" rel="noreferrer">Read more</a>
            </p>
        </VerticalTimelineElement>
    )
}

export default function Work() {

    let [loading, setLoading] = useState(true);
    let [work, setWork] = useState([]);

    function loadWork() {
        setLoading(true);
        let url = `${API_HOST}/v1/work`;
        axios.get(url).then((response) => {
            setLoading(false);
            if(response.status !== 200) {
                setWork(require("../data/work.json"));
            }
            setWork(response.data);
        }).catch(() => {
            setLoading(false);
            setWork(require("../data/work.json"));
        });
    }

    useEffect(() => loadWork(), []);
    return (
        <div>
            <Container text textAlign="justified">
                <Header as="h1">Featured Work</Header>
                <a href="https://kmmanoj.hashnode.dev" target="_blank" rel="noreferrer">All work</a>
            </Container>
            {
                loading
                ?<Loader active size="medium" inline style={{margin: "100px 0px"}}>Loading Work</Loader>:
                <VerticalTimeline lineColor="black" layout="1-column-left">
                    {
                        work.map(
                            (work, i) => (
                                <WorkItem key={i} {...work} />
                            )
                        )
                    }
                </VerticalTimeline>
            }
        </div>
    );
}