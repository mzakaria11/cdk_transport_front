import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';

import { CoreSidebarModule } from '@core/components';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { CoreCommonModule } from '@core/common.module';

import { ArticleListComponent } from './article-list/article-list.component';
import { ArticleListService } from './article-list/article-list.service';

import { ArticleDetailComponent } from './article-detail/article-detail.component';
import { ArticleDetailService } from './article-detail/article-detail.service';

import { ArticleNewComponent } from './article-new/article-new.component';
import { ArticleNewService } from './article-new/article-new.service';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { Role } from 'app/auth/models';
import { AuthGuard } from 'app/auth/helpers';

// routing
const routes: Routes = [
  {
    path: 'list',
    component: ArticleListComponent,
    resolve: {
      als: ArticleListService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.Client, Role.User], animation: 'ArticleListComponent' }
  },
  {
    path: 'detail/:id',
    component: ArticleDetailComponent,
    resolve: {
      data: ArticleDetailService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.Client, Role.User], animation: 'ArticleDetailComponent' }
  },
  {
    path: 'edit/:id',
    component: ArticleDetailComponent,
    canActivate: [AuthGuard],
    resolve: {
      data: ArticleDetailService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], animation: 'ArticleUpdateComponent' }
  },
  {
    path: 'new',
    component: ArticleNewComponent,
    canActivate: [AuthGuard],
    resolve: {
      ans: ArticleNewService
    },
    data: {roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], animation: 'ArticleNewComponent'}
  }
];

@NgModule({
  declarations: [
    ArticleListComponent,
    ArticleDetailComponent,
    ArticleNewComponent
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
  ],
  providers: [ArticleListService, ArticleDetailService]

})
export class ArticleModule { }
