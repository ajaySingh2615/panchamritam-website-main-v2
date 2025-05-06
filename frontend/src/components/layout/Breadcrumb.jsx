import React from 'react';
import { Link } from 'react-router-dom';
import './Breadcrumb.css';

const Breadcrumb = ({ items }) => {
  return (
    <nav className="breadcrumb">
      <ul className="breadcrumb-list">
        {items.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {index === items.length - 1 ? (
              <span className="breadcrumb-current">{item.label}</span>
            ) : (
              <>
                <Link to={item.path}>{item.label}</Link>
                <span className="breadcrumb-separator">/</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Breadcrumb; 