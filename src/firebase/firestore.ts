import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot,
  query
} from 'firebase/firestore';
import type { QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from './config';
import type { SavingsGoal, SavingsEntry } from '../types';

// Collection names
const GOALS_COLLECTION = 'savings-goals';
const ENTRIES_COLLECTION = 'savings-entries';

// Helper to convert Firestore timestamp to ISO string
const timestampToString = (timestamp: any): string => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  return timestamp;
};

// ============================================
// GOALS CRUD OPERATIONS
// ============================================

export const goalsService = {
  // Get all goals (one-time fetch)
  async getAll(): Promise<SavingsGoal[]> {
    try {
      const querySnapshot = await getDocs(collection(db, GOALS_COLLECTION));
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: timestampToString(data.createdAt),
          deadline: data.deadline ? timestampToString(data.deadline) : undefined
        } as SavingsGoal;
      });
    } catch (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
  },

  // Subscribe to real-time updates
  subscribe(callback: (goals: SavingsGoal[]) => void): () => void {
    const q = query(collection(db, GOALS_COLLECTION));
    
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const goals = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: timestampToString(data.createdAt),
          deadline: data.deadline ? timestampToString(data.deadline) : undefined
        } as SavingsGoal;
      });
      callback(goals);
    }, (error) => {
      console.error('Error in goals subscription:', error);
    });

    return unsubscribe;
  },

  // Add a new goal
  async add(goal: Omit<SavingsGoal, 'id'>): Promise<string> {
    try {
      const goalData = {
        ...goal,
        createdAt: goal.createdAt || new Date().toISOString(),
        deadline: goal.deadline || null
      };
      const docRef = await addDoc(collection(db, GOALS_COLLECTION), goalData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  },

  // Update an existing goal
  async update(id: string, goal: Partial<SavingsGoal>): Promise<void> {
    try {
      const docRef = doc(db, GOALS_COLLECTION, id);
      const { id: _, ...goalWithoutId } = goal;
      await updateDoc(docRef, goalWithoutId);
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  },

  // Delete a goal
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, GOALS_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }
};

// ============================================
// ENTRIES CRUD OPERATIONS
// ============================================

export const entriesService = {
  // Get all entries (one-time fetch)
  async getAll(): Promise<SavingsEntry[]> {
    try {
      const querySnapshot = await getDocs(collection(db, ENTRIES_COLLECTION));
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          date: timestampToString(data.date)
        } as SavingsEntry;
      });
    } catch (error) {
      console.error('Error fetching entries:', error);
      return [];
    }
  },

  // Subscribe to real-time updates
  subscribe(callback: (entries: SavingsEntry[]) => void): () => void {
    const q = query(collection(db, ENTRIES_COLLECTION));
    
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const entries = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          date: timestampToString(data.date)
        } as SavingsEntry;
      });
      callback(entries);
    }, (error) => {
      console.error('Error in entries subscription:', error);
    });

    return unsubscribe;
  },

  // Add a new entry
  async add(entry: Omit<SavingsEntry, 'id'>): Promise<string> {
    try {
      const entryData = {
        ...entry,
        date: entry.date || new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, ENTRIES_COLLECTION), entryData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding entry:', error);
      throw error;
    }
  },

  // Update an existing entry
  async update(id: string, entry: Partial<SavingsEntry>): Promise<void> {
    try {
      const docRef = doc(db, ENTRIES_COLLECTION, id);
      const { id: _, ...entryWithoutId } = entry;
      await updateDoc(docRef, entryWithoutId);
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  },

  // Delete an entry
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, ENTRIES_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  }
};

// ============================================
// MIGRATION HELPER
// ============================================

// Helper function to migrate localStorage data to Firestore (one-time use)
export async function migrateLocalStorageToFirestore(): Promise<void> {
  try {
    const savedData = localStorage.getItem('holidayz-data');
    if (!savedData) {
      console.log('No local data to migrate');
      return;
    }

    const data = JSON.parse(savedData);
    
    // Migrate goals
    if (data.goals && Array.isArray(data.goals)) {
      console.log(`Migrating ${data.goals.length} goals...`);
      for (const goal of data.goals) {
        const { id, ...goalWithoutId } = goal;
        await goalsService.add(goalWithoutId);
      }
    }

    // Migrate entries
    if (data.entries && Array.isArray(data.entries)) {
      console.log(`Migrating ${data.entries.length} entries...`);
      for (const entry of data.entries) {
        const { id, ...entryWithoutId } = entry;
        await entriesService.add(entryWithoutId);
      }
    }

    console.log('✅ Migration completed successfully!');
    console.log('💡 You can now safely clear localStorage');
    
    // Optionally backup the old data before clearing
    localStorage.setItem('holidayz-data-backup', savedData);
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
}
