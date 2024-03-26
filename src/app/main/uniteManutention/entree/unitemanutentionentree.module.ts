import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitemanutentionentreeListComponent } from './unitemanutentionentree-list/unitemanutentionentree-list.component';
import { UnitemanutentionentreeDetailComponent } from './unitemanutentionentree-detail/unitemanutentionentree-detail.component';
import { UnitemanutentionentreeNewComponent } from './unitemanutentionentree-new/unitemanutentionentree-new.component';
import { CoreSidebarModule } from '@core/components';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CoreCommonModule } from '@core/common.module';
import { RouterModule, Routes } from '@angular/router';
import { UnitemanutentionentreeDetailService } from './unitemanutentionentree-detail/unitemanutentionentree-detail.service';
import { UnitemanutentionentreeNewService } from './unitemanutentionentree-new/unitemanutentionentree-new.service';
import { UnitemanutentionentreeListService } from './unitemanutentionentree-list/unitemanutentionentree-list.service';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { Role } from 'app/auth/models';
import { DetailUmeComponent } from './detail-ume/detail-ume.component';
import { DetailUmeService } from './detail-ume/detail-ume.service';

const routes: Routes = [
  {
    path: 'list',
    component: UnitemanutentionentreeListComponent,
    resolve: {
      umels: UnitemanutentionentreeListService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User, Role.Client], animation: 'UnitemanutentionentreeListComponent' }
  },
  {
    path: 'detail/:id',
    component: DetailUmeComponent,
    resolve: {
      data: DetailUmeService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User, Role.Client], path: 'detail/:id', animation: 'UnitemanutentionentreeDetailComponent' }
  },
  {
    path: 'edit/:id',
    component: DetailUmeComponent,
    resolve: {
      data: DetailUmeService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], path: 'edit/:id', animation: 'UnitemanutentionentreeDetailComponent' }
  },
  {
    path: 'new/:id',
    component: UnitemanutentionentreeNewComponent,
    resolve: {
      umens: UnitemanutentionentreeNewService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], }
  }
];

@NgModule({
  declarations: [
    UnitemanutentionentreeListComponent,
    UnitemanutentionentreeDetailComponent,
    UnitemanutentionentreeNewComponent,
    DetailUmeComponent
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
export class UnitemanutentionentreeModule { }
