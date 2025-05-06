const Home = () => {
  return (
    <div className="home-page">
      <h2>Welcome to Panchamritam</h2>
      <p>Your source for authentic information and services.</p>
      
      <section className="featured-section">
        <h3>Featured Content</h3>
        <div className="featured-cards">
          <div className="card">
            <h4>Our Mission</h4>
            <p>Learn about our mission and vision for the community.</p>
          </div>
          <div className="card">
            <h4>Services</h4>
            <p>Explore the range of services we offer.</p>
          </div>
          <div className="card">
            <h4>Get Involved</h4>
            <p>Find out how you can contribute and participate.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 