import React from "react";
import { socialIcons, team } from "../data/Data";
import CommonHeading from "../common/CommonHeading";
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from "react-icons/fi";
import "./Teams.css"; // Create this CSS file

export default function Teams() {
  return (
    <section className="team-section">
      <div className="container">
        <CommonHeading 
          heading="Our Creative Team" 
          subtitle="Meet The" 
          title="Experts"
          alignment="center"
        />
        
        <div className="team-grid">
          {team.map((member, index) => (
            <div className="team-card" key={index}>
              <div className="card-inner">
                <div className="image-container">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="member-image"
                    loading="lazy"
                  />
                  <div className="image-overlay"></div>
                  
                  <div className="social-links">
                    {socialIcons.slice(0, 4).map((platform, i) => (
                      <button
                        key={i}
                        type="button"
                        className="social-icon"
                        aria-label={`${platform.name} profile`}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {platform.name === 'Facebook' && <FiFacebook />}
                        {platform.name === 'Twitter' && <FiTwitter />}
                        {platform.name === 'Instagram' && <FiInstagram />}
                        {platform.name === 'Linkedin' && <FiLinkedin />}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="member-info">
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-role">{member.designation}</p>
                </div>
              </div>
              <div className="card-glow"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}