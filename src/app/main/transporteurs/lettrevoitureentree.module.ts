import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LettrevoitureentreeListComponent } from './lettrevoitureentree-list/lettrevoitureentree-list.component';
import { LettrevoitureentreeNewComponent } from './lettrevoitureentree-new/lettrevoitureentree-new.component';
import { LettrevoitureentreeDetailComponent } from './lettrevoitureentree-detail/lettrevoitureentree-detail.component';
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
import { LettrevoitureentreListService } from './lettrevoitureentree-list/lettrevoitureentre-list.service';
import { LettrevoitureentreDetailService } from './lettrevoitureentree-detail/lettrevoitureentre-detail.service';
import { LettrevoitureentreNewService } from './lettrevoitureentree-new/lettrevoitureentre-new.service';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { Role } from 'app/auth/models';
import { FileUploadModule } from 'ng2-file-upload';
import { LettrevoitureNewFormComponent } from './lettrevoiture-new-form/lettrevoiture-new-form.component';

const routes: Routes = [
  {
    path: 'list',
    component: LettrevoitureentreeListComponent,
    resolve: {
      lvels: LettrevoitureentreListService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User, Role.Client], animation: 'LettrevoitureentreeListComponent' }
  },
  {
    path: 'detail/:id',
    component: LettrevoitureentreeDetailComponent,
    resolve: {
      data: LettrevoitureentreDetailService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User, Role.Client], path: 'detail/:id', animation: 'LettrevoitureentreeDetailComponent' }
  },
  {
    path: 'edit/:id',
    component: LettrevoitureentreeDetailComponent,
    resolve: {
      data: LettrevoitureentreDetailService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], path: 'edit/:id', animation: 'LettrevoitureentreeDetailComponent' }
  },
  {
    path: 'new',
    component: LettrevoitureNewFormComponent,
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User] }
  }
];

@NgModule({
  declarations: [
    LettrevoitureentreeListComponent,
    LettrevoitureentreeNewComponent,
    LettrevoitureentreeDetailComponent,
    LettrevoitureNewFormComponent
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
export class LettrevoitureentreeModule { }
