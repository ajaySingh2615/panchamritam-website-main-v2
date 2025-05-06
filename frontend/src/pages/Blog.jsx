import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import './Blog.css';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.BLOGS);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch blogs: ${response.status} ${response.statusText}`);
        }

        // Check if the content type is application/json
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from server');
        }

        const data = await response.json();
        setBlogs(data.blogs || []);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError(err.message || 'Failed to load blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading blogs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="blog-page">
      <div className="blog-container">
        <h1>Our Blog</h1>
        <div className="blog-grid">
          {blogs.length === 0 ? (
            <p>No blogs available at the moment.</p>
          ) : (
            blogs.map((blog) => (
              <div key={blog.blog_id} className="blog-card">
                <h2>{blog.title}</h2>
                <p className="blog-date">
                  {new Date(blog.created_at).toLocaleDateString()}
                </p>
                <p className="blog-excerpt">
                  {blog.content.substring(0, 150)}...
                </p>
                <Link to={`/blog/${blog.blog_id}`} className="read-more">
                  Read More
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog; 