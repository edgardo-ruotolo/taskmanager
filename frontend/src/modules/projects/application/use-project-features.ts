import type { Project } from '../domain/types';

export interface ProjectFeatures {
    cyclesEnabled: boolean;
    modulesEnabled: boolean;
    intakeEnabled: boolean;
    archivesEnabled: boolean;
}

export const getProjectFeatures = (project?: Project | null): ProjectFeatures => ({
    cyclesEnabled: project?.cyclesEnabled ?? false,
    modulesEnabled: project?.modulesEnabled ?? false,
    intakeEnabled: project?.intakeEnabled ?? false,
    archivesEnabled: project?.archivesEnabled ?? false,
});
