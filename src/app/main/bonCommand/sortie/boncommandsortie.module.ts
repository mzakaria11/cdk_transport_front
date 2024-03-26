import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoncommandsortieListComponent } from './boncommandsortie-list/boncommandsortie-list.component';
import { BoncommandsortieDetailComponent } from './boncommandsortie-detail/boncommandsortie-detail.component';
import { BoncommandsortieNewComponent } from './boncommandsortie-new/boncommandsortie-new.component';
import { RouterModule, Routes } from '@angular/router';
import { BoncommandsortieListService } from './boncommandsortie-list/boncommandsortie-list.service';
import { BoncommandsortieDetailService } from './boncommandsortie-detail/boncommandsortie-detail.service';
import { BoncommandsortieNewService } from './boncommandsortie-new/boncommandsortie-new.service';
import { CoreSidebarModule } from '@core/components';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CoreCommonModule } from '@core/common.module';
import { FileUploadModule } from 'ng2-file-upload';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { Role } from 'app/auth/models';
import { BoncomandsortieManuelAddComponent } from './boncomandsortie-manuel-add/boncomandsortie-manuel-add.component';
import { DetailBcsComponent } from './detail-bcs/detail-bcs.component';
import { NewBcsComponent } from './new-bcs/new-bcs.component';
import { DetailBcsService } from './detail-bcs/detail-bcs.service';

const routes: Routes = [
  {
    path: 'list',
    component: BoncommandsortieListComponent,
    resolve: {
      bcels: BoncommandsortieListService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.Client, Role.User], animation: 'BoncommandsortieListComponent' }
  },
  {
    path: 'detail/:id',
    component: DetailBcsComponent,
    resolve: {
      data: DetailBcsService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.Client, Role.User], path: 'detail/:id', animation: 'DetailBcsComponent' }
  },
  {
    path: 'edit/:id',
    component: DetailBcsComponent,
    resolve: {
      data: DetailBcsService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN], path: 'edit/:id', animation: 'DetailBcsComponent' }
  },
  {
    path: 'new',
    component: BoncommandsortieNewComponent,
    resolve: {
      bcens: BoncommandsortieNewService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User] }
  },
  {
    path: 'mnew',
    component: BoncomandsortieManuelAddComponent,
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User] }
  }
];

@NgModule({
  declarations: [
    BoncommandsortieListComponent,
    BoncommandsortieDetailComponent,
    BoncommandsortieNewComponent,
    BoncomandsortieManuelAddComponent,
    DetailBcsComponent,
    NewBcsComponent
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
    FileUploadModule,
  ]
})
export class BoncommandsortieModule { }
