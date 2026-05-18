export type StateCategory = 'Backlog' | 'Unstarted' | 'Started' | 'Completed' | 'Cancelled';

export interface State {
    id: string;
    name: string;
    color: string;
    category: StateCategory;
    sequence: number;
    isDefault: boolean;
    stateGroupId: string;
}

export interface StateGroup {
    id: string;
    name: string;
    description?: string;
    isDefault: boolean;
    states: State[];
}

export interface CreateStateData {
    name: string;
    color: string;
    category: StateCategory;
    isDefault: boolean;
    stateGroupId: string;
}

export interface UpdateStateData {
    name?: string;
    color?: string;
    category?: StateCategory;
    sequence?: number;
}

export interface CreateStateGroupData {
    name: string;
    description?: string;
}

export interface UpdateStateGroupData {
    name?: string;
    description?: string;
}
