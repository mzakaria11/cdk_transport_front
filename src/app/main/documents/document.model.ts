export interface IDocument {
    name: string;
    body: Array<{
        rows: any[];
        total?: number;
        destinataire: any;
        type: any;
      }>;
    action?: string;
    info: {
        title: string,
        subject: string,
        author?: string,
        keywords?: string,
    };
} 