import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { Hackathon } from './types'; // Import Hackathon interface
import { getHackathonById } from './hackathonUtils'; // Import getHackathonById

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  skills: string[];
  avatar?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  hackathonId?: string;
  hackathonName: string;
  hackathonStartDate?: string;
  hackathonEndDate?: string;
  teamCode: string;
  members: TeamMember[];
  requiredSkills: string[];
  maxMembers: number;
  createdAt: Date;
  createdBy: string;
  joinRequests?: string[];
}

// Generate a unique team code
const generateTeamCode = async (): Promise<string> => {
  let code: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 5;

  while (!isUnique && attempts < maxAttempts) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log('Generated Team Code:', code);
    
    // Check if code already exists
    const existingTeam = await getTeamByCode(code);
    if (!existingTeam) {
      isUnique = true;
      return code;
    }
    
    attempts++;
    console.log(`Team code ${code} already exists, generating new code...`);
  }

  throw new Error('Failed to generate unique team code after multiple attempts');
};

// Create a new team
export const createTeam = async (teamData: Omit<Team, 'id' | 'teamCode'>): Promise<string> => {
  try {
    console.log('createTeam: Function entered.');
    console.log('createTeam: Received teamData:', teamData);

    // IMPORTANT: Check if the user is already in any team before creating a new one
    if (teamData.createdBy) {
      const userInTeam = await isUserInAnyTeam(teamData.createdBy);
      if (userInTeam) {
        throw new Error('You are already a member of a team. You cannot create another team.');
      }
    }

    // Generate a unique team code
    const teamCode = await generateTeamCode();
    console.log('createTeam: Generated code for new team:', teamCode);
    
    // Fetch hackathon details if hackathonId is provided
    let hackathonStartDate: string | undefined;
    let hackathonEndDate: string | undefined;

    if (teamData.hackathonId) {
      const hackathonRef = doc(db, 'hackathons', teamData.hackathonId);
      const hackathonDoc = await getDoc(hackathonRef);
      if (hackathonDoc.exists()) {
        const hackathonData = hackathonDoc.data() as Hackathon;
        hackathonStartDate = hackathonData.startDate;
        hackathonEndDate = hackathonData.endDate;
      }
    }

    // Create the team document with all required fields
    const teamRef = doc(collection(db, 'teams'));
    
    // Convert Date to Firestore Timestamp
    const createdAt = teamData.createdAt instanceof Date 
      ? teamData.createdAt 
      : new Date();

    // Ensure all fields have default values and are in the correct format
    const newTeam = {
      id: teamRef.id,
      teamCode,
      name: teamData.name || '',
      description: teamData.description || '',
      requiredSkills: Array.isArray(teamData.requiredSkills) ? teamData.requiredSkills : [],
      maxMembers: typeof teamData.maxMembers === 'number' ? teamData.maxMembers : 4,
      hackathonId: teamData.hackathonId || '',
      hackathonName: teamData.hackathonName || '',
      hackathonStartDate: hackathonStartDate, // Include hackathon start date
      hackathonEndDate: hackathonEndDate,     // Include hackathon end date
      members: Array.isArray(teamData.members) ? teamData.members.map(member => ({
        id: member.id || '',
        name: member.name || 'Anonymous',
        role: member.role || 'Member',
        skills: Array.isArray(member.skills) ? member.skills : [],
        ...(member.avatar ? { avatar: member.avatar } : {})
      })) : [],
      createdAt,
      createdBy: teamData.createdBy || '',
      joinRequests: Array.isArray(teamData.joinRequests) ? teamData.joinRequests : []
    };

    // Validate required fields
    if (!newTeam.name || !newTeam.description || !newTeam.createdBy || newTeam.requiredSkills.length === 0) {
      throw new Error('Missing required fields (name, description, createdBy, skills).');
    }

    // For manually created teams, hackathonName is required
    if (!newTeam.hackathonName) {
      throw new Error('Hackathon name is required.');
    }

    console.log('createTeam: Attempting to set document with data:', newTeam);
    await setDoc(teamRef, newTeam);
    console.log('createTeam: Document set successfully. Team ID:', teamRef.id);
    return teamRef.id;
  } catch (error) {
    console.error('createTeam: Error creating team:', error);
    throw error;
  }
};

