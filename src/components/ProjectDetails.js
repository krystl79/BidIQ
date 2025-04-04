import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        if (projectDoc.exists()) {
          setProject(projectDoc.data());
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.projectName}</h1>
          <p className="text-gray-600">Project Type: {project.projectType}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Start Date:</span> {project.startDate}</p>
              <p><span className="font-medium">End Date:</span> {project.endDate}</p>
              <p><span className="font-medium">Location:</span> {project.location.city}, {project.location.state} {project.location.zipCode}</p>
              <p><span className="font-medium">Home Type:</span> {project.homeType}</p>
              <p><span className="font-medium">Ladder Comfort:</span> {project.climbingLadder ? 'Yes' : 'No'}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Equipment Needed</h2>
            <ul className="list-disc list-inside space-y-2">
              {project.equipmentNeeded.map((equipment, index) => (
                <li key={index} className="text-gray-700">{equipment}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails; 