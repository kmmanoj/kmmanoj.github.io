import { memo } from "react";
import { Container } from "semantic-ui-react";

import "semantic-ui-css/semantic.min.css";

const Introduction = memo(() => {
    return (
        <div style={{ padding: "2% 0" }}>
            <Container text>
                <p style={{ paddingTop: "10px" }}>
                    Security engineer and researcher with roots in software engineering and identity & access management. I spend my time breaking applications, poking at infrastructure, and studying how systems fail — currently as a security engineer at Postman.
                </p>
                <p>
                    Lately, my focus has shifted to LLMs: building systems to prevent attacks on AI agents, using AI agents to defend against cyber threats, and studying guardrails to protect future generations from the harms of AI-generated content.
                </p>
            </Container>
        </div>
    );
});

Introduction.displayName = 'Introduction';

export default Introduction;