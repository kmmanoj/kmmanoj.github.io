import React, { memo } from "react";
import { Container, Segment, Button, Icon } from "semantic-ui-react";

import "semantic-ui-css/semantic.min.css";

const Social = memo(({ site, handle }) => {
    const icon = site.toLowerCase();
    const iconText = site;
    
    const getLink = () => {
        switch(icon) {
            case "twitter": 
                return `https://twitter.com/${handle}`;
            case "linkedin": 
                return `https://linkedin.com/in/${handle}`;
            default: 
                return "";
        }
    };

    return (
        <Button color={icon} as="a" href={getLink()} target="_blank">
            <Icon name={icon} /> {iconText}
        </Button>
    );
});

Social.displayName = 'Social';

const SiteFooter = memo(() => {
    return (
        <Segment size="massive">
            <Container text fluid>
                <Social site="Twitter" handle="kmmanojv96" />
                <Social site="LinkedIn" handle="kmmanoj" />
            </Container>
        </Segment>
    );
});

SiteFooter.displayName = 'SiteFooter';

export default SiteFooter;