import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FournisseurListComponent } from './fournisseur-list/fournisseur-list.component';
import { FournisseurDetailComponent } from './fournisseur-detail/fournisseur-detail.component';
import { RouterModule, Routes } from '@angular/router';
import { FournisseurListService } from './fournisseur-list/fournisseur-list.service';
import { FournisseurDetailService } from './fournisseur-detail/fournisseur-detail.service';
import { CoreSidebarModule } from '@core/components';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CoreCommonModule } from '@core/common.module';
import { Role } from 'app/auth/models';
import { AddFournisseurSidebarComponent } from './fournisseur-list/sidebar/add-fournisseur-sidebar/add-fournisseur-sidebar.component';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';

// routing
const routes: Routes = [
  {
    path: 'list',
    component: FournisseurListComponent,
    resolve: {
      als: FournisseurListService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], animation: 'FournisseurListComponent' }
  },
  {
    path: 'detail/:id',
    component: FournisseurDetailComponent,
    resolve: {
      data: FournisseurDetailService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], path: 'detail/:id', animation: 'FournisseurDetailComponent' }
  },
  {
    path: 'edit/:id',
    component: FournisseurDetailComponent,
    resolve: {
      data: FournisseurDetailService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN], path: 'edit/:id', animation: 'FournisseurEditComponent' }
  }
];

@NgModule({
  declarations: [
    FournisseurListComponent,
    FournisseurDetailComponent,
    AddFournisseurSidebarComponent
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
export class FournisseurModule { }
