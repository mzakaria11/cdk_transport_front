import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestinataireListComponent } from './destinataire-list/destinataire-list.component';
import { DestinataireDetailComponent } from './destinataire-detail/destinataire-detail.component';
import { DestinataireNewComponent } from './destinataire-new/destinataire-new.component';
import { RouterModule, Routes } from '@angular/router';
import { DestinataireNewService } from './destinataire-new/destinataire-new.service';
import { DestinataireDetailService } from './destinataire-detail/destinataire-detail.service';
import { DestinataireListService } from './destinataire-list/destinataire-list.service';
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

// routing
const routes: Routes = [
  {
    path: 'list',
    component: DestinataireListComponent,
    resolve: {
      dls: DestinataireListService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], animation: 'DestinataireListComponent' }
  },
  {
    path: 'detail/:id',
    component: DestinataireDetailComponent,
    resolve: {
      data: DestinataireDetailService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], path: 'detail/:id', animation: 'DestinataireDetailComponent' }
  },
  {
    path: 'edit/:id',
    component: DestinataireDetailComponent,
    resolve: {
      data: DestinataireDetailService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], path: 'edit/:id', animation: 'DestinataireEditComponent' }
  },
  {
    path: 'new',
    component: DestinataireNewComponent,
    resolve: {
      dns: DestinataireNewService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User] }
  }
];

@NgModule({
  declarations: [
    DestinataireListComponent,
    DestinataireDetailComponent,
    DestinataireNewComponent
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
    ContentHeaderModule,
  ]
})
export class DestinataireModule { }
