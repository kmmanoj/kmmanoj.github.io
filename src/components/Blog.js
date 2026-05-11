import React, { useEffect, useState, useCallback, memo } from "react";
import { Container, Header, Loader } from "semantic-ui-react";
import { VerticalTimeline, VerticalTimelineElement } from "react-vertical-timeline-component";
import { TfiWrite } from "react-icons/tfi";

import "react-vertical-timeline-component/style.min.css";

const PostItem = memo(({ title, date, excerpt, url }) => (
    <VerticalTimelineElement
        className="vertical-timeline-element--blog"
        contentStyle={{ border: "1px solid #000" }}
        contentArrowStyle={{ borderRight: "7px solid #000" }}
        date={new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
        iconStyle={{ background: "#fff", border: "0px" }}
        icon={<TfiWrite />}
    >
        <Header as="h3" style={{ margin: 0 }}>
            {title}
        </Header>
        <p style={{ margin: "10px" }}>
            {excerpt.trim()} <br />
            <a href={url} target="_blank" rel="noreferrer">Read more</a>
        </p>
    </VerticalTimelineElement>
));

PostItem.displayName = "PostItem";

const Blog = () => {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);

    const loadPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/blog/feed.json");
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setPosts(data);
        } catch (err) {
            console.error("Failed to load blog feed:", err);
            setError("Could not load posts.");
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    return (
        <div>
            <Container text textAlign="justified">
                <Header as="h1" style={{ marginBottom: "0.25rem" }}>Blog</Header>
                <a href="/blog" target="_blank" rel="noreferrer" style={{ fontSize: "0.9rem", color: "#666" }}>
                    Open blog in full view →
                </a>
            </Container>

            {loading ? (
                <Loader active size="medium" inline style={{ margin: "100px 0px" }}>
                    Loading Posts
                </Loader>
            ) : error ? (
                <Container text style={{ marginTop: "2rem", color: "#666" }}>
                    <p>{error}</p>
                </Container>
            ) : posts.length === 0 ? (
                <Container text style={{ marginTop: "2rem", color: "#666" }}>
                    <p>No posts yet. Check back soon.</p>
                </Container>
            ) : (
                <VerticalTimeline lineColor="black" layout="1-column-left">
                    {posts.map((post, i) => (
                        <PostItem key={`${post.title}-${i}`} {...post} />
                    ))}
                </VerticalTimeline>
            )}
        </div>
    );
};

export default Blog;
