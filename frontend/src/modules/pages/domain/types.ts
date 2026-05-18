export interface Page {
    id: string;
    title: string;
    content: string;
    contentHtml: string;
    workspaceSlug: string;
    companyId?: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
}

export interface CreatePageData {
    id?: string;
    title: string;
    content?: string;
    companyId?: string;
}
