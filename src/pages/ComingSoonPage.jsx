import React from 'react';
import '../App.css';
import Lottie from 'lottie-react';
import underMaintenanceAnimation from './Under Maintenance.json';

const ComingSoonPage = () => {
  return (
    <div className="coming-soon-container">
      <div className="tech-bg"></div>
      <div className="glow-orb-1"></div>
      <div className="glow-orb-2"></div>
      
      <div className="layout-grid">
        <div className="content-left">
          <div className="brand-badge">SYSTEM INITIALIZATION</div>
          <h1>TBSS</h1>
          <h2>Something amazing is in the works.</h2>
          
          <div className="divider"></div>
          
          <p>
            We are currently building our new platform. Check back soon for updates and early access.
          </p>
          
          <form className="notify-form" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              className="notify-input" 
              placeholder="Enter your email address" 
              required 
            />
            <button type="submit" className="notify-btn">Notify Me</button>
          </form>
        </div>

        <div className="lottie-right">
          <Lottie 
            animationData={underMaintenanceAnimation} 
            loop={true} 
            className="lottie-player"
          />
        </div>
      </div>

      <div className="footer">
        Powered by <span className="powered-by">corepeak-dev</span>
      </div>
    </div>
  );
};

export default ComingSoonPage;
