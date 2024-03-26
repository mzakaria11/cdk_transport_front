export interface Email {
    id: number;
    from: {
      email: string;
      name: string;
      avatar: string;
    };
    to: any[];
    subject: string;
    rep: Array<any>;
    info: Array<any>;
    message: string;
    attachments: [
      {
        fileName: string;
        thumbnail: string;
        url: string;
        size: string;
      }
    ];
    time: string;
  }
  