export interface WorkspaceTheme {
    id?: string;
    workspaceId: string;
    theme: 'light' | 'dark' | 'system';
    primaryColor: string | null;
    textColor: string | null;
    backgroundColor: string | null;
    sidebarColor: string | null;
    accentColor: string | null;
}

export interface UpdateWorkspaceThemeData {
    theme?: 'light' | 'dark' | 'system';
    primaryColor?: string;
    textColor?: string;
    backgroundColor?: string;
    sidebarColor?: string;
    accentColor?: string;
}
