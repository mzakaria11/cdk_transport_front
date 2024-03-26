import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BonlivraisonentreeListComponent } from './bonlivraisonentree-list/bonlivraisonentree-list.component';
import { BonlivraisonentreeDetailComponent } from './bonlivraisonentree-detail/bonlivraisonentree-detail.component';
import { BonlivraisonentreeNewComponent } from './bonlivraisonentree-new/bonlivraisonentree-new.component';
import { RouterModule, Routes } from '@angular/router';
import { BonlivraisonentreeNewService } from './bonlivraisonentree-new/bonlivraisonentree-new.service';
import { BonlivraisonentreeDetailService } from './bonlivraisonentree-detail/bonlivraisonentree-detail.service';
import { BonlivraisonentreeListService } from './bonlivraisonentree-list/bonlivraisonentree-list.service';
import { CoreSidebarModule } from '@core/components';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CoreCommonModule } from '@core/common.module';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { Role } from 'app/auth/models';
import { FileUploadModule } from 'ng2-file-upload';

const routes: Routes = [
  {
    path: 'list',
    component: BonlivraisonentreeListComponent,
    resolve: {
      blels: BonlivraisonentreeListService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User, Role.Client], animation: 'BonlivraisonentreeListComponent' }
  },
  {
    path: 'detail/:id',
    component: BonlivraisonentreeDetailComponent,
    resolve: {
      data: BonlivraisonentreeDetailService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User, Role.Client], path: 'detail/:id', animation: 'BonlivraisonentreeDetailComponent' }
  },
  {
    path: 'edit/:id',
    component: BonlivraisonentreeDetailComponent,
    resolve: {
      data: BonlivraisonentreeDetailService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], path: 'edit/:id', animation: 'BonlivraisonentreeDetailComponent' }
  },
  {
    path: 'new/:id',
    component: BonlivraisonentreeNewComponent,
    resolve: {
      blens: BonlivraisonentreeNewService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], path: 'new/:id'}
  }
];

@NgModule({
  declarations: [
    BonlivraisonentreeListComponent,
    BonlivraisonentreeDetailComponent,
    BonlivraisonentreeNewComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CoreCommonModule,
    FormsModule,
    NgbModule,
    NgSelectModule,
    NgxDatatableModule,
    CorePipesModule,
    CoreDirectivesModule,
    CoreSidebarModule,
    ContentHeaderModule,
    FileUploadModule
  ]
})
export class BonlivraisonentreeModule { }
