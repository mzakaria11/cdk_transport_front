import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitemanutentionsortieListComponent } from './unitemanutentionsortie-list/unitemanutentionsortie-list.component';
import { UnitemanutentionsortieNewComponent } from './unitemanutentionsortie-new/unitemanutentionsortie-new.component';
import { UnitemanutentionsortieDetailComponent } from './unitemanutentionsortie-detail/unitemanutentionsortie-detail.component';
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
import { UnitemanutentionsortieListService } from './unitemanutentionsortie-list/unitemanutentionsortie-list.service';
import { UnitemanutentionsortieDetailService } from './unitemanutentionsortie-detail/unitemanutentionsortie-detail.service';
import { UnitemanutentionsortieNewService } from './unitemanutentionsortie-new/unitemanutentionsortie-new.service';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { UnitemanutentionsortieDocumentComponent } from './unitemanutentionsortie-document/unitemanutentionsortie-document.component';
import { UnitemanutentionsortieDocumentService } from './unitemanutentionsortie-document/unitemanutentionsortie-document.service';
import { Role } from 'app/auth/models';
import { DetailUmsComponent } from './detail-ums/detail-ums.component';
import { DetailUmsService } from './detail-ums/detail-ums.service';


const routes: Routes = [
  {
    path: 'list',
    component: UnitemanutentionsortieListComponent,
    resolve: {
      umsls: UnitemanutentionsortieListService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], animation: 'UnitemanutentionsortieListComponent' }
  },
  {
    path: 'detail/:id',
    component: DetailUmsComponent,
    resolve: {
      data: DetailUmsService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], path: 'detail/:id', animation: 'DetailUmsComponent' }
  },
  {
    path: 'edit/:id',
    component: DetailUmsComponent,
    resolve: {
      data: DetailUmsService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], path: 'edit/:id', animation: 'DetailUmsComponent' }
  },
  // {
  //   path: 'new',
  //   component: UnitemanutentionsortieNewComponent,
  //   resolve: {
  //     umsns: UnitemanutentionsortieNewService
  //   }
  // },
  // {
  //   path: 'document/:id/colisage',
  //   component: UnitemanutentionsortieDocumentComponent,
  //   resolve: {
  //     data: UnitemanutentionsortieDocumentService
  //   },
  //   data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], path: 'document/:id' }
  // },
  // {
  //   path: 'document/:id/stock',
  //   component: UnitemanutentionsortieDocumentComponent,
  //   resolve: {
  //     data: UnitemanutentionsortieDocumentService
  //   },
  //   data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], path: 'document/:id' }
  // },
];

@NgModule({
  declarations: [
    UnitemanutentionsortieListComponent,
    UnitemanutentionsortieNewComponent,
    UnitemanutentionsortieDetailComponent,
    UnitemanutentionsortieDocumentComponent,
    DetailUmsComponent
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
export class UnitemanutentionsortieModule { }
