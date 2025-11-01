import React, { memo } from "react";
import { Container, Header } from "semantic-ui-react";

import "semantic-ui-css/semantic.min.css";

const Introduction = memo(() => {
    return (
        <div style={{ padding: "2% 0" }}>
            <Container text>
                <Header as="small">I'm</Header>
                <p style={{ paddingTop: "10px" }}>
                    Manoj Vignesh K M, an application security engineer with a provable experience in web application security and software engineering.
                    I love breaking and fixing computers and software, building applications and writing about my learnings.
                </p>
                <p>
                    Check out my <a href="https://kmmanoj.medium.com" target="_blank" rel="noreferrer">blog articles</a> where I explain claims and concepts by application.
                </p>
            </Container>
        </div>
    );
});

Introduction.displayName = 'Introduction';

export default Introduction;