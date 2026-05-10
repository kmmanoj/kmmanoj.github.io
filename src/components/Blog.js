import React, { useEffect, useState, useCallback, memo } from "react";
import { Container, Header, Loader, List, Label } from "semantic-ui-react";

const PostItem = memo(({ title, date, excerpt, url, tags }) => (
    <List.Item style={{ padding: "1rem 0", borderBottom: "1px solid #eee" }}>
        <List.Icon name="write" size="large" verticalAlign="middle" />
        <List.Content>
            <List.Header as="a" href={url} style={{ fontSize: "1.05rem" }}>
                {title}
            </List.Header>
            <List.Description style={{ marginTop: "0.3rem", color: "#666", fontSize: "0.85rem" }}>
                {date}
            </List.Description>
            <p style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>{excerpt}</p>
            {tags && tags.map(tag => (
                <Label key={tag} size="mini" style={{ marginRight: "4px" }}>{tag}</Label>
            ))}
        </List.Content>
    </List.Item>
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
                <Container text>
                    <List relaxed style={{ marginTop: "1rem" }}>
                        {posts.map((post, i) => (
                            <PostItem key={`${post.title}-${i}`} {...post} />
                        ))}
                    </List>
                </Container>
            )}
        </div>
    );
};

export default Blog;
