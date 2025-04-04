import React, { useState } from 'react';

const SaveProjects = () => {
  const [savedProjects, setSavedProjects] = useState(
    JSON.parse(localStorage.getItem('projects')) || []
  );

  const saveProject = (projectDetails, equipmentList) => {
    const newProject = { ...projectDetails, equipmentList };
    const updatedProjects = [...savedProjects, newProject];
    setSavedProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  };

  return (
    <div>
      <h3>Saved Projects</h3>
      <ul>
        {savedProjects.map((project, index) => (
          <li key={index}>
            {project.projectType} - {project.location}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SaveProjects;
