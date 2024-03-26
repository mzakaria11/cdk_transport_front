export class EmailFakeData {
  public static emails = [
    {
      id: 1,
      from: {
        email: 'ivandombes@yahoo.fr',
        name: 'SARL ID R2N - CENTRE RNPC',
        avatar: 'z55'
      },
      to: [
        {
          name: 'me',
          email: 'no-replay@crossdock.fr'
        }
      ],
      subject: 'Articles en répture',
      cc: [],
      bcc: [],
      message:
        '<p>Bonjour SARL ID R2N,</p><p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Explicabo asperiores inventore saepe nisi ullam, repudiandae consequatur optio vero unde voluptate, voluptatibus eaque beatae dignissimos odit tenetur? Consequatur, voluptatibus! Tempora maiores ullam aperiam ipsum at nam molestias officia rerum nobis doloribus tenetur quis rem quidem quo ab dolore, doloremque architecto. Fugit quaerat impedit quis nulla nemo cumque delectus dolor necessitatibus, ea beatae quia, nam incidunt suscipit veritatis ipsum. Ratione veritatis voluptatem culpa voluptas officia perspiciatis aliquid. Repudiandae ea sequi dicta aperiam modi itaque ratione impedit dolor culpa natus? Deserunt enim tempora qui incidunt sapiente assumenda non, fugit eligendi sed. Consectetur nisi, earum eveniet necessitatibus animi dolorum voluptatem deserunt. Sapiente, voluptatem magnam? </p>',
      attachments: [],
      isStarred: false,
      labels: ['private'],
      time: 'Mon Jul 3 2023 07:46:00 GMT+0000 (GMT)',
      replies: [],
      folder: 'inbox',
      isRead: true
    },
    {
      id: 2,
      from: {
        email: 'rosetta.corbioli@ge-sante.fr',
        name: 'SARL ARHD1 - CENTRE RNPC',
        avatar: 'z17'
      },
      to: [
        {
          name: 'me',
          email: 'no-replay@crossdock.fr'
        }
      ],
      subject: 'Arivage',
      cc: ['vrushankbrahmshatriya@mail.com'],
      bcc: ['menka@mail.com'],
      message:
      '<p>Hi SARL ARHD1,</p><p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Explicabo asperiores inventore saepe nisi ullam, repudiandae consequatur optio vero unde voluptate, voluptatibus eaque beatae dignissimos odit tenetur? Consequatur, voluptatibus! Tempora maiores ullam aperiam ipsum at nam molestias officia rerum nobis doloribus tenetur quis rem quidem quo ab dolore, doloremque architecto. Fugit quaerat impedit quis nulla nemo cumque delectus dolor necessitatibus, ea beatae quia, nam incidunt suscipit veritatis ipsum. Ratione veritatis voluptatem culpa voluptas officia perspiciatis aliquid. Repudiandae ea sequi dicta aperiam modi itaque ratione impedit dolor culpa natus? Deserunt enim tempora qui incidunt sapiente assumenda non, fugit eligendi sed. Consectetur nisi, earum eveniet necessitatibus animi dolorum voluptatem deserunt. Sapiente, voluptatem magnam? </p>',
      attachments: [],
      isStarred: true,
      labels: ['company', 'private'],
      time: 'Tue Jun 15 2023 07:55:00 GMT+0000 (GMT)',
      replies: [],
      folder: 'inbox',
      isRead: true
    },
    {
      id: 4,
      from: {
        email: 'pascal.rasser@sfr.fr',
        name: 'SASU PFR1 - CENTRE RNPC',
        avatar: 'z84'
      },
      to: [
        {
          name: 'me',
          email: 'no-replay@crossdock.fr'
        }
      ],
      subject: 'Articles en répture',
      cc: [],
      bcc: [],
      message:
      '<p>Hi SASU PFR1,</p><p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Explicabo asperiores inventore saepe nisi ullam, repudiandae consequatur optio vero unde voluptate, voluptatibus eaque beatae dignissimos odit tenetur? Consequatur, voluptatibus! Tempora maiores ullam aperiam ipsum at nam molestias officia rerum nobis doloribus tenetur quis rem quidem quo ab dolore, doloremque architecto. Fugit quaerat impedit quis nulla nemo cumque delectus dolor necessitatibus, ea beatae quia, nam incidunt suscipit veritatis ipsum. Ratione veritatis voluptatem culpa voluptas officia perspiciatis aliquid. Repudiandae ea sequi dicta aperiam modi itaque ratione impedit dolor culpa natus? Deserunt enim tempora qui incidunt sapiente assumenda non, fugit eligendi sed. Consectetur nisi, earum eveniet necessitatibus animi dolorum voluptatem deserunt. Sapiente, voluptatem magnam? </p>',
      attachments: [],
      isStarred: false,
      labels: ['important'],
      time: 'Fri Jun 08 2023 09:04:10 GMT+0000 (GMT)',
      replies: [],
      folder: 'inbox',
      isRead: true
    }
  ];

  public static folders = [
    {
      id: 0,
      handle: 'inbox',
      title: 'Inbox',
      icon: 'mail'
    },
    {
      id: 1,
      handle: 'sent',
      title: 'Sent',
      icon: 'send'
    },
    {
      id: 2,
      handle: 'draft',
      title: 'Draft',
      icon: 'edit-2'
    },
    {
      id: 3,
      handle: 'spam',
      title: 'Spam',
      icon: 'info'
    },
    {
      id: 4,
      handle: 'trash',
      title: 'Trash',
      icon: 'trash'
    }
  ];

  public static labels = [
    {
      id: 0,
      handle: 'personal',
      title: 'Personal',
      color: 'bullet-success'
    },
    {
      id: 1,
      handle: 'company',
      title: 'Company',
      color: 'bullet-primary'
    },
    {
      id: 2,
      handle: 'important',
      title: 'Important',
      color: 'bullet-warning'
    },
    {
      id: 3,
      handle: 'private',
      title: 'Private',
      color: 'bullet-danger'
    }
  ];
}
