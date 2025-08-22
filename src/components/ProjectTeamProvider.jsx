import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../supabaseClient';

const ProjectTeamContext = createContext();

export const useProjectTeam = () => {
  const context = useContext(ProjectTeamContext);
  if (!context) {
    throw new Error('useProjectTeam must be used within a ProjectTeamProvider');
  }
  return context;
};

const ProjectTeamProvider = ({ projectId, children }) => {
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProjectTeam = async () => {
    if (!projectId) {
      setProjectMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data: members, error } = await supabase
        .from('project_team_view')
        .select('*')
        .eq('project_id', projectId)
        .order('joined_project_date', { ascending: false });

      if (error) throw error;
      setProjectMembers(members || []);

    } catch (error) {
      console.error('Error loading project team:', error);
      setProjectMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectTeam();
  }, [projectId]);

  const refreshTeam = () => {
    loadProjectTeam();
  };

  return (
    <ProjectTeamContext.Provider value={{ 
      projectMembers, 
      loading, 
      refreshTeam 
    }}>
      {children}
    </ProjectTeamContext.Provider>
  );
};

export default ProjectTeamProvider;