// Get a team by code
export const getTeamByCode = async (teamCode: string): Promise<Team | null> => {
  const teamsQuery = query(
    collection(db, 'teams'),
    where('teamCode', '==', teamCode)
  );
  const teamsSnapshot = await getDocs(teamsQuery);
  if (teamsSnapshot.empty) return null;
  
  const docData = teamsSnapshot.docs[0].data();
  let team = { ...docData, id: teamsSnapshot.docs[0].id } as Team;

  // Fetch hackathon details if hackathonId exists and dates are missing
  if (team.hackathonId && (!team.hackathonStartDate || !team.hackathonEndDate)) {
    const hackathon = await getHackathonById(team.hackathonId);
    if (hackathon) {
      team.hackathonStartDate = hackathon.startDate;
      team.hackathonEndDate = hackathon.endDate;
    }
  }
  return team;
};

// Get a team by ID
export const getTeam = async (teamId: string): Promise<Team | null> => {
  const teamRef = doc(db, 'teams', teamId);
  const teamDoc = await getDoc(teamRef);
  if (!teamDoc.exists()) return null;
  
  let team = { ...teamDoc.data(), id: teamDoc.id } as Team;

  // Fetch hackathon details if hackathonId exists and dates are missing
  if (team.hackathonId && (!team.hackathonStartDate || !team.hackathonEndDate)) {
    const hackathon = await getHackathonById(team.hackathonId);
    if (hackathon) {
      team.hackathonStartDate = hackathon.startDate;
      team.hackathonEndDate = hackathon.endDate;
    }
  }
  return team;
};

// Get all teams for a user
export const getUserTeams = async (userId: string): Promise<Team[]> => {
  const teamsQuery = query(
    collection(db, 'teams')
  );
  const teamsSnapshot = await getDocs(teamsQuery);
  const allTeams = teamsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }) as Team);

  const userTeams: Team[] = [];
  for (const team of allTeams) {
    if (team.members.some(member => member.id === userId)) {
      // Fetch hackathon details if hackathonId exists and dates are missing
      if (team.hackathonId && (!team.hackathonStartDate || !team.hackathonEndDate)) {
        const hackathon = await getHackathonById(team.hackathonId);
        if (hackathon) {
          team.hackathonStartDate = hackathon.startDate;
          team.hackathonEndDate = hackathon.endDate;
        }
      }
      userTeams.push(team);
    }
  }
  return userTeams;
};

// Update a team
export const updateTeam = async (teamId: string, updates: Partial<Team>): Promise<void> => {
  console.log('updateTeam called with:', { teamId, updates });
  
  const teamRef = doc(db, 'teams', teamId);
  const teamDoc = await getDoc(teamRef);
  
  if (!teamDoc.exists()) {
    throw new Error('Team not found');
  }

  const currentTeam = teamDoc.data() as Team;
  console.log('Current team data:', currentTeam);

  // Create the update object with only defined fields
  const updateData: { [key: string]: any } = {};
  
  // Only include fields that are defined in the updates
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.requiredSkills !== undefined) {
    updateData.requiredSkills = Array.isArray(updates.requiredSkills) ? updates.requiredSkills : [];
  }
  if (updates.maxMembers !== undefined) updateData.maxMembers = updates.maxMembers;
  if (updates.hackathonId !== undefined) updateData.hackathonId = updates.hackathonId;
  if (updates.hackathonName !== undefined) updateData.hackathonName = updates.hackathonName;
  if (updates.members !== undefined) updateData.members = updates.members;
  if (updates.joinRequests !== undefined) updateData.joinRequests = updates.joinRequests;
  if (updates.hackathonStartDate !== undefined) updateData.hackathonStartDate = updates.hackathonStartDate; // Include hackathon start date
  if (updates.hackathonEndDate !== undefined) updateData.hackathonEndDate = updates.hackathonEndDate;     // Include hackathon end date

  console.log('Final update data:', updateData);

  // Update the document with only the defined fields
  await updateDoc(teamRef, updateData);
  console.log('Update completed');
};

