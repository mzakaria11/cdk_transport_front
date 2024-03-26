import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZonedepotDetailComponent } from './zonedepot-detail/zonedepot-detail.component';
import { ZonedepotListComponent } from './zonedepot-list/zonedepot-list.component';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
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
import { ZonedepotListService } from './zonedepot-list/zonedepot-list.service';
import { Role } from 'app/auth/models';

const routes: Routes = [
  {
    path: 'list',
    component: ZonedepotListComponent,
    resolve: {
      lvels: ZonedepotListService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], animation: 'ZoneListComponent' }
  }
];


@NgModule({
  declarations: [
    ZonedepotDetailComponent,
    ZonedepotListComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ContentHeaderModule,
    CoreCommonModule,
    FormsModule,
    NgbModule,
    NgSelectModule,
    Ng2FlatpickrModule,
    NgxDatatableModule,
    CorePipesModule,
    CoreDirectivesModule,
    CoreSidebarModule,
  ]
})
export class ZonedepotModule { }
