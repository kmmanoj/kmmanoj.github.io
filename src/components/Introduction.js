import { useState } from "react";
import { Container, Header, Message, Icon, Button } from "semantic-ui-react";

import "semantic-ui-css/semantic.min.css";

export default function Introduction() {
    return (
        <div style={{"padding": "2% 0"}}>
            <Container text>
                <Header as="small">I'm</Header>
                <p style={{"paddingTop": "10px"}}>
                    Manoj Vignesh K M, a cybersecurity researcher with a provable experience in network security and web application security. I also possess immense experience in building monitoring, alerting and inventory management system for a heterogenous system of network devices.
                </p>
                <p>
                    Check out my <a href="https://kmmanoj.hashnode.dev" target="_blank" rel="noreferrer">blog articles</a> where I explain claims and concepts by application.
                </p>
            </Container>
        </div>
    );
}