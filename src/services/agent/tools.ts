import { CVData, WebsiteConfig, DeploymentState, ThemeType, BuilderStep } from '@/store/portfolioStore';

export interface UserState {
  cvData: CVData | null;
  websiteConfig: WebsiteConfig;
  deployment: DeploymentState;
  currentStep: BuilderStep;
}

const API_BASE_URL = 'http://localhost:8000';

/**
 * Tool 1: CV Parsing Tool
 * Extracts factual information from a provided CV file (PDF or DOCX).
 */
export async function parse_cv_tool(file: File): Promise<{ cv_data: CVData; user_id: string }> {
  console.log('[Agent Tool] parse_cv_tool starting for:', file.name);
  
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload-cv`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to parse CV');
  }

  const data = await response.json();
  console.log('[Agent Tool] parse_cv_tool completed');
  return {
    cv_data: data.cv_data,
    user_id: data.user_id
  };
}

/**
 * Tool 2: Persistence Tool
 * Stores user-related state in local storage for frontend persistence.
 */
export async function store_user_state_tool(userId: string, state: any): Promise<{ status: string; reference_id: string }> {
  console.log('[Agent Tool] store_user_state_tool starting for user:', userId);
  const reference_id = `ref-${Math.random().toString(36).substring(7)}`;
  localStorage.setItem(`portfolio_agent_state_${userId}`, JSON.stringify(state));
  console.log('[Agent Tool] store_user_state_tool completed');
  return {
    status: 'success',
    reference_id
  };
}

/**
 * Tool 3: Site Generation Tool
 * Generates a portfolio website based on CV data and theme via backend.
 */
export async function generate_site_tool(userId: string, theme: string): Promise<{ preview_url: string }> {
  console.log('[Agent Tool] generate_site_tool starting for user:', userId, 'theme:', theme);
  
  const response = await fetch(`${API_BASE_URL}/generate-site?user_id=${userId}&theme=${theme}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to generate site');
  }

  return await response.json();
}

/**
 * Tool 4: Site Preview Tool
 * Returns the live preview URL for a generated site via backend.
 */
export async function preview_site_tool(userId: string): Promise<{ preview_url: string }> {
  console.log('[Agent Tool] preview_site_tool starting for user:', userId);
  
  // In our current backend, we can return the preview URL based on user_id
  return { preview_url: `http://localhost:3000/preview/${userId}` };
}

/**
 * Tool 5: Website Update Tool
 * Applies structured updates to an existing portfolio website via backend.
 */
export async function update_site_tool(userId: string, updates: any): Promise<{ status: string; preview_url: string }> {
  console.log('[Agent Tool] update_site_tool starting for:', userId);
  
  const response = await fetch(`${API_BASE_URL}/edit-site?user_id=${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update site');
  }

  return await response.json();
}

/**
 * Tool 6: Deployment Tool
 * Deploys the finalized portfolio website via backend.
 */
export async function deploy_site_tool(userId: string, platform: 'vercel' | 'netlify'): Promise<{ status: string; live_url: string }> {
  console.log('[Agent Tool] deploy_site_tool starting for user:', userId);
  
  const response = await fetch(`${API_BASE_URL}/deploy?user_id=${userId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to deploy site');
  }

  return await response.json();
}
