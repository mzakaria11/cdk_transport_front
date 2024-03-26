import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BonlivraisonsortieListComponent } from './bonlivraisonsortie-list/bonlivraisonsortie-list.component';
import { BonlivraisonsortieListService } from './bonlivraisonsortie-list/bonlivraisonsortie-list.service';
import { BonlivraisonsortieDetailComponent } from './bonlivraisonsortie-detail/bonlivraisonsortie-detail.component';
import { BonlivraisonsortieDetailService } from './bonlivraisonsortie-detail/bonlivraisonsortie-detail.service';
import { BonlivraisonsortieNewComponent } from './bonlivraisonsortie-new/bonlivraisonsortie-new.component';
import { BonlivraisonsortieNewService } from './bonlivraisonsortie-new/bonlivraisonsortie-new.service';
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

const routes: Routes = [
  {
    path: 'list',
    component: BonlivraisonsortieListComponent,
    resolve: {
      blsls: BonlivraisonsortieListService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], animation: 'BonlivraisonsortieListComponent' }
  },
  {
    path: 'detail/:id',
    component: BonlivraisonsortieDetailComponent,
    resolve: {
      data: BonlivraisonsortieDetailService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], path: 'detail/:id', animation: 'BonlivraisonsortieDetailComponent' }
  },
  {
    path: 'edit/:id',
    component: BonlivraisonsortieDetailComponent,
    resolve: {
      data: BonlivraisonsortieDetailService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], path: 'edit/:id', animation: 'BonlivraisonsortieDetailComponent' }
  },
  {
    path: 'new/:id',
    component: BonlivraisonsortieNewComponent,
    resolve: {
      blsns: BonlivraisonsortieNewService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], path: 'new/:id'}
  }
];

@NgModule({
  declarations: [
    BonlivraisonsortieListComponent,
    BonlivraisonsortieDetailComponent,
    BonlivraisonsortieNewComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CoreCommonModule,
    FormsModule,
    NgbModule,
    NgSelectModule,
    Ng2FlatpickrModule,
    NgxDatatableModule,
    CorePipesModule,
    CoreDirectivesModule,
    CoreSidebarModule,
    ContentHeaderModule
  ]
})
export class BonlivraisonsortieModule { }