// Delete a team
export const deleteTeam = async (teamId: string): Promise<void> => {
  const teamRef = doc(db, 'teams', teamId);
  await deleteDoc(teamRef);
};

// Add a member to a team
export const addTeamMember = async (teamId: string, member: TeamMember): Promise<void> => {
  const teamRef = doc(db, 'teams', teamId);
  const teamDoc = await getDoc(teamRef);
  
  if (!teamDoc.exists()) {
    throw new Error('Team not found');
  }

  const team = teamDoc.data() as Team;
  
  // Check if member already exists
  if (team.members.some(m => m.id === member.id)) {
    throw new Error('Member already exists in the team');
  }

  // Check if team is full
  if (team.members.length >= team.maxMembers) {
    throw new Error('Team is full');
  }

  // Create new member object without undefined values
  const newMember = {
    id: member.id,
    name: member.name || 'Anonymous',
    role: member.role || 'Member',
    skills: member.skills || [],
    ...(member.avatar ? { avatar: member.avatar } : {})
  } as TeamMember;

  // Add new member to the array
  const updatedMembers = [...team.members, newMember];
  
  await updateDoc(teamRef, {
    members: updatedMembers,
  });
};

// Remove a member from a team
export const removeTeamMember = async (teamId: string, memberId: string): Promise<void> => {
  const teamRef = doc(db, 'teams', teamId);
  const teamDoc = await getDoc(teamRef);
  if (!teamDoc.exists()) return;

  const team = teamDoc.data() as Team;
  const updatedMembers = team.members.filter(member => member.id !== memberId);
  
  await updateDoc(teamRef, {
    members: updatedMembers,
  });
};

// Search teams by skills
export const searchTeamsBySkills = async (skills: string[]): Promise<Team[]> => {
  const teamsQuery = query(
    collection(db, 'teams'),
    where('requiredSkills', 'array-contains-any', skills)
  );
  const teamsSnapshot = await getDocs(teamsQuery);
  return teamsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Team);
};

// Get available teams (not full)
export const getAvailableTeams = async (): Promise<Team[]> => {
  const teamsQuery = query(collection(db, 'teams'));
  const teamsSnapshot = await getDocs(teamsQuery);
  const allTeams = teamsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }) as Team);

  const availableTeams: Team[] = [];
  for (const team of allTeams) {
    if (team.members.length < team.maxMembers) {
      // Fetch hackathon details if hackathonId exists and dates are missing
      if (team.hackathonId && (!team.hackathonStartDate || !team.hackathonEndDate)) {
        const hackathon = await getHackathonById(team.hackathonId);
        if (hackathon) {
          team.hackathonStartDate = hackathon.startDate;
          team.hackathonEndDate = hackathon.endDate;
        }
      }
      availableTeams.push(team);
    }
  }
  return availableTeams;
};

// Check if user is already in any team
export const isUserInAnyTeam = async (userId: string): Promise<boolean> => {
  console.log(`isUserInAnyTeam: Checking membership for userId: ${userId}`);
  try {
    const teamsQuery = query(
      collection(db, 'teams')
    );
    const teamsSnapshot = await getDocs(teamsQuery);
    console.log(`isUserInAnyTeam: Found ${teamsSnapshot.docs.length} team documents.`);
    
    // Check if user is in any team (either as lead or member)
    for (const doc of teamsSnapshot.docs) {
      const team = doc.data() as Team;
      console.log(`isUserInAnyTeam: Checking team: ${team.name} (ID: ${team.id})`);
      if (team.members && team.members.some(member => {
        console.log(`isUserInAnyTeam: Checking member: ${member.id}`);
        return member.id === userId;
      })) {
        console.log(`isUserInAnyTeam: User ${userId} found in team ${team.name}. Returning true.`);
        return true;
      }
    }
    console.log(`isUserInAnyTeam: User ${userId} not found in any team. Returning false.`);
    return false;
  } catch (error) {
    console.error('Error checking user team membership:', error);
    throw error;
  }
};

