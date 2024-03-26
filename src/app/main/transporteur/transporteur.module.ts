import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransporteurListComponent } from './transporteur-list/transporteur-list.component';
import { TransporteurDetailComponent } from './transporteur-detail/transporteur-detail.component';
import { TransporteurNewComponent } from './transporteur-new/transporteur-new.component';
import { RouterModule, Routes } from '@angular/router';
import { TransporteurListService } from './transporteur-list/transporteur-list.service';
import { TransporteurDetailService } from './transporteur-detail/transporteur-detail.service';
import { TransporteurNewService } from './transporteur-new/transporteur-new.service';
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
    component: TransporteurListComponent,
    resolve: {
      tls: TransporteurListService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], animation: 'TransporteurListComponent' }
  },
  {
    path: 'detail/:id',
    component: TransporteurDetailComponent,
    resolve: {
      data: TransporteurDetailService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], path: 'detail/:id', animation: 'TransporteurDetailComponent' }
  },
  {
    path: 'edit/:id',
    component: TransporteurDetailComponent,
    resolve: {
      data: TransporteurDetailService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN], path: 'edit/:id', animation: 'TransporteurEditComponent' }
  },
  {
    path: 'new',
    component: TransporteurNewComponent,
    resolve: {
      tns: TransporteurNewService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN] }
  }
];

@NgModule({
  declarations: [
    TransporteurListComponent,
    TransporteurDetailComponent,
    TransporteurNewComponent,
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
export class TransporteurModule { }
