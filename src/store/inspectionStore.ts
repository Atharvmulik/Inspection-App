import { create } from 'zustand';
import { Inspection, InspectionStatus, PriorityLevel, TimelineEvent, Document, Evidence, ChecklistSection, FinalReport } from '@/types';
import { dummyInspections } from '@/services/dummyData';

interface InspectionStore {
  inspections: Inspection[];
  currentInspection: Inspection | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: InspectionStatus;
    priority?: PriorityLevel;
    searchQuery?: string;
  };
  
  // Actions
  fetchInspections: () => Promise<void>;
  setCurrentInspection: (inspection: Inspection | null) => void;
  getInspectionById: (id: string) => Inspection | undefined;
  updateInspectionStatus: (id: string, status: InspectionStatus) => void;
  updateDocumentStatus: (inspectionId: string, documentId: string, status: Document['status'], remarks?: string) => void;
  addTimelineEvent: (inspectionId: string, event: Omit<TimelineEvent, 'id' | 'inspectionId'>) => void;
  addEvidence: (inspectionId: string, evidence: Omit<Evidence, 'id' | 'inspectionId'>) => void;
  removeEvidence: (inspectionId: string, evidenceId: string) => void;
  updateChecklistItem: (inspectionId: string, sectionId: string, itemId: string, updates: Partial<ChecklistSection['items'][0]>) => void;
  submitFinalReport: (inspectionId: string, report: Omit<FinalReport, 'id' | 'inspectionId'>) => void;
  scheduleVisit: (inspectionId: string, date: string, remarks?: string) => void;
  setFilters: (filters: Partial<InspectionStore['filters']>) => void;
  getFilteredInspections: () => Inspection[];
  getStatistics: () => {
    total: number;
    pending: number;
    scheduled: number;
    inProgress: number;
    completed: number;
    overdue: number;
    highPriority: number;
  };
}

export const useInspectionStore = create<InspectionStore>((set, get) => ({
  inspections: dummyInspections,
  currentInspection: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchInspections: async () => {
    set({ isLoading: true });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({ isLoading: false, inspections: dummyInspections });
  },

  setCurrentInspection: (inspection) => {
    set({ currentInspection: inspection });
  },

  getInspectionById: (id) => {
    return get().inspections.find(i => i.id === id);
  },

  updateInspectionStatus: (id, status) => {
    set(state => ({
      inspections: state.inspections.map(inspection =>
        inspection.id === id
          ? { ...inspection, status, updatedAt: new Date().toISOString() }
          : inspection
      ),
    }));
  },

  updateDocumentStatus: (inspectionId, documentId, status, remarks) => {
    set(state => ({
      inspections: state.inspections.map(inspection =>
        inspection.id === inspectionId
          ? {
              ...inspection,
              documents: inspection.documents.map(doc =>
                doc.id === documentId
                  ? { ...doc, status, remarks, verifiedAt: new Date().toISOString() }
                  : doc
              ),
              updatedAt: new Date().toISOString(),
            }
          : inspection
      ),
    }));
  },

  addTimelineEvent: (inspectionId, event) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: `event-${Date.now()}`,
      inspectionId,
    };
    
    set(state => ({
      inspections: state.inspections.map(inspection =>
        inspection.id === inspectionId
          ? {
              ...inspection,
              timeline: [...inspection.timeline, newEvent],
              updatedAt: new Date().toISOString(),
            }
          : inspection
      ),
    }));
  },

  addEvidence: (inspectionId, evidence) => {
    const newEvidence: Evidence = {
      ...evidence,
      id: `evidence-${Date.now()}`,
      inspectionId,
    };
    
    set(state => ({
      inspections: state.inspections.map(inspection =>
        inspection.id === inspectionId
          ? {
              ...inspection,
              evidence: [...inspection.evidence, newEvidence],
              updatedAt: new Date().toISOString(),
            }
          : inspection
      ),
    }));
  },

  removeEvidence: (inspectionId, evidenceId) => {
    set(state => ({
      inspections: state.inspections.map(inspection =>
        inspection.id === inspectionId
          ? {
              ...inspection,
              evidence: inspection.evidence.filter(e => e.id !== evidenceId),
              updatedAt: new Date().toISOString(),
            }
          : inspection
      ),
    }));
  },

  updateChecklistItem: (inspectionId, sectionId, itemId, updates) => {
    set(state => ({
      inspections: state.inspections.map(inspection =>
        inspection.id === inspectionId
          ? {
              ...inspection,
              checklist: inspection.checklist.map(section =>
                section.id === sectionId
                  ? {
                      ...section,
                      items: section.items.map(item =>
                        item.id === itemId ? { ...item, ...updates } : item
                      ),
                    }
                  : section
              ),
              updatedAt: new Date().toISOString(),
            }
          : inspection
      ),
    }));
  },

  submitFinalReport: (inspectionId, report) => {
    const newReport: FinalReport = {
      ...report,
      id: `report-${Date.now()}`,
      inspectionId,
    };
    
    set(state => ({
      inspections: state.inspections.map(inspection =>
        inspection.id === inspectionId
          ? {
              ...inspection,
              finalReport: newReport,
              status: report.recommendation === 'approve' ? 'approved' : 
                      report.recommendation === 'reject' ? 'rejected' : 're_inspection_required',
              updatedAt: new Date().toISOString(),
            }
          : inspection
      ),
    }));
  },

  scheduleVisit: (inspectionId, date, remarks) => {
    set(state => ({
      inspections: state.inspections.map(inspection =>
        inspection.id === inspectionId
          ? {
              ...inspection,
              scheduledDate: date,
              status: 'scheduled',
              notes: remarks || inspection.notes,
              updatedAt: new Date().toISOString(),
            }
          : inspection
      ),
    }));
  },

  setFilters: (filters) => {
    set(state => ({ filters: { ...state.filters, ...filters } }));
  },

  getFilteredInspections: () => {
    const { inspections, filters } = get();
    
    return inspections.filter(inspection => {
      if (filters.status && inspection.status !== filters.status) return false;
      if (filters.priority && inspection.priority !== filters.priority) return false;
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSchool = inspection.school.name.toLowerCase().includes(query);
        const matchesId = inspection.id.toLowerCase().includes(query);
        const matchesCity = inspection.school.city.toLowerCase().includes(query);
        if (!matchesSchool && !matchesId && !matchesCity) return false;
      }
      return true;
    });
  },

  getStatistics: () => {
    const { inspections } = get();
    
    return {
      total: inspections.length,
      pending: inspections.filter(i => i.status === 'pending' || i.status === 'assigned').length,
      scheduled: inspections.filter(i => i.status === 'scheduled').length,
      inProgress: inspections.filter(i => i.status === 'document_verification' || i.status === 'in_progress').length,
      completed: inspections.filter(i => i.status === 'completed' || i.status === 'approved' || i.status === 'rejected').length,
      overdue: inspections.filter(i => i.isOverdue).length,
      highPriority: inspections.filter(i => i.priority === 'high' || i.priority === 'urgent').length,
    };
  },
}));
