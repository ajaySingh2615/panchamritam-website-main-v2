import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="mb-3 flex items-center text-sm font-medium text-gray-500">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="mx-2">/</span>
            )}
            
            {isLast ? (
              <span>{item.label}</span>
            ) : (
              <Link 
                to={item.path} 
                className="hover:text-gray-700 transition duration-200"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb; 