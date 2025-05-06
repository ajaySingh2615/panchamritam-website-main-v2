import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import './BlogDetail.css';

const BlogDetail = () => {
  const { blogId } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_ENDPOINTS.BLOGS}/${blogId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch blog: ${response.status} ${response.statusText}`);
        }

        // Check if the content type is application/json
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from server');
        }

        const data = await response.json();
        if (!data.blog) {
          throw new Error('Blog post not found');
        }
        
        setBlog(data.blog);
      } catch (err) {
        console.error('Error fetching blog details:', err);
        setError(err.message || 'Failed to load blog. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetail();
  }, [blogId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading blog...</p>
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

  if (!blog) {
    return (
      <div className="not-found-container">
        <h2>Blog Not Found</h2>
        <p>The blog post you're looking for doesn't exist.</p>
        <Link to="/blog" className="back-button">Back to Blogs</Link>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <div className="blog-detail-container">
        <div className="blog-header">
          <h1>{blog.title}</h1>
          <div className="blog-meta">
            <span className="blog-date">{new Date(blog.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
            {blog.author && (
              <span className="blog-author">By {blog.author.name}</span>
            )}
          </div>
        </div>
        
        <div className="blog-content">
          {blog.image && (
            <img 
              src={blog.image} 
              alt={blog.title} 
              className="blog-image" 
            />
          )}
          
          <div className="blog-text">
            {blog.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
        
        <div className="blog-footer">
          <Link to="/blog" className="back-to-blogs">
            &larr; Back to Blogs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail; 