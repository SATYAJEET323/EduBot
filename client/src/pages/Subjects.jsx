import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Subject = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    // Fetch subjects from the backend
    axios.get('/api/subjects')
      .then(response => setSubjects(response.data))
      .catch(error => console.error('Error fetching subjects:', error));
  }, []);

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    // Send the selected subject to the backend for question generation
    axios.post('/api/questions', { subject })
      .then(response => console.log('Questions generated:', response.data))
      .catch(error => console.error('Error generating questions:', error));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
        <p className="text-gray-600">Here are the Subjects, Select as your choices..</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {subjects.length > 0 ? (
          <ul className="space-y-4">
            {subjects.map((subject, index) => (
              <li key={index} className="text-center">
                <button
                  className="text-lg font-medium text-gray-900 hover:underline"
                  onClick={() => handleSubjectSelect(subject)}
                >
                  {subject.name}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-600">Loading subjects...</div>
        )}
      </div>
    </div>
  );
};

export default Subject;