// Check if user has already sent a join request to a team
export const hasUserRequestedToJoin = async (userId: string): Promise<boolean> => {
  try {
    const teamsQuery = query(
      collection(db, 'teams'),
      where('joinRequests', 'array-contains', userId)
    );
    const teamsSnapshot = await getDocs(teamsQuery);
    return !teamsSnapshot.empty;
  } catch (error) {
    console.error('Error checking user join requests:', error);
    throw error;
  }
};

// Add a join request to a team
export const addJoinRequest = async (teamId: string, userId: string): Promise<void> => {
  // IMPORTANT: Check if user is already in any team before sending a join request
  const userInAnyTeam = await isUserInAnyTeam(userId);
  if (userInAnyTeam) {
    throw new Error('You are already a member of a team. You cannot send join requests while being part of another team.');
  }

  // Check if user has already sent a join request to any team (this check is now redundant given the check above, but keeping for now)
  const hasRequested = await hasUserRequestedToJoin(userId);
  if (hasRequested) {
    throw new Error('You have already sent a join request to another team. Please wait for a response or cancel your existing request before sending a new one.');
  }

  const teamRef = doc(db, 'teams', teamId);
  await updateDoc(teamRef, {
    joinRequests: arrayUnion(userId),
  });
};

// Remove a join request from a team (optional, but good to have)
export const removeJoinRequest = async (teamId: string, userId: string): Promise<void> => {
  const teamRef = doc(db, 'teams', teamId);
  const teamDoc = await getDoc(teamRef);
  if (!teamDoc.exists()) return;

  const team = teamDoc.data() as Team;
  const updatedRequests = team.joinRequests?.filter(request => request !== userId) || [];

  await updateDoc(teamRef, {
    joinRequests: updatedRequests,
  });
};

// Accept a join request
export const acceptJoinRequest = async (teamId: string, member: TeamMember): Promise<void> => {
  const teamRef = doc(db, 'teams', teamId);
  const teamDoc = await getDoc(teamRef);

  if (!teamDoc.exists()) {
    throw new Error('Team not found');
  }

  const team = teamDoc.data() as Team;

   // Check if the user is already a member
   if (team.members.some(m => m.id === member.id)) {
    throw new Error('User is already a member of the team');
   }

  // Check if the team is full before adding a new member
  if (team.members.length >= team.maxMembers) {
    throw new Error('Team is full, cannot accept request');
  }

  // Add the member to the members array and remove the request
  await updateDoc(teamRef, {
    members: arrayUnion(member),
    joinRequests: arrayRemove(member.id)
  });
};

// Reject a join request
export const rejectJoinRequest = async (teamId: string, userId: string): Promise<void> => {
  const teamRef = doc(db, 'teams', teamId);
  await updateDoc(teamRef, {
    joinRequests: arrayRemove(userId),
  });
};

// Get teams where a user has a pending join request
export const getTeamsWithJoinRequestFromUser = async (userId: string): Promise<Team[]> => {
  try {
    const teamsQuery = query(
      collection(db, 'teams'),
      where('joinRequests', 'array-contains', userId)
    );
    const teamsSnapshot = await getDocs(teamsQuery);
    return teamsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Team);
  } catch (error) {
    console.error('Error getting teams with join requests for user:', error);
    throw error;
  }
};

// Helper function to get TeamMember data from a user object (e.g., from Firebase Auth)
export const getTeamMemberDataFromUser = (user: any): TeamMember => {
  // Assuming the user object has properties like uid, displayName, photoURL
  // You might need to adjust property names based on your user structure
  return {
    id: user.uid,
    name: user.displayName || 'Anonymous',
    role: 'Member', // Default role when joining via request/skill match
    skills: [], // Skills will likely be on the user's profile, not directly on the auth user object
    // Conditionally include avatar only if photoURL exists
    ...(user.photoURL ? { avatar: user.photoURL } : {}),
  };
}; 