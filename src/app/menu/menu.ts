import { CoreMenu } from '@core/types';

export const menu: CoreMenu[] = [
  
  // Articles Client
  {
    id: 'products',
    type: 'section',
    title: 'Products section',
    translate: 'MENU.PRODUCTS.SECTION',
    role: ['Client'],
    icon: 'package',
    children: [
      {
        id: 'add',
        title: 'Commande en cours',
        type: 'item',
        role: ['Client'],
        icon: 'grid',
        url: 'dashboard'
      }
    ]
  },

  // Articles & Zone depot

  {
    id: 'products',
    type: 'section',
    title: 'Products section',
    translate: 'MENU.PRODUCTS.SECTION',
    role: ['Admin', 'Super_admin', 'User'],
    icon: 'package',
    children: [
      {
        id: 'product',
        title: 'product',
        translate: 'MENU.PRODUCTS.PRODUCT.COLLAPSIBLE',
        type: 'collapsible',
        role: ['Admin', 'Super_admin', 'User', 'Client'],
        icon: 'shopping-bag',
        children: [
          {
            id: 'list',
            title: 'List',
            translate: 'MENU.PRODUCTS.PRODUCT.LIST',
            type: 'item',
            icon: 'circle',
            url: 'articles/list'
          },
          {
            id: 'add',
            title: 'Add',
            translate: 'MENU.PRODUCTS.PRODUCT.ADD',
            type: 'item',
            role: ['Admin', 'Super_admin', 'User'],
            icon: 'circle',
            url: 'articles/new'
          }
        ]
      },
      {
        id: 'zone',
        type: 'item',
        role: ['Admin', 'Super_admin', 'User'],
        title: 'Zone depot',
        icon: 'codepen',
        url: 'zone/list'
      }
    ]
  },

  // Fournisseur & destinataire & transporteur

  {
    id: 'four_des_trp',
    type: 'section',
    role: ['Admin', 'Super_admin', 'User'],
    title: ' Fournisseur et Desinateur',
    icon: 'package',
    children: [
      {
        id: 'fournisseur',
        title: 'Fournisseur',
        type: 'collapsible',
        role: ['Admin', 'Super_admin', 'User'],
        icon: 'layout',
        children: [
          {
            id: 'list',
            title: 'List',
            translate: 'MENU.PRODUCTS.PRODUCT.LIST',
            type: 'item',
            icon: 'circle',
            url: 'fournisseurs/list'
          },
          // {
          //   id: 'add',
          //   title: 'Add',
          //   translate: 'MENU.PRODUCTS.PRODUCT.ADD',
          //   type: 'item',
          //   role: ['Admin', 'Super_admin'],
          //   icon: 'circle',
          //   url: 'fournisseurs/new'
          // }
        ]
      },
      {
        id: 'destinataire',
        title: 'Destinataire',
        type: 'collapsible',
        role: ['Admin', 'Super_admin', 'User'],
        icon: 'shopping-cart',
        children: [
          {
            id: 'list',
            title: 'List',
            translate: 'MENU.PRODUCTS.PRODUCT.LIST',
            type: 'item',
            icon: 'circle',
            url: 'destinataires/list'
          },
          {
            id: 'add',
            title: 'Add',
            translate: 'MENU.PRODUCTS.PRODUCT.ADD',
            type: 'item',
            role: ['Admin', 'Super_admin'],
            icon: 'circle',
            url: 'destinataires/new'
          }
        ]
      },
      {
        id: 'departement',
        title: 'Departement',
        type: 'collapsible',
        role: ['Admin', 'Super_admin', 'User'],
        icon: 'compass',
        children: [
          {
            id: 'list',
            title: 'List',
            translate: 'MENU.PRODUCTS.PRODUCT.LIST',
            type: 'item',
            icon: 'circle',
            url: 'departement/list'
          },
          {
            id: 'add',
            title: 'Add',
            translate: 'MENU.PRODUCTS.PRODUCT.ADD',
            type: 'item',
            role: ['Admin', 'Super_admin'],
            icon: 'circle',
            url: 'departement/new'
          }
        ]
      }
    ]
  },
  
  // Bon commande

  {
    id: 'bc',
    type: 'section',
    title: ' Section Bon de commande',
    role: ['Admin', 'Super_admin', 'User'],
    icon: 'package',
    children: [
      // {
      //   id: 'bce',
      //   title: 'BC Entrée',
      //   type: 'collapsible',
      //   role: ['Admin', 'Super_admin'],
      //   icon: 'file-plus',
      //   children: [
      //     {
      //       id: 'list',
      //       title: 'List',
      //       translate: 'MENU.PRODUCTS.PRODUCT.LIST',
      //       type: 'item',
      //       icon: 'circle',
      //       url: 'bce/list'
      //     },
      //     {
      //       id: 'add',
      //       title: 'Add',
      //       translate: 'MENU.PRODUCTS.PRODUCT.ADD',
      //       type: 'item',
      //       role: ['Admin', 'Super_admin'],
      //       icon: 'circle',
      //       url: 'bce/new'
      //     }
      //   ]
      // },
      {
        id: 'bcs',
        title: 'BC Sortie',
        type: 'collapsible',
        role: ['Admin', 'Super_admin', 'Client', 'User'],
        icon: 'file-minus',
        children: [
          {
            id: 'list',
            title: 'List',
            translate: 'MENU.PRODUCTS.PRODUCT.LIST',
            type: 'item',
            icon: 'circle',
            url: 'bcs/list'
          },
          {
            id: 'add',
            title: 'Add',
            translate: 'MENU.PRODUCTS.PRODUCT.ADD',
            type: 'item',
            role: ['Admin', 'Super_admin', 'User'],
            icon: 'circle',
            url: 'bcs/mnew'
          },
          {
            id: 'import',
            title: 'Import',
            type: 'item',
            role: ['Admin', 'Super_admin', 'User'],
            icon: 'circle',
            url: 'bcs/new'
          }
        ]
      }
    ]
  },

  // Bon livraison

  {
    id: 'bl',
    type: 'section',
    role: ['Admin', 'Super_admin', 'User'],
    title: ' Section Bon de livraison',
    icon: 'package',
    children: [
      {
        id: 'ble',
        title: 'BL Entrée',
        type: 'collapsible',
        role: ['Admin', 'Super_admin', 'User', 'Client'],
        icon: 'log-in',
        children: [
          {
            id: 'list',
            title: 'List',
            translate: 'MENU.PRODUCTS.PRODUCT.LIST',
            type: 'item',
            icon: 'circle',
            url: 'ble/list'
          },
          // {
          //   id: 'add',
          //   title: 'Add',
          //   translate: 'MENU.PRODUCTS.PRODUCT.ADD',
          //   type: 'item',
          //   icon: 'circle',
          //   url: 'ble/new'
          // }
        ]
      },
      {
        id: 'bls',
        title: 'BL Sortie',
        type: 'collapsible',
        role: ['Admin', 'Super_admin', 'User'],
        icon: 'log-out',
        children: [
          {
            id: 'list',
            title: 'List',
            translate: 'MENU.PRODUCTS.PRODUCT.LIST',
            type: 'item',
            icon: 'circle',
            url: 'bls/list'
          },
          // {
          //   id: 'add',
          //   title: 'Add',
          //   translate: 'MENU.PRODUCTS.PRODUCT.ADD',
          //   type: 'item',
          //   icon: 'circle',
          //   url: 'bls/new'
          // }
        ]
      }
    ]
  },

  // Unite manutention

  {
    id: 'um',
    type: 'section',
    role: ['Admin', 'Super_admin', 'User'],
    title: ' Section Unité manutention',
    icon: 'package',
    children: [
      {
        id: 'ume',
        title: 'UM Entrée',
        type: 'collapsible',
        role: ['Admin', 'Super_admin', 'User', 'Client'],
        icon: 'plus-square',
        children: [
          {
            id: 'list',
            title: 'List',
            translate: 'MENU.PRODUCTS.PRODUCT.LIST',
            type: 'item',
            icon: 'circle',
            url: 'ume/list'
          },
          // {
          //   id: 'add',
          //   title: 'Add',
          //   translate: 'MENU.PRODUCTS.PRODUCT.ADD',
          //   type: 'item',
          //   icon: 'circle',
          //   url: 'ume/new'
          // }
        ]
      },
      {
        id: 'ums',
        title: 'UM Sortie',
        type: 'collapsible',
        role: ['Admin', 'Super_admin', 'User'],
        icon: 'x-square',
        children: [
          {
            id: 'list',
            title: 'List',
            translate: 'MENU.PRODUCTS.PRODUCT.LIST',
            type: 'item',
            icon: 'circle',
            url: 'ums/list'
          },
          // {
          //   id: 'add',
          //   title: 'Add',
          //   translate: 'MENU.PRODUCTS.PRODUCT.ADD',
          //   type: 'item',
          //   icon: 'circle',
          //   url: 'ums/new'
          // }
        ]
      }
    ]
  },

  // letre voiture

  {
    id: 'lv',
    type: 'section',
    title: ' Section Lettre de voiture',
    role: ['Admin', 'Super_admin', 'User'],
    icon: 'package',
    children: [
      {
        id: 'lve',
        title: 'LV Entrée',
        type: 'collapsible',
        role: ['Admin', 'Super_admin', 'User', 'Client'],
        icon: 'truck',
        children: [
          {
            id: 'list',
            title: 'List',
            translate: 'MENU.PRODUCTS.PRODUCT.LIST',
            type: 'item',
            
            icon: 'circle',
            url: 'lve/list'
          },
          {
            id: 'add',
            title: 'Add',
            translate: 'MENU.PRODUCTS.PRODUCT.ADD',
            type: 'item',
            role: ['Admin', 'Super_admin', 'User'],
            icon: 'circle',
            url: 'lve/new'
          }
        ]
      },
       {
        id: 'lvs',
        title: 'LV Sortie',
        type: 'collapsible',
        icon: 'truck',
        role: ['Admin','Super_admin'],
         children: [
         {
             id: 'ajouter',
            title: 'ajouter',
            type: 'item',
             icon: 'circle',
            url: 'lvs/new'
         },
         {
          id: 'add',
          title: 'Add',
          translate: 'MENU.PRODUCTS.PRODUCT.ADD',
          type: 'item',
          role: ['Admin', 'Super_admin', 'User'],
          icon: 'circle',
          url: 'lve/new'
        }
       ]
     }
    ]
  },

  // Script

  {
    id: 'Sc',
    type: 'section',
    title: ' Section Répartition',
    role: ['Admin', 'Super_admin', 'User'],
    icon: 'package',
    children: [
      {
        id: 'lve',
        title: 'Répartiton',
        type: 'collapsible',
        role: ['Admin', 'Super_admin', 'User'],
        icon: 'database',
        children: [
          {
            id: 'sc-rep',
            title: 'En cours',
            type: 'item',
            role: ['Admin', 'Super_admin', 'User'],
            icon: 'circle',
            url: 'repartition/list'
          },
          {
            id: 'sc-rep',
            title: 'Historique',
            type: 'item',
            role: ['Admin', 'Super_admin', 'User'],
            icon: 'circle',
            url: 'repartition/historique'
          },
          // {
          //   id: 'sc-rep',
          //   title: '',
          //   type: 'item',
          //   role: ['Admin', 'Super_admin', 'Client'],
          //   icon: 'circle',
          //   url: 'repartition/statistique'
          // },
        ]
      },
      {
        id: 'sc-rep',
        type: 'item',
        role: ['Admin', 'Super_admin', 'Client', 'User'],
        title: 'Statistique',
        icon: 'trello',
        url: 'repartition/statistique'
      }
    ]
  },
  // section transport
  {
    id: 'transport',
    type: 'section',
    role: ['Admin', 'Super_admin', 'User'],
    title: ' Section Transport',
    icon: 'package',
    children: [
      {
        id: 'transporteur',
        title: 'Transporteur',
        type: 'collapsible',
        role: ['Admin', 'Super_admin', 'User'],
        icon: 'user',
        children: [
          {
            id: 'list',
            title: 'List',
            translate: 'MENU.PRODUCTS.PRODUCT.LIST',
            type: 'item',
            icon: 'circle',
            url: 'transporteurs/list'
          },
          {
            id: 'add',
            title: 'Add',
            translate: 'MENU.PRODUCTS.PRODUCT.ADD',
            type: 'item',
            role: ['Admin', 'Super_admin'],
            icon: 'circle',
            url: 'transporteurs/new'
          }
        ]
      },
      {
        id: 'tarifs',
        title: 'Tarifs',
        type: 'collapsible',
        role: ['Admin', 'Super_admin', 'User'],
        icon: 'dollar-sign',
        children: [
          {
            id: 'tarifaffadd',
            title: 'Ajouter Tarif Affretement',
            type: 'item',
            icon: 'circle',
            url: 'tarifaff/new'
          },
          {
            id: 'tarifafflist',
            title: 'Tarif Affretement List',

            type: 'item',
            role: ['Admin', 'Super_admin'],
            icon: 'circle',
            url: 'tarifaff/list'
          },
          {
            id: 'tarifmssadd',
            title: 'Ajouter Tarif Messagerie',
            type: 'item',
            icon: 'circle',
            url: 'tarifmss/new'
          },
          {
            id: 'tarifmsslist',
            title: 'Tarif Messagerie List',
            type: 'item',
            role: ['Admin', 'Super_admin'],
            icon: 'circle',
            url: 'tarifmss/list'
          }
        ]
      },

      {
        id: 'taxes',
        title: 'Taxes',
        type: 'collapsible',
        role: ['Admin', 'Super_admin', 'User'],
        icon: 'anchor',
        children: [
          {
            id: 'list',
            title: 'List',
            translate: 'MENU.PRODUCTS.PRODUCT.LIST',
            type: 'item',
            icon: 'circle',
            url: 'destinataires/list'
          },
          {
            id: 'add',
            title: 'Add',
            translate: 'MENU.PRODUCTS.PRODUCT.ADD',
            type: 'item',
            role: ['Admin', 'Super_admin'],
            icon: 'circle',
            url: 'destinataires/new'
          }
        ]
      }
    ]
  }

];
