import React, { useState, useCallback, useMemo } from "react";
import { Container, Tab } from "semantic-ui-react";

import Introduction from "./components/Introduction";
import Work from "./components/Work";
import Blog from "./components/Blog";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";

import "semantic-ui-css/semantic.min.css";

const getLastActiveIndex = () => {
    const index = localStorage.getItem("activeIndex");
    return parseInt(index) || 0;
};

const setLastActiveIndex = (activeIndex) => {
    localStorage.setItem("activeIndex", activeIndex.toString());
};

const App = () => {
    const [activeIndex, setActiveIndex] = useState(getLastActiveIndex);

    const panes = useMemo(() => [
        {
            menuItem: "Work",
            render: () => <Work />
        },
        {
            menuItem: "Blog",
            render: () => <Blog />
        }
    ], []);

    const handleTabChange = useCallback((e, data) => {
        const newActiveIndex = data.activeIndex;
        setActiveIndex(newActiveIndex);
        setLastActiveIndex(newActiveIndex);
    }, []);

    return (
        <div>
            <SiteHeader />
            <Introduction />
            <Container text fluid>
                <Tab 
                    menu={{ secondary: true }} 
                    panes={panes} 
                    onTabChange={handleTabChange}
                    activeIndex={activeIndex}
                />
            </Container>
            <SiteFooter />
        </div>
    );
};

export default App;           