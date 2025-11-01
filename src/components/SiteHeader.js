import React, { memo } from "react";
import { Container, Segment, Header } from "semantic-ui-react";

import "semantic-ui-css/semantic.min.css";

const SiteHeader = memo(() => {
    return (
        <Segment size="massive" attached="top">
            <Container text>
                <Header size="huge">Manoj Vignesh K M</Header>
            </Container>
        </Segment>
    );
});

SiteHeader.displayName = 'SiteHeader';

export default SiteHeader;